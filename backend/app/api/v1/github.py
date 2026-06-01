"""GitHub integration API endpoints."""

import base64
from binascii import Error as Base64Error

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
import httpx

from app.api.v1.dependencies import get_current_user, get_db
from app.core.config import settings
from app.core.oauth import decrypt_token, encrypt_token
from app.middleware.rate_limit import limiter
from app.models.github_integration import GithubIntegration
from app.models.issue import Issue
from app.models.oauth_account import OAuthAccount
from app.models.review import Review
from app.models.user import User
from app.scanners.scanner_engine import InvalidCodeError, analyze_code
from app.schemas.github import (
    GitHubConnectRequest,
    GitHubIssueCreateRequest,
    GitHubIssueCreateResponse,
    GitHubProfileResponse,
    GitHubRepoResponse,
    GitHubRepoFileContentResponse,
    GitHubRepoFileItem,
    GitHubRepoFilesResponse,
    GitHubScanFileRequest,
    GitHubScanFileResponse,
)


router = APIRouter(prefix="/github", tags=["GitHub"])

SUPPORTED_FILE_LANGUAGES = {
    ".js": "javascript",
    ".jsx": "javascript",
    ".ts": "typescript",
    ".tsx": "typescript",
    ".py": "python",
    ".java": "java",
    ".cpp": "cpp",
    ".c": "c",
    ".cs": "csharp",
    ".go": "go",
    ".rs": "rust",
    ".php": "php",
    ".rb": "ruby",
}
MAX_IMPORT_FILE_BYTES = 300 * 1024


def _require_token_storage_ready() -> None:
    if settings.ENVIRONMENT == "production" and not settings.TOKEN_ENCRYPTION_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="TOKEN_ENCRYPTION_KEY is required to store GitHub tokens in production",
        )


def _github_headers(token: str) -> dict[str, str]:
    return {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }


def _language_from_path(path: str) -> str | None:
    lowered = path.lower()
    for extension, language in SUPPORTED_FILE_LANGUAGES.items():
        if lowered.endswith(extension):
            return language
    return None


def _is_likely_binary(content: bytes) -> bool:
    if b"\x00" in content:
        return True
    if not content:
        return False
    sample = content[:1024]
    text_bytes = sum(1 for byte in sample if byte in (9, 10, 13) or 32 <= byte <= 126)
    return (text_bytes / len(sample)) < 0.85


def _github_error(response: httpx.Response) -> HTTPException:
    if response.status_code == 401:
        return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="GitHub token expired or invalid. Reconnect GitHub.")
    if response.status_code == 403:
        return HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="GitHub rate limit reached or token scope is insufficient")
    if response.status_code == 404:
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="GitHub repository or file was not found")
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unable to fetch data from GitHub")


async def _get_repo_metadata(client: httpx.AsyncClient, token: str, owner: str, repo: str) -> dict:
    response = await client.get(
        f"https://api.github.com/repos/{owner}/{repo}",
        headers=_github_headers(token),
    )
    if response.status_code >= 400:
        raise _github_error(response)
    return response.json()


async def _get_github_content(
    client: httpx.AsyncClient,
    token: str,
    owner: str,
    repo: str,
    path: str,
    branch: str,
) -> dict | list:
    encoded_path = "/".join(part for part in path.strip("/").split("/") if part)
    url = f"https://api.github.com/repos/{owner}/{repo}/contents"
    if encoded_path:
        url = f"{url}/{encoded_path}"
    response = await client.get(url, headers=_github_headers(token), params={"ref": branch})
    if response.status_code >= 400:
        raise _github_error(response)
    return response.json()


def _decode_github_file(payload: dict) -> bytes:
    if payload.get("type") != "file" or payload.get("encoding") != "base64":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="GitHub item is not an importable text file")
    if int(payload.get("size") or 0) > MAX_IMPORT_FILE_BYTES:
        raise HTTPException(status_code=status.HTTP_413_CONTENT_TOO_LARGE, detail="GitHub file is larger than the 300KB import limit")
    raw_content = str(payload.get("content") or "")
    try:
        content = base64.b64decode(raw_content, validate=False)
    except (Base64Error, ValueError):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="GitHub file content could not be decoded")
    if len(content) > MAX_IMPORT_FILE_BYTES:
        raise HTTPException(status_code=status.HTTP_413_CONTENT_TOO_LARGE, detail="GitHub file is larger than the 300KB import limit")
    if _is_likely_binary(content):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Binary files cannot be imported")
    return content


async def _fetch_importable_file(
    token: str,
    owner: str,
    repo: str,
    path: str,
    branch: str | None,
) -> tuple[str, str, str, str]:
    language = _language_from_path(path)
    if not language:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported file type")

    async with httpx.AsyncClient(timeout=20) as client:
        selected_branch = branch
        if not selected_branch:
            repo_data = await _get_repo_metadata(client, token, owner, repo)
            selected_branch = repo_data.get("default_branch") or "main"
        payload = await _get_github_content(client, token, owner, repo, path, selected_branch)

    if isinstance(payload, list):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Folders cannot be imported")
    content = _decode_github_file(payload).decode("utf-8", errors="replace")
    return selected_branch, payload.get("name") or path.rsplit("/", 1)[-1], language, content


def _get_integration(db: Session, user_id: int) -> GithubIntegration | None:
    return db.query(GithubIntegration).filter(GithubIntegration.user_id == user_id).first()


def _get_token_or_404(db: Session, user_id: int) -> tuple[GithubIntegration, str]:
    integration = _get_integration(db, user_id)
    encrypted_token = integration.access_token if integration and integration.access_token else None
    if not encrypted_token:
        oauth_account = (
            db.query(OAuthAccount)
            .filter(OAuthAccount.user_id == user_id, OAuthAccount.provider == "github")
            .first()
        )
        encrypted_token = oauth_account.access_token_encrypted if oauth_account else None
        if encrypted_token:
            if not integration:
                integration = GithubIntegration(user_id=user_id)
                db.add(integration)
            integration.github_user_id = oauth_account.provider_user_id
            integration.github_username = oauth_account.provider_email
            integration.access_token = encrypted_token
            db.commit()
    if not integration:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="GitHub account not connected")
    if not encrypted_token:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="GitHub token missing")
    token = decrypt_token(encrypted_token)
    if not token:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="GitHub token could not be decrypted")
    return integration, token


@router.post("/connect", response_model=GitHubProfileResponse, status_code=status.HTTP_200_OK)
@limiter.limit("20/minute")
async def connect_github(
    payload: GitHubConnectRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> GitHubProfileResponse:
    """Connect a GitHub personal access token after validating it with GitHub."""
    _require_token_storage_ready()

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get("https://api.github.com/user", headers=_github_headers(payload.access_token))
    if response.status_code >= 400:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid GitHub token")

    profile = response.json()
    integration = _get_integration(db, current_user.id)
    if not integration:
        integration = GithubIntegration(user_id=current_user.id)
        db.add(integration)

    integration.github_user_id = str(profile.get("id"))
    integration.github_username = profile.get("login")
    integration.access_token = encrypt_token(payload.access_token)
    db.commit()

    return GitHubProfileResponse(
        connected=True,
        username=integration.github_username,
        github_user_id=integration.github_user_id,
    )


@router.get("/me", response_model=GitHubProfileResponse, status_code=status.HTTP_200_OK)
@limiter.limit("60/minute")
def get_github_profile(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> GitHubProfileResponse:
    """Return stored GitHub connection state without exposing tokens."""
    integration = _get_integration(db, current_user.id)
    if not integration:
        oauth_account = (
            db.query(OAuthAccount)
            .filter(OAuthAccount.user_id == current_user.id, OAuthAccount.provider == "github")
            .first()
        )
        if oauth_account and oauth_account.access_token_encrypted:
            return GitHubProfileResponse(
                connected=True,
                username=oauth_account.provider_email,
                github_user_id=oauth_account.provider_user_id,
            )
        return GitHubProfileResponse(connected=False)
    return GitHubProfileResponse(
        connected=bool(integration.access_token),
        username=integration.github_username,
        github_user_id=integration.github_user_id,
    )


@router.get("/repos", response_model=list[GitHubRepoResponse], status_code=status.HTTP_200_OK)
@limiter.limit("30/minute")
async def list_github_repos(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[GitHubRepoResponse]:
    """Fetch repositories accessible by the connected GitHub token."""
    _, token = _get_token_or_404(db, current_user.id)
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(
            "https://api.github.com/user/repos?per_page=100&sort=updated&visibility=all&affiliation=owner,collaborator,organization_member",
            headers=_github_headers(token),
        )
    if response.status_code >= 400:
        raise _github_error(response)
    repos = response.json()
    return [
        GitHubRepoResponse(
            name=repo["name"],
            full_name=repo["full_name"],
            owner=repo.get("owner", {}).get("login", repo["full_name"].split("/")[0]),
            default_branch=repo.get("default_branch", "main"),
            private=repo.get("private", False),
            html_url=repo["html_url"],
            language=repo.get("language"),
            updated_at=repo.get("updated_at"),
        )
        for repo in repos
    ]


@router.get("/repos/{owner}/{repo}/files", response_model=GitHubRepoFilesResponse, status_code=status.HTTP_200_OK)
@limiter.limit("30/minute")
async def list_github_repo_files(
    owner: str,
    repo: str,
    request: Request,
    branch: str | None = None,
    path: str = "",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> GitHubRepoFilesResponse:
    """List folders and supported code files for a connected GitHub repository."""
    _, token = _get_token_or_404(db, current_user.id)
    async with httpx.AsyncClient(timeout=20) as client:
        selected_branch = branch
        if not selected_branch:
            repo_data = await _get_repo_metadata(client, token, owner, repo)
            selected_branch = repo_data.get("default_branch") or "main"
        payload = await _get_github_content(client, token, owner, repo, path, selected_branch)

    if not isinstance(payload, list):
        payload = [payload]

    items = []
    for item in payload:
        item_type = item.get("type")
        item_path = item.get("path", "")
        language = _language_from_path(item_path)
        importable = item_type == "file" and bool(language) and int(item.get("size") or 0) <= MAX_IMPORT_FILE_BYTES
        if item_type == "dir" or language:
            items.append(
                GitHubRepoFileItem(
                    name=item.get("name", ""),
                    path=item_path,
                    type=item_type,
                    size=item.get("size"),
                    language=language,
                    importable=importable,
                )
            )

    items.sort(key=lambda item: (item.type != "dir", item.name.lower()))
    return GitHubRepoFilesResponse(repo=f"{owner}/{repo}", branch=selected_branch, path=path, items=items)


@router.get("/repos/{owner}/{repo}/file", response_model=GitHubRepoFileContentResponse, status_code=status.HTTP_200_OK)
@limiter.limit("30/minute")
async def get_github_repo_file(
    owner: str,
    repo: str,
    request: Request,
    path: str,
    branch: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> GitHubRepoFileContentResponse:
    """Import a supported text code file from GitHub without exposing the token."""
    _, token = _get_token_or_404(db, current_user.id)
    selected_branch, name, language, content = await _fetch_importable_file(token, owner, repo, path, branch)
    return GitHubRepoFileContentResponse(
        repo=f"{owner}/{repo}",
        branch=selected_branch,
        path=path,
        name=name,
        language=language,
        content=content,
    )


@router.post("/repos/{owner}/{repo}/scan-file", response_model=GitHubScanFileResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
async def scan_github_repo_file(
    owner: str,
    repo: str,
    payload: GitHubScanFileRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> GitHubScanFileResponse:
    """Import a GitHub file, run the scanner, persist review/issues, and return the review id."""
    _, token = _get_token_or_404(db, current_user.id)
    selected_branch, _name, language, content = await _fetch_importable_file(token, owner, repo, payload.path, payload.branch)
    try:
        result = analyze_code(content, language)
    except InvalidCodeError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    project_name = payload.project_name or f"{owner}/{repo}"

    db_review = Review(
        project_name=project_name,
        language=language,
        score=result["score"],
        summary=result["summary"],
        improved_code=result["improved_code"],
        source_provider="github",
        source_repo=f"{owner}/{repo}",
        source_branch=selected_branch,
        source_path=payload.path,
        source_url=f"https://github.com/{owner}/{repo}/blob/{selected_branch}/{payload.path}",
        user_id=current_user.id,
    )
    db.add(db_review)
    db.flush()

    for issue in result["issues"]:
        db.add(
            Issue(
                title=issue["title"],
                severity=issue["severity"],
                category=issue["category"],
                line_number=issue["line_number"],
                description=issue["description"],
                suggested_fix=issue["suggested_fix"],
                fixed_code=issue["fixed_code"],
                review_id=db_review.id,
                user_id=current_user.id,
            )
        )
    db.commit()

    return GitHubScanFileResponse(
        review_id=db_review.id,
        project_name=project_name,
        language=language,
        score=result["score"],
        issues_count=len(result["issues"]),
    )


@router.post("/create-issue", response_model=GitHubIssueCreateResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
async def create_github_issue(
    payload: GitHubIssueCreateRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> GitHubIssueCreateResponse:
    """Create a GitHub issue from an owned Kodeye issue."""
    _, token = _get_token_or_404(db, current_user.id)
    issue = (
        db.query(Issue)
        .filter(Issue.id == payload.issue_id, Issue.user_id == current_user.id)
        .first()
    )
    if not issue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found")

    project_name = issue.review.project_name if issue.review else "Unknown project"
    body = "\n".join(
        [
            f"Severity: {issue.severity}",
            f"Category: {issue.category}",
            f"Project: {project_name}",
            f"Line: {issue.line_number}",
            "",
            "Description:",
            issue.description,
            "",
            "Suggested fix:",
            issue.suggested_fix or "No suggested fix provided.",
            "",
            "Fixed code:",
            issue.fixed_code or "No fixed code provided.",
            "",
            "Generated by Kodeye",
        ]
    )

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post(
            f"https://api.github.com/repos/{payload.repo}/issues",
            headers=_github_headers(token),
            json={"title": issue.title, "body": body},
        )
    if response.status_code >= 400:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unable to create GitHub issue")

    issue_url = response.json().get("html_url")
    issue.github_issue_url = issue_url
    issue.github_repo = payload.repo
    db.commit()

    return GitHubIssueCreateResponse(issue_url=issue_url, repo=payload.repo)


@router.delete("/disconnect", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("20/minute")
def disconnect_github(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    """Disconnect stored GitHub token data."""
    integration = _get_integration(db, current_user.id)
    if integration:
        db.delete(integration)
    oauth_account = (
        db.query(OAuthAccount)
        .filter(OAuthAccount.user_id == current_user.id, OAuthAccount.provider == "github")
        .first()
    )
    if oauth_account:
        db.delete(oauth_account)
    db.commit()

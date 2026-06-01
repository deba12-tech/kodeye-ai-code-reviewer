"""Launch-readiness backend tests for ownership, dashboard, GitHub, and config."""

from types import SimpleNamespace

import pytest
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.testclient import TestClient

from app.core.config import Settings, validate_production_settings
from app.models.github_integration import GithubIntegration
from app.models.issue import Issue
from app.models.oauth_account import OAuthAccount
from app.models.review import Review
from app.models.user import User


def create_review_with_issue(db_session, user_id: int, project_name: str = "Owned Project"):
    review = Review(
        project_name=project_name,
        language="JavaScript",
        score=80,
        summary="Summary",
        improved_code="const ok = true;",
        user_id=user_id,
    )
    db_session.add(review)
    db_session.flush()
    issue = Issue(
        title="Unsafe eval Usage",
        severity="High",
        category="Security",
        line_number=1,
        description="Description",
        suggested_fix="Avoid eval",
        fixed_code="JSON.parse(value)",
        review_id=review.id,
        user_id=user_id,
    )
    db_session.add(issue)
    db_session.commit()
    return review, issue


def register_user(client, email: str):
    response = client.post(
        "/auth/register",
        json={"name": "Owner", "email": email, "password": "ValidPass123!"},
    )
    assert response.status_code == 201
    return response.json()


class FakeResponse:
    def __init__(self, data, status_code=200):
        self._data = data
        self.status_code = status_code

    def json(self):
        return self._data

    def raise_for_status(self):
        if self.status_code >= 400:
            raise RuntimeError("HTTP error")


class FakeGitHubClient:
    def __init__(self, *args, **kwargs):
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        return None

    async def get(self, url, headers=None):
        if url == "https://api.github.com/user":
            return FakeResponse({"id": 42, "login": "kodeye-user"})
        if url.startswith("https://api.github.com/user/repos"):
            return FakeResponse([
                {
                    "name": "demo",
                    "full_name": "kodeye-user/demo",
                    "owner": {"login": "kodeye-user"},
                    "default_branch": "main",
                    "private": False,
                    "html_url": "https://github.com/kodeye-user/demo",
                }
            ])
        return FakeResponse({}, status_code=404)

    async def post(self, url, headers=None, json=None):
        return FakeResponse({"html_url": "https://github.com/kodeye-user/demo/issues/1"}, status_code=201)


class FakeGitHubOAuthClient:
    token_payload = {"access_token": "gho_test"}
    user_payload = {
        "id": 12345,
        "login": "octo-dev",
        "email": None,
        "name": "Octo Dev",
        "avatar_url": "https://avatars.githubusercontent.com/u/12345",
    }
    emails_payload = [
        {"email": "octo@example.com", "primary": True, "verified": True},
    ]
    token_status = 200
    user_status = 200
    emails_status = 200
    token_headers = None

    def __init__(self, *args, **kwargs):
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        return None

    async def post(self, url, data=None, headers=None):
        self.__class__.token_headers = headers
        return FakeResponse(self.__class__.token_payload, self.__class__.token_status)

    async def get(self, url, headers=None):
        if url == "https://api.github.com/user":
            return FakeResponse(self.__class__.user_payload, self.__class__.user_status)
        if url == "https://api.github.com/user/emails":
            return FakeResponse(self.__class__.emails_payload, self.__class__.emails_status)
        return FakeResponse({}, status_code=404)


def configure_github_oauth(monkeypatch):
    monkeypatch.setenv("GITHUB_CLIENT_ID", "github-client")
    monkeypatch.setenv("GITHUB_CLIENT_SECRET", "github-secret")
    monkeypatch.setenv("GITHUB_REDIRECT_URI", "https://kodeye-backend.onrender.com/api/v1/auth/github/callback")
    monkeypatch.setenv("FRONTEND_URL", "https://kodeye.vercel.app")
    monkeypatch.setenv("BACKEND_URL", "https://kodeye-backend.onrender.com")


def patch_github_oauth_client(monkeypatch, token_payload=None, user_payload=None, emails_payload=None):
    import app.api.auth as auth_api

    FakeGitHubOAuthClient.token_payload = {"access_token": "gho_test"} if token_payload is None else token_payload
    FakeGitHubOAuthClient.user_payload = {
        "id": 12345,
        "login": "octo-dev",
        "email": None,
        "name": "Octo Dev",
        "avatar_url": "https://avatars.githubusercontent.com/u/12345",
    } if user_payload is None else user_payload
    FakeGitHubOAuthClient.emails_payload = [
        {"email": "octo@example.com", "primary": True, "verified": True},
    ] if emails_payload is None else emails_payload
    FakeGitHubOAuthClient.token_status = 200
    FakeGitHubOAuthClient.user_status = 200
    FakeGitHubOAuthClient.emails_status = 200
    FakeGitHubOAuthClient.token_headers = None
    monkeypatch.setattr(auth_api.httpx, "AsyncClient", FakeGitHubOAuthClient)


@pytest.mark.integration
def test_dashboard_stats_use_owned_backend_data(client, db_session, auth_headers, registered_user):
    create_review_with_issue(db_session, registered_user["user"]["id"])

    response = client.get("/api/v1/dashboard/stats", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["total_reviews"] == 1
    assert data["total_issues"] == 1
    assert data["open_issues"] == 1
    assert data["recent_reviews"][0]["project_name"] == "Owned Project"


@pytest.mark.integration
def test_reviews_and_issues_enforce_ownership(client, db_session, auth_headers, registered_user):
    other = register_user(client, "other-owner@example.com")
    owned_review, owned_issue = create_review_with_issue(db_session, registered_user["user"]["id"])
    other_review, other_issue = create_review_with_issue(db_session, other["user"]["id"], "Other Project")

    reviews = client.get("/api/v1/reviews", headers=auth_headers)
    issues = client.get("/api/v1/issues", headers=auth_headers)
    other_detail = client.get(f"/api/v1/reviews/{other_review.id}", headers=auth_headers)
    other_issue_detail = client.get(f"/api/v1/issues/{other_issue.id}", headers=auth_headers)

    assert reviews.status_code == 200
    assert [item["id"] for item in reviews.json()["items"]] == [owned_review.id]
    assert issues.status_code == 200
    assert [item["id"] for item in issues.json()["items"]] == [owned_issue.id]
    assert other_detail.status_code == 404
    assert other_issue_detail.status_code == 404


@pytest.mark.integration
def test_issue_status_update_persists(client, db_session, auth_headers, registered_user):
    _, issue = create_review_with_issue(db_session, registered_user["user"]["id"])

    response = client.patch(
        f"/api/v1/issues/{issue.id}",
        json={"status": "Fixed"},
        headers=auth_headers,
    )

    assert response.status_code == 200
    assert response.json()["status"] == "Fixed"
    db_session.refresh(issue)
    assert issue.status == "Fixed"


@pytest.mark.integration
def test_github_connect_repos_and_issue_creation_are_mocked(
    client, db_session, auth_headers, registered_user, monkeypatch
):
    import app.api.v1.github as github_api

    monkeypatch.setattr(github_api.httpx, "AsyncClient", FakeGitHubClient)
    _, issue = create_review_with_issue(db_session, registered_user["user"]["id"])

    connect = client.post(
        "/api/v1/github/connect",
        json={"access_token": "ghp_test"},
        headers=auth_headers,
    )
    repos = client.get("/api/v1/github/repos", headers=auth_headers)
    created = client.post(
        "/api/v1/github/create-issue",
        json={"issue_id": issue.id, "repo": "kodeye-user/demo"},
        headers=auth_headers,
    )

    assert connect.status_code == 200
    assert connect.json()["username"] == "kodeye-user"
    assert repos.status_code == 200
    assert repos.json()[0]["full_name"] == "kodeye-user/demo"
    assert created.status_code == 201
    assert created.json()["issue_url"].endswith("/issues/1")


@pytest.mark.integration
def test_oauth_missing_config_returns_clean_error(client, monkeypatch):
    monkeypatch.delenv("GOOGLE_CLIENT_ID", raising=False)
    monkeypatch.delenv("GOOGLE_CLIENT_SECRET", raising=False)

    response = client.get("/api/v1/auth/google/login", follow_redirects=False)

    assert response.status_code == 503
    assert response.json()["detail"] == "Google OAuth is not configured"


def test_github_oauth_login_requests_repo_import_scopes(client, monkeypatch):
    monkeypatch.setenv("GITHUB_CLIENT_ID", "github-client")
    monkeypatch.setenv("GITHUB_CLIENT_SECRET", "github-secret")
    monkeypatch.setenv("GITHUB_OAUTH_SCOPE", "read:user user:email repo")

    response = client.get("/api/v1/auth/github/login", follow_redirects=False)

    assert response.status_code == 307
    location = response.headers["location"]
    assert "scope=read%3Auser%20user%3Aemail%20repo" in location


def test_github_oauth_callback_rejects_string_token_response(client, monkeypatch):
    configure_github_oauth(monkeypatch)
    patch_github_oauth_client(monkeypatch, token_payload="access_token=gho_test")

    response = client.get("/api/v1/auth/github/callback?code=abc", follow_redirects=False)

    assert response.status_code == 400
    assert response.json()["detail"] == "GitHub authentication failed. Please try again."
    assert FakeGitHubOAuthClient.token_headers == {"Accept": "application/json"}


def test_github_oauth_callback_rejects_error_token_response(client, monkeypatch):
    configure_github_oauth(monkeypatch)
    patch_github_oauth_client(
        monkeypatch,
        token_payload={"error": "bad_verification_code", "error_description": "The code passed is incorrect."},
    )

    response = client.get("/api/v1/auth/github/callback?code=bad", follow_redirects=False)

    assert response.status_code == 400
    assert response.json()["detail"] == "GitHub authentication failed. Please try again."


def test_github_oauth_callback_rejects_invalid_user_response_type(client, monkeypatch):
    configure_github_oauth(monkeypatch)
    patch_github_oauth_client(monkeypatch, user_payload="not-a-user-object")

    response = client.get("/api/v1/auth/github/callback?code=abc", follow_redirects=False)

    assert response.status_code == 400
    assert response.json()["detail"] == "GitHub authentication failed. Please try again."


def test_github_oauth_callback_uses_verified_email_endpoint(client, db_session, monkeypatch):
    configure_github_oauth(monkeypatch)
    patch_github_oauth_client(
        monkeypatch,
        user_payload={
            "id": 98765,
            "login": "verified-octo",
            "email": None,
            "name": None,
            "avatar_url": "https://avatars.githubusercontent.com/u/98765",
        },
        emails_payload=[
            {"email": "unverified@example.com", "primary": True, "verified": False},
            {"email": "verified-octo@example.com", "primary": True, "verified": True},
        ],
    )

    response = client.get("/api/v1/auth/github/callback?code=abc", follow_redirects=False)

    assert response.status_code == 307
    assert response.headers["location"].startswith("https://kodeye.vercel.app/auth/callback?")
    user = db_session.query(User).filter(User.email == "verified-octo@example.com").first()
    assert user is not None
    assert user.auth_provider == "github"
    oauth_account = db_session.query(OAuthAccount).filter(
        OAuthAccount.user_id == user.id,
        OAuthAccount.provider == "github",
    ).first()
    assert oauth_account is not None
    integration = db_session.query(GithubIntegration).filter(GithubIntegration.user_id == user.id).first()
    assert integration is not None
    assert integration.github_username == "verified-octo"


def test_github_oauth_callback_rejects_no_verified_email(client, monkeypatch):
    configure_github_oauth(monkeypatch)
    patch_github_oauth_client(
        monkeypatch,
        user_payload={"id": 54321, "login": "no-email", "email": None, "name": None, "avatar_url": None},
        emails_payload=[
            {"email": "private@example.com", "primary": True, "verified": False},
        ],
    )

    response = client.get("/api/v1/auth/github/callback?code=abc", follow_redirects=False)

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "GitHub account has no verified public email. Please add a verified email to GitHub or use email login."
    )


def test_production_config_validation_rejects_unsafe_values():
    config = SimpleNamespace(
        ENVIRONMENT="production",
        DEBUG=True,
        DATABASE_URL="postgresql://user:password@localhost:5432/kodeye",
        JWT_SECRET_KEY="short",
        CORS_ORIGINS_LIST=["*"],
        ALLOWED_HOSTS_LIST=["localhost"],
        TOKEN_ENCRYPTION_KEY="",
    )

    with pytest.raises(ValueError, match="DEBUG must be false"):
        validate_production_settings(config)


def test_production_config_validation_requires_postgres_database_url():
    config = SimpleNamespace(
        ENVIRONMENT="production",
        DEBUG=False,
        DATABASE_URL="sqlite:///./kodeye.db",
        JWT_SECRET_KEY="x" * 64,
        CORS_ORIGINS_LIST=["https://kodeye.vercel.app"],
        ALLOWED_HOSTS_LIST=["kodeye-backend.onrender.com"],
        TOKEN_ENCRYPTION_KEY="fernet-key",
    )

    with pytest.raises(ValueError, match="DATABASE_URL must be set to a valid PostgreSQL URL in production"):
        validate_production_settings(config)


def test_cors_origins_support_json_and_comma_values(monkeypatch):
    monkeypatch.setenv("CORS_ORIGINS", '["https://kodeye-ai-code-reviewer.vercel.app/"]')
    assert Settings().CORS_ORIGINS_LIST == ["https://kodeye-ai-code-reviewer.vercel.app"]

    monkeypatch.setenv(
        "CORS_ORIGINS",
        "https://kodeye-ai-code-reviewer.vercel.app/, http://localhost:5173,",
    )
    assert Settings().CORS_ORIGINS_LIST == [
        "https://kodeye-ai-code-reviewer.vercel.app",
        "http://localhost:5173",
    ]


def test_allowed_hosts_remain_hostnames(monkeypatch):
    monkeypatch.setenv(
        "ALLOWED_HOSTS",
        "localhost, 127.0.0.1, https://kodeye-backend.onrender.com/, *.onrender.com",
    )

    assert Settings().ALLOWED_HOSTS_LIST == [
        "localhost",
        "127.0.0.1",
        "kodeye-backend.onrender.com",
        "*.onrender.com",
    ]


def test_cors_preflight_allows_vercel_origin(monkeypatch):
    monkeypatch.setenv("CORS_ORIGINS", "https://kodeye-ai-code-reviewer.vercel.app")
    app = FastAPI()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=Settings().CORS_ORIGINS_LIST,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )

    @app.get("/api/v1/auth/me")
    def me():
        return {"ok": True}

    with TestClient(app) as test_client:
        response = test_client.options(
            "/api/v1/auth/me",
            headers={
                "Origin": "https://kodeye-ai-code-reviewer.vercel.app",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "authorization",
            },
        )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "https://kodeye-ai-code-reviewer.vercel.app"
    assert response.headers["access-control-allow-credentials"] == "true"

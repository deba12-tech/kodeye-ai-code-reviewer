"""GitHub repository file import tests."""

import base64

import pytest

from app.core.oauth import encrypt_token
from app.models.github_integration import GithubIntegration
from app.models.oauth_account import OAuthAccount
from app.models.review import Review


class FakeResponse:
    def __init__(self, data, status_code=200):
        self._data = data
        self.status_code = status_code

    def json(self):
        return self._data


class FakeGitHubFilesClient:
    def __init__(self, *args, **kwargs):
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        return None

    async def get(self, url, headers=None, params=None):
        if headers and headers.get("Authorization") == "Bearer invalid":
            return FakeResponse({"message": "Bad credentials"}, status_code=401)
        if url == "https://api.github.com/user":
            return FakeResponse({"id": 42, "login": "kodeye-user"})
        if url in {
            "https://api.github.com/repos/kodeye-user/demo",
            "https://api.github.com/repos/kodeye-user/private-demo",
        }:
            is_private = url.endswith("private-demo")
            return FakeResponse({
                "name": "private-demo" if is_private else "demo",
                "full_name": "kodeye-user/private-demo" if is_private else "kodeye-user/demo",
                "owner": {"login": "kodeye-user"},
                "default_branch": "main",
                "private": is_private,
                "html_url": "https://github.com/kodeye-user/private-demo" if is_private else "https://github.com/kodeye-user/demo",
            })
        if url == "https://api.github.com/repos/kodeye-user/demo/contents":
            return FakeResponse([
                {"name": "src", "path": "src", "type": "dir", "size": 0},
                {"name": "README.md", "path": "README.md", "type": "file", "size": 120},
                {"name": "App.tsx", "path": "App.tsx", "type": "file", "size": 90},
            ])
        if url == "https://api.github.com/repos/kodeye-user/demo/contents/src":
            return FakeResponse([
                {"name": "main.py", "path": "src/main.py", "type": "file", "size": 80},
                {"name": "image.png", "path": "src/image.png", "type": "file", "size": 40},
            ])
        if url == "https://api.github.com/repos/kodeye-user/demo/contents/src/main.py":
            content = base64.b64encode(b"print('hello from github')\n").decode("utf-8")
            return FakeResponse({
                "name": "main.py",
                "path": "src/main.py",
                "type": "file",
                "encoding": "base64",
                "size": 27,
                "content": content,
            })
        if url == "https://api.github.com/repos/kodeye-user/private-demo/contents/src/main.py":
            content = base64.b64encode(b"print('hello from private github')\n").decode("utf-8")
            return FakeResponse({
                "name": "main.py",
                "path": "src/main.py",
                "type": "file",
                "encoding": "base64",
                "size": 35,
                "content": content,
            })
        if url == "https://api.github.com/repos/kodeye-user/demo/contents/src/large.py":
            content = base64.b64encode(b"a" * (301 * 1024)).decode("utf-8")
            return FakeResponse({
                "name": "large.py",
                "path": "src/large.py",
                "type": "file",
                "encoding": "base64",
                "size": 301 * 1024,
                "content": content,
            })
        if url == "https://api.github.com/repos/kodeye-user/demo/contents/src/binary.js":
            content = base64.b64encode(b"\x00\x01\x02not text").decode("utf-8")
            return FakeResponse({
                "name": "binary.js",
                "path": "src/binary.js",
                "type": "file",
                "encoding": "base64",
                "size": 11,
                "content": content,
            })
        if url == "https://api.github.com/repos/kodeye-user/demo/contents/src/vuln.js":
            content = base64.b64encode(b"const secret = 'sk_live_123';\neval(input);\n").decode("utf-8")
            return FakeResponse({
                "name": "vuln.js",
                "path": "src/vuln.js",
                "type": "file",
                "encoding": "base64",
                "size": 41,
                "content": content,
            })
        return FakeResponse({"message": "Not Found"}, status_code=404)


def connect_github(db_session, user_id: int, token: str = "ghp_test"):
    integration = GithubIntegration(
        user_id=user_id,
        github_user_id="42",
        github_username="kodeye-user",
        access_token=encrypt_token(token),
    )
    db_session.add(integration)
    db_session.commit()
    return integration


def connect_github_oauth_only(db_session, user_id: int, token: str = "ghp_test"):
    account = OAuthAccount(
        user_id=user_id,
        provider="github",
        provider_user_id="42",
        provider_email="kodeye-user@example.com",
        access_token_encrypted=encrypt_token(token),
    )
    db_session.add(account)
    db_session.commit()
    return account


@pytest.fixture
def fake_github(monkeypatch):
    import app.api.v1.github as github_api

    monkeypatch.setattr(github_api.httpx, "AsyncClient", FakeGitHubFilesClient)


def test_list_repo_files_success(client, db_session, auth_headers, registered_user, fake_github):
    connect_github(db_session, registered_user["user"]["id"])

    response = client.get("/api/v1/github/repos/kodeye-user/demo/files", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["branch"] == "main"
    assert data["items"][0]["type"] == "dir"
    assert any(item["path"] == "App.tsx" and item["importable"] for item in data["items"])
    assert all(item["path"] != "README.md" for item in data["items"])


def test_oauth_account_token_can_fetch_repositories(client, db_session, auth_headers, registered_user, fake_github):
    connect_github_oauth_only(db_session, registered_user["user"]["id"])

    response = client.get("/api/v1/github/repos/kodeye-user/demo/files", headers=auth_headers)

    assert response.status_code == 200
    assert response.json()["repo"] == "kodeye-user/demo"


def test_list_nested_folder_success(client, db_session, auth_headers, registered_user, fake_github):
    connect_github(db_session, registered_user["user"]["id"])

    response = client.get("/api/v1/github/repos/kodeye-user/demo/files?path=src&branch=main", headers=auth_headers)

    assert response.status_code == 200
    paths = [item["path"] for item in response.json()["items"]]
    assert "src/main.py" in paths
    assert "src/image.png" not in paths


def test_import_file_content_success(client, db_session, auth_headers, registered_user, fake_github):
    connect_github(db_session, registered_user["user"]["id"])

    response = client.get("/api/v1/github/repos/kodeye-user/demo/file?path=src/main.py", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["language"] == "python"
    assert data["content"] == "print('hello from github')\n"


def test_import_public_repo_file(client, db_session, auth_headers, registered_user, fake_github):
    connect_github(db_session, registered_user["user"]["id"])

    response = client.get("/api/v1/github/repos/kodeye-user/demo/file?path=src/main.py", headers=auth_headers)

    assert response.status_code == 200
    assert response.json()["repo"] == "kodeye-user/demo"


def test_import_private_repo_file(client, db_session, auth_headers, registered_user, fake_github):
    connect_github(db_session, registered_user["user"]["id"])

    response = client.get("/api/v1/github/repos/kodeye-user/private-demo/file?path=src/main.py", headers=auth_headers)

    assert response.status_code == 200
    assert response.json()["repo"] == "kodeye-user/private-demo"
    assert "private github" in response.json()["content"]


def test_reject_unsupported_and_binary_file(client, db_session, auth_headers, registered_user, fake_github):
    connect_github(db_session, registered_user["user"]["id"])

    unsupported = client.get("/api/v1/github/repos/kodeye-user/demo/file?path=src/image.png", headers=auth_headers)
    binary = client.get("/api/v1/github/repos/kodeye-user/demo/file?path=src/binary.js", headers=auth_headers)

    assert unsupported.status_code == 400
    assert unsupported.json()["detail"] == "Unsupported file type"
    assert binary.status_code == 400
    assert binary.json()["detail"] == "Binary files cannot be imported"


def test_reject_large_file(client, db_session, auth_headers, registered_user, fake_github):
    connect_github(db_session, registered_user["user"]["id"])

    response = client.get("/api/v1/github/repos/kodeye-user/demo/file?path=src/large.py", headers=auth_headers)

    assert response.status_code == 413


def test_github_not_connected(client, auth_headers):
    response = client.get("/api/v1/github/repos/kodeye-user/demo/files", headers=auth_headers)

    assert response.status_code == 404
    assert response.json()["detail"] == "GitHub account not connected"


def test_invalid_github_token(client, db_session, auth_headers, registered_user, fake_github):
    connect_github(db_session, registered_user["user"]["id"], token="invalid")

    response = client.get("/api/v1/github/repos/kodeye-user/demo/files", headers=auth_headers)

    assert response.status_code == 401
    assert response.json()["detail"] == "GitHub token expired or invalid. Reconnect GitHub."


def test_scan_github_file_creates_review_and_issues(client, db_session, auth_headers, registered_user, fake_github):
    connect_github(db_session, registered_user["user"]["id"])

    response = client.post(
        "/api/v1/github/repos/kodeye-user/demo/scan-file",
        json={"path": "src/vuln.js", "branch": "main", "project_name": "Demo Repo"},
        headers=auth_headers,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["review_id"]
    assert data["issues_count"] >= 1

    review = client.get(f"/api/v1/reviews/{data['review_id']}", headers=auth_headers)
    assert review.status_code == 200
    assert review.json()["project_name"] == "Demo Repo"
    assert review.json()["source_provider"] == "github"
    assert review.json()["source_repo"] == "kodeye-user/demo"
    assert review.json()["source_branch"] == "main"
    assert review.json()["source_path"] == "src/vuln.js"

    db_review = db_session.query(Review).filter_by(id=data["review_id"]).first()
    assert db_review.source_repo == "kodeye-user/demo"


def test_analyze_imported_github_file_saves_source_metadata(client, db_session, auth_headers):
    response = client.post(
        "/api/v1/reviews/analyze",
        json={
            "project_name": "Imported Repo",
            "language": "Python",
            "code": "print('imported')",
            "review_depth": "quick",
            "source_provider": "github",
            "source_repo": "kodeye-user/demo",
            "source_branch": "main",
            "source_path": "src/main.py",
            "source_url": "https://github.com/kodeye-user/demo/blob/main/src/main.py",
        },
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["source_repo"] == "kodeye-user/demo"

    db_review = db_session.query(Review).filter_by(id=data["review_id"]).first()
    assert db_review.source_provider == "github"
    assert db_review.source_path == "src/main.py"

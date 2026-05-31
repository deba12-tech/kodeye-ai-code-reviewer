"""Launch-readiness backend tests for ownership, dashboard, GitHub, and config."""

from types import SimpleNamespace

import pytest

from app.core.config import validate_production_settings
from app.models.issue import Issue
from app.models.review import Review


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


def test_production_config_validation_rejects_unsafe_values():
    config = SimpleNamespace(
        ENVIRONMENT="production",
        DEBUG=True,
        JWT_SECRET_KEY="short",
        CORS_ORIGINS_LIST=["*"],
        TOKEN_ENCRYPTION_KEY="",
    )

    with pytest.raises(ValueError, match="DEBUG must be false"):
        validate_production_settings(config)

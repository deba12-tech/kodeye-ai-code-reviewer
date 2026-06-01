"""Error handling and authorization tests."""

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.middleware.error_handler import setup_exception_handlers


@pytest.mark.errors
class TestAuthorization:
    def test_protected_endpoint_missing_token(self, client):
        response = client.get("/api/v1/users/me")
        assert response.status_code == 401
        assert "error" in response.json() or "detail" in response.json()

    def test_protected_endpoint_invalid_token(self, client):
        response = client.get(
            "/api/v1/users/me",
            headers={"Authorization": "Bearer invalid.token.value"},
        )
        assert response.status_code == 401

    def test_auth_me_requires_token(self, client):
        response = client.get("/auth/me")
        assert response.status_code == 401


@pytest.mark.errors
class TestValidationErrors:
    def test_register_short_password(self, client):
        response = client.post(
            "/auth/register",
            json={
                "name": "Test",
                "email": "short@example.com",
                "password": "short",
            },
        )
        assert response.status_code == 422

    def test_update_profile_invalid_extra_fields(self, client, auth_headers):
        response = client.patch(
            "/api/v1/users/me",
            json={"name": "Test", "unknown_field": "value"},
            headers=auth_headers,
        )
        assert response.status_code == 422


@pytest.mark.errors
class TestNotFound:
    def test_health_endpoints(self, client):
        assert client.get("/api/v1/health").status_code == 200
        assert client.get("/api/v1/health/ready").status_code == 200
        assert client.get("/api/v1/health/live").status_code == 200


def test_general_exception_handler_does_not_crash():
    app = FastAPI()
    setup_exception_handlers(app)

    @app.get("/boom")
    def boom():
        raise RuntimeError("boom")

    with TestClient(app, raise_server_exceptions=False) as test_client:
        response = test_client.get("/boom")

    assert response.status_code == 500
    body = response.json()
    assert body["error"]["code"] == "INTERNAL_SERVER_ERROR"
    assert body["error"]["details"]["error_id"]

"""Error handling and authorization tests."""

import pytest


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

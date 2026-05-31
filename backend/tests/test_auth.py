"""Authentication endpoint tests."""

import pytest


@pytest.mark.auth
class TestRegistration:
    def test_register_valid(self, client):
        response = client.post(
            "/auth/register",
            json={
                "name": "New User",
                "email": "newuser@example.com",
                "password": "SecurePass123!",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["user"]["email"] == "newuser@example.com"

    def test_register_invalid_email(self, client):
        response = client.post(
            "/auth/register",
            json={
                "name": "Bad Email",
                "email": "not-an-email",
                "password": "SecurePass123!",
            },
        )
        assert response.status_code == 422

    def test_register_duplicate_email(self, client, registered_user):
        response = client.post(
            "/auth/register",
            json={
                "name": "Duplicate",
                "email": "testuser@example.com",
                "password": "SecurePass123!",
            },
        )
        assert response.status_code == 400


@pytest.mark.auth
class TestLogin:
    def test_login_valid(self, client, registered_user):
        response = client.post(
            "/auth/login",
            json={
                "email": "testuser@example.com",
                "password": "SecurePass123!",
            },
        )
        assert response.status_code == 200
        assert "access_token" in response.json()

    def test_login_invalid_credentials(self, client, registered_user):
        response = client.post(
            "/auth/login",
            json={
                "email": "testuser@example.com",
                "password": "WrongPassword!",
            },
        )
        assert response.status_code == 400


@pytest.mark.auth
class TestTokenRefresh:
    def test_refresh_token(self, client, refresh_token):
        response = client.post(
            "/auth/refresh",
            json={"refresh_token": refresh_token},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["access_token"]
        assert data["refresh_token"]
        assert data["refresh_token"] != refresh_token


@pytest.mark.auth
class TestLogout:
    def test_logout(self, client, registered_user, refresh_token):
        response = client.post("/auth/logout", json={"refresh_token": refresh_token})
        assert response.status_code == 200

        refresh_response = client.post(
            "/auth/refresh",
            json={"refresh_token": refresh_token},
        )
        assert refresh_response.status_code == 401

    def test_logout_all(self, client, auth_headers, refresh_token):
        response = client.post("/auth/logout-all", headers=auth_headers)
        assert response.status_code == 200

        refresh_response = client.post(
            "/auth/refresh",
            json={"refresh_token": refresh_token},
        )
        assert refresh_response.status_code == 401


@pytest.mark.auth
class TestEmailVerification:
    def test_request_verification(self, client, auth_headers):
        response = client.post(
            "/auth/verify-email/request",
            json={},
            headers=auth_headers,
        )
        assert response.status_code == 200

    def test_confirm_verification_invalid_token(self, client):
        response = client.post(
            "/auth/verify-email/confirm",
            json={"token": "invalid-token-value"},
        )
        assert response.status_code == 400


@pytest.mark.auth
class TestPasswordReset:
    def test_forgot_password(self, client, registered_user):
        response = client.post(
            "/auth/forgot-password",
            json={"email": "testuser@example.com"},
        )
        assert response.status_code == 200

    def test_reset_password_invalid_token(self, client):
        response = client.post(
            "/auth/reset-password",
            json={"token": "invalid", "new_password": "NewSecure123!"},
        )
        assert response.status_code == 400

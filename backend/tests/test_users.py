"""User account management endpoint tests."""

import pytest


@pytest.mark.users
class TestUserProfile:
    def test_get_profile(self, client, auth_headers):
        response = client.get("/api/v1/users/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "testuser@example.com"
        assert "is_email_verified" in data
        assert "profile_picture_url" in data

    def test_get_profile_unauthorized(self, client):
        response = client.get("/api/v1/users/me")
        assert response.status_code == 401

    def test_update_profile(self, client, auth_headers):
        response = client.patch(
            "/api/v1/users/me",
            json={
                "name": "Updated Name",
                "bio": "Hello from tests",
                "profile_picture_url": "https://example.com/avatar.png",
            },
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Name"
        assert data["bio"] == "Hello from tests"
        assert data["profile_picture_url"] == "https://example.com/avatar.png"


@pytest.mark.users
class TestChangePassword:
    def test_change_password(self, client, auth_headers, refresh_token):
        response = client.post(
            "/api/v1/users/change-password",
            json={
                "current_password": "SecurePass123!",
                "new_password": "NewSecure456!",
                "confirm_password": "NewSecure456!",
            },
            headers=auth_headers,
        )
        assert response.status_code == 204

        refresh_response = client.post(
            "/auth/refresh",
            json={"refresh_token": refresh_token},
        )
        assert refresh_response.status_code == 401

        login_response = client.post(
            "/auth/login",
            json={
                "email": "testuser@example.com",
                "password": "NewSecure456!",
            },
        )
        assert login_response.status_code == 200

    def test_change_password_wrong_current(self, client, auth_headers):
        response = client.post(
            "/api/v1/users/change-password",
            json={
                "current_password": "WrongPassword!",
                "new_password": "NewSecure456!",
                "confirm_password": "NewSecure456!",
            },
            headers=auth_headers,
        )
        assert response.status_code == 401


@pytest.mark.users
class TestConnectedAccounts:
    def test_get_connected_accounts(self, client, auth_headers):
        response = client.get("/api/v1/users/connected-accounts", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "accounts" in data
        assert isinstance(data["can_disconnect"], bool)

    def test_disconnect_unknown_provider(self, client, auth_headers):
        response = client.delete(
            "/api/v1/users/connected-accounts/google",
            headers=auth_headers,
        )
        assert response.status_code == 404


@pytest.mark.users
class TestDeleteAccount:
    def test_delete_account_requires_confirmation(self, client, auth_headers):
        response = client.request(
            "DELETE",
            "/api/v1/users/me",
            json={"password": "SecurePass123!", "confirm_delete": False},
            headers=auth_headers,
        )
        assert response.status_code == 422

    def test_delete_account(self, client, auth_headers):
        response = client.request(
            "DELETE",
            "/api/v1/users/me",
            json={"password": "SecurePass123!", "confirm_delete": True},
            headers=auth_headers,
        )
        assert response.status_code == 200
        assert response.json()["message"] == "Account successfully deleted"

        profile_response = client.get("/api/v1/users/me", headers=auth_headers)
        assert profile_response.status_code == 401

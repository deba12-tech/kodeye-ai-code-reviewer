"""Integration tests for complete user flows."""

import pytest
from app.core.security import hash_token, generate_secure_token
from app.models.auth_tokens import EmailVerificationToken
from datetime import datetime, timedelta


@pytest.mark.integration
class TestAuthFlow:
    def test_signup_login_profile_logout(self, client):
        register = client.post(
            "/auth/register",
            json={
                "name": "Flow User",
                "email": "flow@example.com",
                "password": "FlowPass123!",
            },
        )
        assert register.status_code == 201
        access_token = register.json()["access_token"]
        refresh_token = register.json()["refresh_token"]
        headers = {"Authorization": f"Bearer {access_token}"}

        profile = client.get("/api/v1/users/me", headers=headers)
        assert profile.status_code == 200
        assert profile.json()["email"] == "flow@example.com"

        logout = client.post("/auth/logout", json={"refresh_token": refresh_token})
        assert logout.status_code == 200

        refresh = client.post("/auth/refresh", json={"refresh_token": refresh_token})
        assert refresh.status_code == 401


@pytest.mark.integration
class TestEmailVerificationFlow:
    def test_verify_email_flow(self, client, db_session):
        register = client.post(
            "/auth/register",
            json={
                "name": "Verify User",
                "email": "verify@example.com",
                "password": "VerifyPass123!",
            },
        )
        assert register.status_code == 201
        user_id = register.json()["user"]["id"]

        raw_token = generate_secure_token()
        db_session.add(
            EmailVerificationToken(
                user_id=user_id,
                token_hash=hash_token(raw_token),
                expires_at=datetime.utcnow() + timedelta(hours=1),
                used=False,
            )
        )
        db_session.commit()

        confirm = client.post(
            "/auth/verify-email/confirm",
            json={"token": raw_token},
        )
        assert confirm.status_code == 200

        access_token = register.json()["access_token"]
        profile = client.get(
            "/api/v1/users/me",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        assert profile.json()["is_email_verified"] is True


@pytest.mark.integration
class TestPasswordChangeFlow:
    def test_change_password_invalidates_sessions(self, client):
        register = client.post(
            "/auth/register",
            json={
                "name": "Password User",
                "email": "password@example.com",
                "password": "OldPass123!",
            },
        )
        refresh_token = register.json()["refresh_token"]
        headers = {"Authorization": f"Bearer {register.json()['access_token']}"}

        change = client.post(
            "/api/v1/users/change-password",
            json={
                "current_password": "OldPass123!",
                "new_password": "NewPass456!",
                "confirm_password": "NewPass456!",
            },
            headers=headers,
        )
        assert change.status_code == 204

        refresh = client.post("/auth/refresh", json={"refresh_token": refresh_token})
        assert refresh.status_code == 401

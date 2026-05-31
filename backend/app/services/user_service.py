"""User service for managing user operations."""

from datetime import datetime
from typing import Optional

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.middleware.error_handler import (
    AuthenticationException,
    ConflictException,
    ResourceNotFoundException,
    ValidationException,
)
from app.models.oauth_account import OAuthAccount
from app.models.user import User
from app.services.auth_service import AuthService


class UserService:
    """Service for user-related operations."""

    def __init__(self, db: Session):
        self.db = db

    def get_user_by_id(self, user_id: int) -> User:
        """Get user by ID."""
        stmt = select(User).where(User.id == user_id)
        user = self.db.execute(stmt).scalar_one_or_none()
        if not user:
            raise ResourceNotFoundException("User", str(user_id))
        return user

    def get_profile(self, user_id: int) -> User:
        """Get user profile information."""
        return self.get_user_by_id(user_id)

    def update_profile(
        self,
        user_id: int,
        name: Optional[str] = None,
        bio: Optional[str] = None,
        profile_picture_url: Optional[str] = None,
    ) -> User:
        """Update user profile information."""
        user = self.get_user_by_id(user_id)

        if name is not None:
            user.name = name
        if bio is not None:
            user.bio = bio
        if profile_picture_url is not None:
            user.avatar_url = profile_picture_url

        user.updated_at = datetime.utcnow()

        try:
            self.db.commit()
            self.db.refresh(user)
            return user
        except IntegrityError as e:
            self.db.rollback()
            raise ConflictException(
                "Failed to update profile",
                details={"error": str(e)},
            )

    def change_password(self, user_id: int, current_password: str, new_password: str) -> None:
        """Change user password and invalidate all refresh tokens."""
        user = self.get_user_by_id(user_id)

        if not user.password_hash:
            raise ValidationException(
                "Password change is not available for OAuth-only accounts",
                details={"field": "current_password"},
            )

        if not verify_password(current_password, user.password_hash):
            raise AuthenticationException("Current password is incorrect")

        if current_password == new_password:
            raise ValidationException(
                "New password must be different from current password",
                details={"field": "new_password"},
            )

        user.password_hash = hash_password(new_password)
        user.updated_at = datetime.utcnow()
        AuthService.logout_all_sessions(self.db, user_id)

        try:
            self.db.commit()
        except IntegrityError as e:
            self.db.rollback()
            raise ConflictException(
                "Failed to change password",
                details={"error": str(e)},
            )

    def get_connected_accounts(self, user_id: int) -> list[OAuthAccount]:
        """Get all connected OAuth accounts for user."""
        stmt = select(OAuthAccount).where(OAuthAccount.user_id == user_id)
        return list(self.db.execute(stmt).scalars().all())

    def can_disconnect_oauth(self, user_id: int) -> bool:
        """Return True if the user can safely disconnect an OAuth provider."""
        user = self.get_user_by_id(user_id)
        oauth_accounts = self.get_connected_accounts(user_id)
        return user.password_hash is not None or len(oauth_accounts) > 1

    def disconnect_account(self, user_id: int, provider: str) -> None:
        """Disconnect an OAuth account."""
        oauth_accounts = self.get_connected_accounts(user_id)
        user = self.get_user_by_id(user_id)

        matching = [acc for acc in oauth_accounts if acc.provider == provider]
        if not matching:
            raise ResourceNotFoundException(f"OAuth account for {provider}", "not found")

        remaining_oauth = len(oauth_accounts) - len(matching)
        if remaining_oauth == 0 and not user.password_hash:
            raise ValidationException(
                "Cannot disconnect the last authentication method",
                details={"reason": "Set a password first or connect another provider"},
            )

        for oauth_account in matching:
            self.db.delete(oauth_account)

        try:
            self.db.commit()
        except IntegrityError as e:
            self.db.rollback()
            raise ConflictException(
                f"Failed to disconnect {provider}",
                details={"error": str(e)},
            )

    def delete_account(self, user_id: int, password: Optional[str] = None) -> datetime:
        """Delete user account and all associated data."""
        user = self.get_user_by_id(user_id)

        if user.password_hash:
            if not password:
                raise ValidationException(
                    "Password is required to delete this account",
                    details={"field": "password"},
                )
            if not verify_password(password, user.password_hash):
                raise AuthenticationException("Password is incorrect")

        deleted_at = datetime.utcnow()
        AuthService.logout_all_sessions(self.db, user_id)

        try:
            self.db.delete(user)
            self.db.commit()
        except IntegrityError as e:
            self.db.rollback()
            raise ConflictException(
                "Failed to delete account",
                details={"error": str(e)},
            )

        return deleted_at

    def is_email_verified(self, user_id: int) -> bool:
        """Check if user's email is verified."""
        user = self.get_user_by_id(user_id)
        return user.is_verified

    def get_email_notifications_enabled(self, user_id: int) -> bool:
        """Check if email notifications are enabled for user."""
        user = self.get_user_by_id(user_id)
        return getattr(user, "email_notifications_enabled", True)

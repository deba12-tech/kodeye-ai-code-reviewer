"""User-related schemas for API requests and responses."""

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator


class UserProfileResponse(BaseModel):
    """Response schema for user profile information."""

    id: int = Field(..., description="User ID")
    email: EmailStr = Field(..., description="User email address")
    name: Optional[str] = Field(None, description="User full name")
    bio: Optional[str] = Field(None, description="User bio/about")
    profile_picture_url: Optional[str] = Field(None, description="Profile picture URL")
    is_email_verified: bool = Field(..., description="Email verification status")
    created_at: datetime = Field(..., description="Account creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    @model_validator(mode="before")
    @classmethod
    def map_user_fields(cls, data: Any) -> Any:
        if hasattr(data, "avatar_url"):
            return {
                "id": data.id,
                "email": data.email,
                "name": data.name,
                "bio": getattr(data, "bio", None),
                "profile_picture_url": data.avatar_url,
                "is_email_verified": data.is_verified,
                "created_at": data.created_at,
                "updated_at": data.updated_at,
            }
        return data

    class Config:
        from_attributes = True


class UpdateProfileRequest(BaseModel):
    """Request schema for updating user profile."""

    name: Optional[str] = Field(None, min_length=1, max_length=255, description="User full name")
    bio: Optional[str] = Field(None, max_length=500, description="User bio/about")
    profile_picture_url: Optional[str] = Field(None, description="Profile picture URL")

    class Config:
        extra = "forbid"


class ChangePasswordRequest(BaseModel):
    """Request schema for changing password."""

    current_password: str = Field(
        ..., min_length=8, description="Current password for verification"
    )
    new_password: str = Field(..., min_length=8, description="New password")
    confirm_password: str = Field(..., min_length=8, description="Password confirmation")

    def validate_passwords_match(self) -> None:
        """Validate that new password and confirmation match."""
        if self.new_password != self.confirm_password:
            raise ValueError("New password and confirmation do not match")

    class Config:
        extra = "forbid"


class ConnectedAccountResponse(BaseModel):
    """Response schema for connected OAuth account."""

    provider: str = Field(..., description="OAuth provider name (e.g., 'github', 'google')")
    account_email: Optional[str] = Field(None, description="Email from OAuth provider")
    connected_at: datetime = Field(..., description="Connection timestamp")

    @model_validator(mode="before")
    @classmethod
    def map_oauth_fields(cls, data: Any) -> Any:
        if hasattr(data, "provider_email"):
            return {
                "provider": data.provider,
                "account_email": data.provider_email,
                "connected_at": data.created_at,
            }
        return data

    class Config:
        from_attributes = True


class ConnectedAccountsListResponse(BaseModel):
    """Response schema for list of connected accounts."""

    accounts: list[ConnectedAccountResponse] = Field(
        ..., description="List of connected OAuth accounts"
    )
    can_disconnect: bool = Field(
        ...,
        description="Whether user can disconnect accounts (must keep at least one auth method)",
    )


class DeleteAccountRequest(BaseModel):
    """Request schema for deleting user account."""

    password: Optional[str] = Field(
        None, description="Password confirmation (required for password-based accounts)"
    )
    confirm_delete: bool = Field(
        ..., description="Confirmation that user wants to delete account"
    )

    class Config:
        extra = "forbid"


class DeleteAccountResponse(BaseModel):
    """Response schema for account deletion."""

    message: str = Field(..., description="Deletion confirmation message")
    deleted_at: datetime = Field(..., description="Deletion timestamp")


class UserSettingsResponse(BaseModel):
    """Response schema for user settings."""

    id: int = Field(..., description="User ID")
    email: EmailStr = Field(..., description="User email")
    email_notifications_enabled: bool = Field(
        ..., description="Whether email notifications are enabled"
    )
    security_email_alerts: bool = Field(
        ..., description="Whether security alerts are sent via email"
    )
    two_factor_enabled: bool = Field(..., description="Whether 2FA is enabled")

    class Config:
        from_attributes = True

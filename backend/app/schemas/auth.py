import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, field_validator

class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters long")

    @field_validator("password")
    @classmethod
    def password_complexity(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenRefreshRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)


class EmailVerificationRequest(BaseModel):
    email: Optional[EmailStr] = None


class EmailVerificationConfirmRequest(BaseModel):
    token: str


class UserResponseFields(BaseModel):
    id: int
    name: Optional[str] = None
    email: str
    avatar_url: Optional[str] = None
    is_verified: bool
    role: str
    plan: str

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponseFields


class SessionResponse(BaseModel):
    id: int
    device_info: Optional[str] = None
    ip_address: Optional[str] = None
    is_active: bool
    created_at: datetime.datetime
    expires_at: datetime.datetime

    class Config:
        from_attributes = True

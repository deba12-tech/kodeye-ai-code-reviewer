"""User account management API endpoints."""

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.api.v1.dependencies import get_current_user, get_db
from app.middleware.error_handler import ValidationException
from app.middleware.rate_limit import limiter
from app.models.user import User
from app.schemas.pagination import PaginatedResponse
from app.schemas.user import (
    ChangePasswordRequest,
    ConnectedAccountResponse,
    ConnectedAccountsListResponse,
    DeleteAccountRequest,
    DeleteAccountResponse,
    UpdateProfileRequest,
    UserProfileResponse,
)
from app.services.user_service import UserService
from app.utils.pagination import PaginationParams, paginate_query, pagination_params

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=PaginatedResponse[UserProfileResponse], status_code=status.HTTP_200_OK)
@limiter.limit("60/minute")
def list_users(
    request: Request,
    params: PaginationParams = Depends(pagination_params),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PaginatedResponse[UserProfileResponse]:
    """List users with pagination, search, and safe sorting."""
    query = db.query(User)
    return paginate_query(
        query,
        params,
        search_columns=(User.name, User.email, User.bio),
        allowed_sort_columns={
            "id": User.id,
            "name": User.name,
            "email": User.email,
            "created_at": User.created_at,
            "updated_at": User.updated_at,
        },
        default_sort="id",
    )


@router.get("/me", response_model=UserProfileResponse, status_code=status.HTTP_200_OK)
@limiter.limit("60/minute")
def get_profile(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserProfileResponse:
    """Get current user's profile information."""
    user_service = UserService(db)
    profile = user_service.get_profile(current_user.id)
    return UserProfileResponse.model_validate(profile)


@router.patch("/me", response_model=UserProfileResponse, status_code=status.HTTP_200_OK)
@limiter.limit("30/minute")
def update_profile(
    request: Request,
    update_data: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserProfileResponse:
    """Update current user's profile."""
    user_service = UserService(db)
    updated_user = user_service.update_profile(
        current_user.id,
        name=update_data.name,
        bio=update_data.bio,
        profile_picture_url=update_data.profile_picture_url,
    )
    return UserProfileResponse.model_validate(updated_user)


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("10/hour")
def change_password(
    request: Request,
    password_data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    """Change current user's password and invalidate all refresh tokens."""
    password_data.validate_passwords_match()

    user_service = UserService(db)
    user_service.change_password(
        current_user.id,
        current_password=password_data.current_password,
        new_password=password_data.new_password,
    )


@router.get(
    "/connected-accounts",
    response_model=ConnectedAccountsListResponse,
    status_code=status.HTTP_200_OK,
)
@limiter.limit("60/minute")
def get_connected_accounts(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ConnectedAccountsListResponse:
    """Get list of connected OAuth accounts."""
    user_service = UserService(db)
    accounts = user_service.get_connected_accounts(current_user.id)
    can_disconnect = user_service.can_disconnect_oauth(current_user.id)

    return ConnectedAccountsListResponse(
        accounts=[ConnectedAccountResponse.model_validate(acc) for acc in accounts],
        can_disconnect=can_disconnect,
    )


@router.delete("/connected-accounts/{provider}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("10/minute")
def disconnect_account(
    request: Request,
    provider: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    """Disconnect an OAuth account."""
    user_service = UserService(db)
    user_service.disconnect_account(current_user.id, provider.lower())


@router.delete("/me", response_model=DeleteAccountResponse, status_code=status.HTTP_200_OK)
@limiter.limit("5/hour")
def delete_account(
    request: Request,
    delete_data: DeleteAccountRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DeleteAccountResponse:
    """Delete current user's account."""
    if not delete_data.confirm_delete:
        raise ValidationException(
            "Account deletion not confirmed",
            details={"field": "confirm_delete"},
        )

    user_service = UserService(db)
    deleted_at = user_service.delete_account(current_user.id, delete_data.password)

    return DeleteAccountResponse(
        message="Account successfully deleted",
        deleted_at=deleted_at,
    )

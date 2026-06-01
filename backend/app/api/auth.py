import os
import logging
from typing import List
from urllib.parse import quote
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.security import decode_access_token
from app.core.oauth import encrypt_token
from app.models.github_integration import GithubIntegration
from app.models.user import User as UserModel
from app.models.oauth_account import OAuthAccount as OAuthAccountModel
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenRefreshRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    EmailVerificationRequest,
    EmailVerificationConfirmRequest,
    AuthResponse,
    UserResponseFields,
    SessionResponse,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = logging.getLogger("kodeye.auth.oauth")

security_scheme = HTTPBearer(auto_error=False)

GITHUB_AUTH_FAILED_DETAIL = "GitHub authentication failed. Please try again."
GITHUB_NO_VERIFIED_EMAIL_DETAIL = (
    "GitHub account has no verified public email. Please add a verified email to GitHub or use email login."
)


def _versioned_oauth_redirect_uri(provider: str) -> str:
    """Return a versioned OAuth callback URI, normalizing older local env values."""

    backend_url = os.getenv("BACKEND_URL", "http://127.0.0.1:8000").rstrip("/")
    env_name = f"{provider.upper()}_REDIRECT_URI"
    redirect_uri = os.getenv(env_name, f"{backend_url}/api/v1/auth/{provider}/callback")
    if "/api/v1/auth/" not in redirect_uri:
        redirect_uri = redirect_uri.replace("/auth/", "/api/v1/auth/")
    return redirect_uri


def _parse_json_response(response: httpx.Response, provider: str, step: str, expected_type: type):
    """Safely parse OAuth provider JSON without logging secrets."""
    logger.info(
        "%s_oauth_response",
        provider,
        extra={"step": step, "status_code": response.status_code},
    )
    if response.status_code >= 400:
        logger.warning(
            "%s_oauth_http_error",
            provider,
            extra={"step": step, "status_code": response.status_code},
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=GITHUB_AUTH_FAILED_DETAIL if provider == "github" else f"{provider.title()} Authentication failed",
        )

    try:
        payload = response.json()
    except Exception:
        logger.warning(
            "%s_oauth_invalid_json",
            provider,
            extra={"step": step, "status_code": response.status_code},
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=GITHUB_AUTH_FAILED_DETAIL if provider == "github" else f"{provider.title()} Authentication failed",
        )

    if not isinstance(payload, expected_type):
        logger.warning(
            "%s_oauth_invalid_payload_type",
            provider,
            extra={
                "step": step,
                "status_code": response.status_code,
                "payload_type": type(payload).__name__,
            },
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=GITHUB_AUTH_FAILED_DETAIL if provider == "github" else f"{provider.title()} Authentication failed",
        )
    return payload


def _extract_verified_github_email(emails: list) -> str | None:
    for item in emails:
        if not isinstance(item, dict):
            logger.warning(
                "github_oauth_invalid_email_item",
                extra={"payload_type": type(item).__name__},
            )
            continue
        if item.get("primary") is True and item.get("verified") is True and item.get("email"):
            return str(item["email"])
    return None

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> UserModel:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    user_id_str = decode_access_token(token)
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        user_id = int(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token claim",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

def get_verified_user(current_user: UserModel = Depends(get_current_user)) -> UserModel:
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email verification required"
        )
    return current_user


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegisterRequest, request: Request, db: Session = Depends(get_db)):
    device_info = request.headers.get("user-agent", "Unknown Device")
    ip_address = request.client.host if request.client else "127.0.0.1"
    
    return AuthService.register_user(
        db=db,
        name=payload.name,
        email=payload.email,
        password=payload.password,
        device_info=device_info,
        ip_address=ip_address,
    )


@router.post("/login", response_model=AuthResponse)
def login(payload: UserLoginRequest, request: Request, db: Session = Depends(get_db)):
    device_info = request.headers.get("user-agent", "Unknown Device")
    ip_address = request.client.host if request.client else "127.0.0.1"
    
    return AuthService.login_user(
        db=db,
        email=payload.email,
        password=payload.password,
        device_info=device_info,
        ip_address=ip_address,
    )


@router.post("/refresh", response_model=AuthResponse)
def refresh(payload: TokenRefreshRequest, request: Request, db: Session = Depends(get_db)):
    device_info = request.headers.get("user-agent", "Unknown Device")
    ip_address = request.client.host if request.client else "127.0.0.1"
    
    return AuthService.refresh_session(
        db=db,
        refresh_token=payload.refresh_token,
        device_info=device_info,
        ip_address=ip_address,
    )


@router.post("/logout")
def logout(payload: TokenRefreshRequest, db: Session = Depends(get_db)):
    AuthService.logout_session(db, payload.refresh_token)
    return {"message": "Successfully logged out from current session"}


@router.post("/logout-all")
def logout_all(current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    AuthService.logout_all_sessions(db, current_user.id)
    return {"message": "Successfully logged out from all active sessions"}


@router.get("/me", response_model=UserResponseFields)
def me(current_user: UserModel = Depends(get_current_user)):
    return current_user


@router.post("/verify-email/request")
def request_verification_email(
    payload: EmailVerificationRequest,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify the email provided in body matches or falls back to current logged-in user
    target_user = current_user
    if payload.email and payload.email.lower().strip() != current_user.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot request verification for a different account"
        )
    AuthService.request_email_verification(db, target_user)
    return {"message": "Verification email dispatched successfully"}


@router.post("/verify-email/confirm")
def confirm_verification_email(payload: EmailVerificationConfirmRequest, db: Session = Depends(get_db)):
    AuthService.confirm_email_verification(db, payload.token)
    return {"message": "Email successfully verified"}


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    AuthService.forgot_password(db, payload.email)
    return {"message": "Password recovery email dispatched successfully if user exists"}


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    AuthService.reset_password(db, payload.token, payload.new_password)
    return {"message": "Password successfully reset and all sessions terminated"}


@router.get("/google/login")
def google_login():
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    redirect_uri = _versioned_oauth_redirect_uri("google")
    
    if not client_id or not client_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth is not configured",
        )
    
    google_oauth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={client_id}&"
        f"redirect_uri={redirect_uri}&"
        f"response_type=code&"
        f"scope=openid%20profile%20email"
    )
    return RedirectResponse(url=google_oauth_url)


@router.get("/google/callback")
async def google_callback(code: str, request: Request, db: Session = Depends(get_db)):
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    profile = None
    access_token = "mock_google_access_token"
    refresh_token = "mock_google_refresh_token"
    
    if not client_id or not client_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth is not configured",
        )
    else:
        redirect_uri = _versioned_oauth_redirect_uri("google")
        async with httpx.AsyncClient() as client:
            try:
                token_res = await client.post(
                    "https://oauth2.googleapis.com/token",
                    data={
                        "client_id": client_id,
                        "client_secret": client_secret,
                        "code": code,
                        "grant_type": "authorization_code",
                        "redirect_uri": redirect_uri
                    }
                )
                token_data = token_res.json()
                access_token = token_data.get("access_token")
                refresh_token = token_data.get("refresh_token")
                
                profile_res = await client.get(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                profile_data = profile_res.json()
                profile = {
                    "id": profile_data.get("sub"),
                    "email": profile_data.get("email"),
                    "name": profile_data.get("name"),
                    "picture": profile_data.get("picture")
                }
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Google Authentication failed: {str(e)}"
                )

    if not profile or not profile.get("email"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to retrieve profile details from Google"
        )
        
    email = profile["email"].lower().strip()
    user = db.query(UserModel).filter(UserModel.email == email).first()
    
    if not user:
        user = UserModel(
            name=profile["name"],
            email=email,
            avatar_url=profile["picture"],
            is_verified=True,  # Google verifies email
            auth_provider="google",
            role="user",
            plan="free"
        )
        db.add(user)
        db.flush()
    
    oauth_acc = db.query(OAuthAccountModel).filter(
        OAuthAccountModel.user_id == user.id,
        OAuthAccountModel.provider == "google"
    ).first()
    
    # Provider tokens are encrypted before persistence.
    enc_access = encrypt_token(access_token) if access_token else None
    enc_refresh = encrypt_token(refresh_token) if refresh_token else None
    
    if not oauth_acc:
        oauth_acc = OAuthAccountModel(
            user_id=user.id,
            provider="google",
            provider_user_id=profile["id"],
            provider_email=email,
            access_token_encrypted=enc_access,
            refresh_token_encrypted=enc_refresh
        )
        db.add(oauth_acc)
    else:
        oauth_acc.access_token_encrypted = enc_access
        oauth_acc.refresh_token_encrypted = enc_refresh
        
    db.flush()
    
    app_access = decode_access_token(user.id)
    from app.core.security import create_access_token as make_app_jwt
    app_access = make_app_jwt(user.id)
    
    device_info = request.headers.get("user-agent", "Unknown Device")
    ip_address = request.client.host if request.client else "127.0.0.1"
    app_refresh, _ = AuthService._create_session(db, user.id, device_info, ip_address)
    
    db.commit()
    
    redirect_url = f"{frontend_url}/auth/callback?access_token={app_access}&refresh_token={app_refresh}"
    return RedirectResponse(url=redirect_url)


@router.get("/github/login")
def github_login():
    client_id = os.getenv("GITHUB_CLIENT_ID")
    client_secret = os.getenv("GITHUB_CLIENT_SECRET")
    redirect_uri = _versioned_oauth_redirect_uri("github")
    scope = os.getenv("GITHUB_OAUTH_SCOPE", "read:user user:email repo")
    
    if not client_id or not client_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="GitHub OAuth is not configured",
        )
        
    github_oauth_url = (
        f"https://github.com/login/oauth/authorize?"
        f"client_id={client_id}&"
        f"redirect_uri={redirect_uri}&"
        f"scope={quote(scope)}"
    )
    return RedirectResponse(url=github_oauth_url)


@router.get("/github/callback")
async def github_callback(code: str, request: Request, db: Session = Depends(get_db)):
    client_id = os.getenv("GITHUB_CLIENT_ID")
    client_secret = os.getenv("GITHUB_CLIENT_SECRET")
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    redirect_uri = _versioned_oauth_redirect_uri("github")
    
    profile = None
    access_token = None
    
    if not client_id or not client_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="GitHub OAuth is not configured",
        )
    else:
        async with httpx.AsyncClient() as client:
            token_res = await client.post(
                "https://github.com/login/oauth/access_token",
                data={
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "code": code,
                    "redirect_uri": redirect_uri,
                },
                headers={"Accept": "application/json"},
            )
            token_data = _parse_json_response(token_res, "github", "token", dict)
            if token_data.get("error"):
                logger.warning(
                    "github_oauth_token_error",
                    extra={"error": token_data.get("error"), "status_code": token_res.status_code},
                )
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=GITHUB_AUTH_FAILED_DETAIL,
                )

            access_token = token_data.get("access_token")
            if not access_token:
                logger.warning(
                    "github_oauth_missing_access_token",
                    extra={"status_code": token_res.status_code},
                )
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=GITHUB_AUTH_FAILED_DETAIL,
                )

            github_headers = {
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
            }

            profile_res = await client.get(
                "https://api.github.com/user",
                headers=github_headers,
            )
            profile_data = _parse_json_response(profile_res, "github", "user", dict)
            if not profile_data.get("id") or not profile_data.get("login"):
                logger.warning(
                    "github_oauth_missing_required_user_fields",
                    extra={"status_code": profile_res.status_code},
                )
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=GITHUB_AUTH_FAILED_DETAIL,
                )

            email = profile_data.get("email")
            if not email:
                email_res = await client.get(
                    "https://api.github.com/user/emails",
                    headers=github_headers,
                )
                emails_list = _parse_json_response(email_res, "github", "emails", list)
                email = _extract_verified_github_email(emails_list)

            profile = {
                "id": str(profile_data["id"]),
                "login": profile_data["login"],
                "email": email,
                "name": profile_data.get("name") or profile_data["login"],
                "avatar_url": profile_data.get("avatar_url"),
            }
                
    if not profile or not profile.get("email"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=GITHUB_NO_VERIFIED_EMAIL_DETAIL,
        )
        
    email = profile["email"].lower().strip()
    user = db.query(UserModel).filter(UserModel.email == email).first()
    
    if not user:
        user = UserModel(
            name=profile["name"],
            email=email,
            avatar_url=profile["avatar_url"],
            is_verified=True,  # GitHub verified emails can be trusted
            auth_provider="github",
            role="user",
            plan="free"
        )
        db.add(user)
        db.flush()
        
    oauth_acc = db.query(OAuthAccountModel).filter(
        OAuthAccountModel.user_id == user.id,
        OAuthAccountModel.provider == "github"
    ).first()
    
    enc_access = encrypt_token(access_token) if access_token else None
    
    if not oauth_acc:
        oauth_acc = OAuthAccountModel(
            user_id=user.id,
            provider="github",
            provider_user_id=profile["id"],
            provider_email=email,
            access_token_encrypted=enc_access
        )
        db.add(oauth_acc)
    else:
        oauth_acc.access_token_encrypted = enc_access

    github_integration = db.query(GithubIntegration).filter(
        GithubIntegration.user_id == user.id
    ).first()
    if not github_integration:
        github_integration = GithubIntegration(user_id=user.id)
        db.add(github_integration)
    github_integration.github_user_id = profile["id"]
    github_integration.github_username = profile.get("login") or profile["name"]
    github_integration.access_token = enc_access
        
    db.flush()
    
    from app.core.security import create_access_token as make_app_jwt
    app_access = make_app_jwt(user.id)
    
    device_info = request.headers.get("user-agent", "Unknown Device")
    ip_address = request.client.host if request.client else "127.0.0.1"
    app_refresh, _ = AuthService._create_session(db, user.id, device_info, ip_address)
    
    db.commit()
    
    redirect_url = f"{frontend_url}/auth/callback?access_token={app_access}&refresh_token={app_refresh}"
    return RedirectResponse(url=redirect_url)


@router.get("/sessions", response_model=List[SessionResponse])
def get_active_sessions(current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    return AuthService.get_sessions(db, current_user.id)


@router.delete("/sessions/{session_id}")
def revoke_active_session(
    session_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    AuthService.revoke_session(db, current_user.id, session_id)
    return {"message": "Session successfully revoked"}

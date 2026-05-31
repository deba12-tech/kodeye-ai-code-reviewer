import datetime
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import User as UserModel
from app.models.session import UserSession as UserSessionModel
from app.models.auth_tokens import PasswordResetToken as PasswordResetTokenModel, EmailVerificationToken as EmailVerificationTokenModel
from app.core.security import hash_password, verify_password, generate_secure_token, hash_token, create_access_token
from app.services.email_service import email_service

REFRESH_TOKEN_EXPIRE_DAYS = 30

class AuthService:
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> UserModel:
        return db.query(UserModel).filter(UserModel.email == email.lower().strip()).first()

    @staticmethod
    def _create_session(db: Session, user_id: int, device_info: str = None, ip_address: str = None) -> tuple[str, UserSessionModel]:
        """Helper to generate a refresh token and create a secure UserSession in the DB."""
        raw_refresh_token = generate_secure_token()
        hashed_refresh = hash_token(raw_refresh_token)
        
        expires_at = datetime.datetime.utcnow() + datetime.timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        
        db_session = UserSessionModel(
            user_id=user_id,
            refresh_token_hash=hashed_refresh,
            device_info=device_info,
            ip_address=ip_address,
            is_active=True,
            expires_at=expires_at
        )
        db.add(db_session)
        db.flush()
        
        return raw_refresh_token, db_session

    @staticmethod
    def register_user(db: Session, name: str, email: str, password: str, device_info: str = None, ip_address: str = None) -> dict:
        normalized_email = email.lower().strip()
        
        existing_user = db.query(UserModel).filter(UserModel.email == normalized_email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already registered"
            )
        
        hashed = hash_password(password)
        new_user = UserModel(
            name=name,
            email=normalized_email,
            password_hash=hashed,
            is_verified=False,
            auth_provider="email",
            role="user",
            plan="free"
        )
        db.add(new_user)
        db.flush()
        
        verify_token = generate_secure_token()
        hashed_verify_token = hash_token(verify_token)
        
        db_verify = EmailVerificationTokenModel(
            user_id=new_user.id,
            token_hash=hashed_verify_token,
            expires_at=datetime.datetime.utcnow() + datetime.timedelta(hours=24),
            used=False
        )
        db.add(db_verify)
        
        email_service.send_verification_email(new_user.email, verify_token)
        email_service.send_welcome_email(new_user.email, new_user.name)
        
        access_token = create_access_token(new_user.id)
        refresh_token, _ = AuthService._create_session(db, new_user.id, device_info, ip_address)
        
        db.commit()
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": new_user
        }

    @staticmethod
    def login_user(db: Session, email: str, password: str, device_info: str = None, ip_address: str = None) -> dict:
        normalized_email = email.lower().strip()
        user = db.query(UserModel).filter(UserModel.email == normalized_email).first()
        
        if not user or not user.password_hash:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email or password"
            )
        
        if not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email or password"
            )
        
        access_token = create_access_token(user.id)
        refresh_token, _ = AuthService._create_session(db, user.id, device_info, ip_address)
        
        db.commit()
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": user
        }

    @staticmethod
    def refresh_session(db: Session, refresh_token: str, device_info: str = None, ip_address: str = None) -> dict:
        hashed_refresh = hash_token(refresh_token)
        
        session = db.query(UserSessionModel).filter(
            UserSessionModel.refresh_token_hash == hashed_refresh,
            UserSessionModel.is_active == True
        ).first()
        
        if not session or session.expires_at < datetime.datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token"
            )
        
        user = db.query(UserModel).filter(UserModel.id == session.user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # Refresh Token Rotation: revoke old session and create a brand-new one
        session.is_active = False
        
        access_token = create_access_token(user.id)
        new_refresh_token, _ = AuthService._create_session(
            db, user.id, 
            device_info=device_info or session.device_info, 
            ip_address=ip_address or session.ip_address
        )
        
        db.commit()
        
        return {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
            "user": user
        }

    @staticmethod
    def logout_session(db: Session, refresh_token: str):
        hashed_refresh = hash_token(refresh_token)
        session = db.query(UserSessionModel).filter(UserSessionModel.refresh_token_hash == hashed_refresh).first()
        if session:
            session.is_active = False
            db.commit()

    @staticmethod
    def logout_all_sessions(db: Session, user_id: int):
        sessions = db.query(UserSessionModel).filter(
            UserSessionModel.user_id == user_id,
            UserSessionModel.is_active == True
        ).all()
        for session in sessions:
            session.is_active = False
        db.commit()

    @staticmethod
    def request_email_verification(db: Session, user: UserModel):
        verify_token = generate_secure_token()
        hashed_verify_token = hash_token(verify_token)
        
        old_tokens = db.query(EmailVerificationTokenModel).filter(
            EmailVerificationTokenModel.user_id == user.id,
            EmailVerificationTokenModel.used == False
        ).all()
        for t in old_tokens:
            t.used = True
        
        db_verify = EmailVerificationTokenModel(
            user_id=user.id,
            token_hash=hashed_verify_token,
            expires_at=datetime.datetime.utcnow() + datetime.timedelta(hours=24),
            used=False
        )
        db.add(db_verify)
        
        email_service.send_verification_email(user.email, verify_token)
        db.commit()

    @staticmethod
    def confirm_email_verification(db: Session, token: str):
        hashed_token = hash_token(token)
        db_token = db.query(EmailVerificationTokenModel).filter(
            EmailVerificationTokenModel.token_hash == hashed_token,
            EmailVerificationTokenModel.used == False
        ).first()
        
        if not db_token or db_token.expires_at < datetime.datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification token"
            )
        
        db_token.used = True
        
        user = db.query(UserModel).filter(UserModel.id == db_token.user_id).first()
        if user:
            user.is_verified = True
            
        db.commit()

    @staticmethod
    def forgot_password(db: Session, email: str):
        normalized_email = email.lower().strip()
        user = db.query(UserModel).filter(UserModel.email == normalized_email).first()
        
        # For security / user enumeration prevention, silently return if user not found
        if not user:
            return
        
        reset_token = generate_secure_token()
        hashed_reset_token = hash_token(reset_token)
        
        old_tokens = db.query(PasswordResetTokenModel).filter(
            PasswordResetTokenModel.user_id == user.id,
            PasswordResetTokenModel.used == False
        ).all()
        for t in old_tokens:
            t.used = True
            
        db_reset = PasswordResetTokenModel(
            user_id=user.id,
            token_hash=hashed_reset_token,
            expires_at=datetime.datetime.utcnow() + datetime.timedelta(hours=1),
            used=False
        )
        db.add(db_reset)
        
        email_service.send_password_reset_email(user.email, reset_token)
        db.commit()

    @staticmethod
    def reset_password(db: Session, token: str, new_password: str):
        hashed_token = hash_token(token)
        db_token = db.query(PasswordResetTokenModel).filter(
            PasswordResetTokenModel.token_hash == hashed_token,
            PasswordResetTokenModel.used == False
        ).first()
        
        if not db_token or db_token.expires_at < datetime.datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired password reset token"
            )
        
        db_token.used = True
        
        user = db.query(UserModel).filter(UserModel.id == db_token.user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
            
        user.password_hash = hash_password(new_password)
        
        # For enhanced security, revoke all active sessions after reset
        AuthService.logout_all_sessions(db, user.id)
        db.commit()

    @staticmethod
    def get_sessions(db: Session, user_id: int) -> list[UserSessionModel]:
        return db.query(UserSessionModel).filter(
            UserSessionModel.user_id == user_id,
            UserSessionModel.is_active == True,
            UserSessionModel.expires_at > datetime.datetime.utcnow()
        ).all()

    @staticmethod
    def revoke_session(db: Session, user_id: int, session_id: int):
        session = db.query(UserSessionModel).filter(
            UserSessionModel.id == session_id,
            UserSessionModel.user_id == user_id
        ).first()
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        session.is_active = False
        db.commit()

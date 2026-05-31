import datetime
import hashlib
import os
import secrets
from typing import Union, Any
import jwt
import bcrypt

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "kodeye-default-development-jwt-secret-key-302194820")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))

def hash_password(password: str) -> str:
    """Hash password with bcrypt."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(password: str, password_hash: str) -> bool:
    """Verify password with bcrypt."""
    if not password_hash:
        return False
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except Exception:
        return False

def generate_secure_token() -> str:
    """Generate a secure cryptographically random token."""
    return secrets.token_urlsafe(48)

def hash_token(token: str) -> str:
    """Hash a token using SHA-256 to store in the database."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

def create_access_token(subject: Union[str, Any], expires_delta: datetime.timedelta = None) -> str:
    """Create a signed JWT access token."""
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "access"
    }
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def decode_access_token(token: str) -> Union[str, None]:
    """Decode a signed JWT access token and return the subject if valid."""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            return None
        return payload.get("sub")
    except jwt.PyJWTError:
        return None

import base64
import os
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

TOKEN_ENCRYPTION_KEY = os.getenv("TOKEN_ENCRYPTION_KEY")

def get_fernet() -> Fernet:
    """Gets a Fernet instance using the configured TOKEN_ENCRYPTION_KEY,
    or generates a stable, derived fallback key from JWT_SECRET_KEY to maintain consistency."""
    key = TOKEN_ENCRYPTION_KEY
    if not key:
        # Generate a stable key based on the JWT_SECRET_KEY so it remains consistent across restarts
        jwt_secret = os.getenv("JWT_SECRET_KEY", "kodeye-default-development-jwt-secret-key-302194820")
        salt = b"kodeye-oauth-encryption-salt-deterministic"
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        derived = kdf.derive(jwt_secret.encode("utf-8"))
        key = base64.urlsafe_b64encode(derived).decode("utf-8")
    
    try:
        return Fernet(key.encode("utf-8"))
    except Exception:
        # Safe fallback: derive a correct Fernet key if the custom key isn't URL-safe base64
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=b"kodeye-oauth-safe-fallback-salt",
            iterations=100000,
        )
        derived = kdf.derive(str(key).encode("utf-8"))
        stable_key = base64.urlsafe_b64encode(derived).decode("utf-8")
        return Fernet(stable_key.encode("utf-8"))

def encrypt_token(token: str) -> str:
    """Encrypt OAuth token using Fernet symmetric encryption."""
    if not token:
        return None
    f = get_fernet()
    return f.encrypt(token.encode("utf-8")).decode("utf-8")

def decrypt_token(encrypted_token: str) -> str:
    """Decrypt encrypted OAuth token."""
    if not encrypted_token:
        return None
    try:
        f = get_fernet()
        return f.decrypt(encrypted_token.encode("utf-8")).decode("utf-8")
    except Exception:
        return None

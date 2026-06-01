import os
from typing import List
from urllib.parse import urlparse
from pydantic_settings import BaseSettings


def _parse_csv(value: str) -> List[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


class Settings(BaseSettings):
    APP_NAME: str = "Kodeye Security Audit Engine"
    API_V1_STR: str = "/api/v1"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "true" if ENVIRONMENT == "development" else "false").lower() == "true"
    
    SERVER_HOST: str = os.getenv("SERVER_HOST", "0.0.0.0")
    SERVER_PORT: int = int(os.getenv("SERVER_PORT", "8000"))
    
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./kodeye.db"
    )
    
    JWT_SECRET_KEY: str = os.getenv(
        "JWT_SECRET_KEY",
        "kodeye-default-development-jwt-secret-key-302194820"
    )
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15")
    )
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(
        os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "30")
    )
    
    TOKEN_ENCRYPTION_KEY: str = os.getenv("TOKEN_ENCRYPTION_KEY", "")
    
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]
    
    @property
    def CORS_ORIGINS_LIST(self) -> List[str]:
        """Get CORS origins from environment if set."""
        env_origins = os.getenv("CORS_ORIGINS", "")
        if env_origins:
            return [origin.strip() for origin in env_origins.split(",")]
        return self.CORS_ORIGINS
    
    EMAIL_BACKEND: str = os.getenv("EMAIL_BACKEND", "console")  # console, smtp, sendgrid
    SMTP_HOST: str = os.getenv("SMTP_HOST", "localhost")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM_EMAIL: str = os.getenv("SMTP_FROM_EMAIL", "noreply@kodeye.com")
    
    SENDGRID_API_KEY: str = os.getenv("SENDGRID_API_KEY", "")
    SENDGRID_FROM_EMAIL: str = os.getenv("SENDGRID_FROM_EMAIL", "noreply@kodeye.com")
    
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:8000")
    ALLOWED_HOSTS: str = os.getenv("ALLOWED_HOSTS", "")
    
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_REDIRECT_URI: str = os.getenv("GOOGLE_REDIRECT_URI", "")
    
    GITHUB_CLIENT_ID: str = os.getenv("GITHUB_CLIENT_ID", "")
    GITHUB_CLIENT_SECRET: str = os.getenv("GITHUB_CLIENT_SECRET", "")
    GITHUB_REDIRECT_URI: str = os.getenv("GITHUB_REDIRECT_URI", "")
    
    SENTRY_DSN: str = os.getenv("SENTRY_DSN", "")
    SENTRY_ENABLED: bool = bool(SENTRY_DSN)
    
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    @property
    def ALLOWED_HOSTS_LIST(self) -> List[str]:
        """Get TrustedHostMiddleware hosts from env or safe local defaults."""
        env_hosts = _parse_csv(os.getenv("ALLOWED_HOSTS", self.ALLOWED_HOSTS))
        if env_hosts:
            return env_hosts

        hosts = ["localhost", "127.0.0.1"]
        if self.ENVIRONMENT in ("test", "development"):
            hosts.append("testserver")

        backend_hostname = urlparse(self.BACKEND_URL).hostname
        if self.ENVIRONMENT == "production" and backend_hostname:
            hosts.append(backend_hostname)

        return list(dict.fromkeys(hosts))
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()


def validate_production_settings(config: Settings) -> None:
    """Fail fast for unsafe production configuration."""
    if config.ENVIRONMENT != "production":
        return
    database_url = getattr(config, "DATABASE_URL", "")
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    if not database_url.startswith("postgresql"):
        raise ValueError("DATABASE_URL must be set to a valid PostgreSQL URL in production")
    if config.DEBUG:
        raise ValueError("DEBUG must be false in production")
    if not config.JWT_SECRET_KEY or len(config.JWT_SECRET_KEY) < 32 or config.JWT_SECRET_KEY.startswith("kodeye-default"):
        raise ValueError("JWT_SECRET_KEY must be a strong production secret")
    if "*" in config.CORS_ORIGINS_LIST:
        raise ValueError("CORS_ORIGINS must not contain '*' in production")
    if "*" in config.ALLOWED_HOSTS_LIST:
        raise ValueError("ALLOWED_HOSTS must not contain '*' in production")
    if not config.TOKEN_ENCRYPTION_KEY:
        raise ValueError("TOKEN_ENCRYPTION_KEY is required in production")


validate_production_settings(settings)

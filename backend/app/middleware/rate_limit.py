"""
Rate limiting middleware for Kodeye backend.
Uses slowapi to implement per-endpoint and per-IP rate limiting.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import FastAPI, status
from fastapi.responses import JSONResponse
from fastapi.requests import Request
import structlog

logger = structlog.get_logger()

limiter = Limiter(key_func=get_remote_address)


def setup_rate_limiting(app: FastAPI) -> None:
    """
    Setup rate limiting for the FastAPI application.
    
    Args:
        app: FastAPI application instance
    """
    
    app.state.limiter = limiter
    
    @app.exception_handler(RateLimitExceeded)
    async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
        """Handle rate limit exceeded errors."""
        logger.warning(
            "rate_limit_exceeded",
            path=request.url.path,
            method=request.method,
            client_ip=request.client.host if request.client else "unknown",
            limit_info=exc.detail,
        )
        
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "error": {
                    "code": "RATE_LIMIT_EXCEEDED",
                    "message": "Too many requests. Please try again later.",
                    "details": {
                        "retry_after": exc.headers.get("Retry-After", "60"),
                    },
                },
            },
            headers={
                "Retry-After": exc.headers.get("Retry-After", "60"),
            },
        )



RATE_LIMITS = {
    "auth_login": "5/minute",
    "auth_register": "3/minute",
    "auth_verify": "10/hour",
    "auth_forgot_password": "5/minute",
    "reviews_analyze": "20/minute",
    "api_general": "100/minute",
}

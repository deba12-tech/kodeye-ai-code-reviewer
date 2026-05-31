"""
Security headers middleware for Kodeye backend.
Adds important security headers to all responses.
"""

from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from starlette.responses import Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware that adds security headers to all HTTP responses.
    Protects against common web vulnerabilities.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        """
        Add security headers to response.
        
        Args:
            request: FastAPI request object
            call_next: Next middleware in chain
            
        Returns:
            Response with security headers added
        """
        
        response = await call_next(request)
        
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        response.headers["X-Frame-Options"] = "DENY"
        
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        response.headers["Permissions-Policy"] = (
            "geolocation=(), "
            "microphone=(), "
            "camera=(), "
            "payment=()"
        )
        
        # Strict-Transport-Security (HSTS)
        # Note: Only enable in production with https
        if request.url.scheme == "https":
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains; preload"
            )
        
        csp_policy = (
            "default-src 'self'; "
            "script-src 'self' 'wasm-unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self' https://accounts.google.com https://github.com; "
            "frame-ancestors 'none'; "
            "form-action 'self'; "
            "upgrade-insecure-requests;"
        )
        response.headers["Content-Security-Policy"] = csp_policy
        
        return response

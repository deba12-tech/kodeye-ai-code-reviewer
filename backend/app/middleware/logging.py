"""
Request/Response logging middleware for Kodeye backend.
Logs all incoming requests and outgoing responses with timing and status info.
"""

import time
import json
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import structlog

logger = structlog.get_logger()


class LoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware that logs all HTTP requests and responses.
    Tracks request duration and includes request/response details.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        """
        Process the request and log details.
        
        Args:
            request: FastAPI request object
            call_next: Next middleware in chain
            
        Returns:
            Response from next middleware
        """
        method = request.method
        path = request.url.path
        query_string = request.url.query
        client_host = request.client.host if request.client else "unknown"
        
        start_time = time.time()
        
        logger.info(
            "request_started",
            method=method,
            path=path,
            query=query_string,
            client_ip=client_host,
            user_agent=request.headers.get("user-agent", "unknown"),
        )
        
        try:
            response = await call_next(request)
            
            duration_ms = (time.time() - start_time) * 1000
            
            logger.info(
                "request_completed",
                method=method,
                path=path,
                status_code=response.status_code,
                duration_ms=round(duration_ms, 2),
                client_ip=client_host,
            )
            
            response.headers["X-Process-Time"] = str(duration_ms / 1000)
            
            return response
            
        except Exception as exc:
            duration_ms = (time.time() - start_time) * 1000
            
            logger.error(
                "request_failed",
                method=method,
                path=path,
                error=str(exc),
                duration_ms=round(duration_ms, 2),
                client_ip=client_host,
                exc_info=True,
            )
            
            raise

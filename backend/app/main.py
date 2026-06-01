from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import structlog
import sentry_sdk

from app.core.config import settings
from app.middleware import (
    setup_exception_handlers,
    LoggingMiddleware,
    setup_rate_limiting,
    SecurityHeadersMiddleware,
)
from app.middleware.rate_limit import limiter, RATE_LIMITS
import app.models

if settings.SENTRY_ENABLED:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        traces_sample_rate=0.1 if settings.DEBUG else 1.0,
        environment=settings.ENVIRONMENT,
    )

structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer(),
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for Kodeye AI-powered code review platform",
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
)


app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS_LIST,
)

app.add_middleware(SecurityHeadersMiddleware)

app.add_middleware(LoggingMiddleware)

cors_origins = settings.CORS_ORIGINS_LIST

# Keep CORS outermost so browser preflight OPTIONS requests do not reach auth,
# logging, security, or trusted-host middleware before CORSMiddleware can reply.
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["X-Process-Time", "X-Total-Count"],
)

setup_exception_handlers(app)

setup_rate_limiting(app)
app.state.limiter = limiter
app.state.rate_limits = RATE_LIMITS

@app.get("/")
def root():
    """Root endpoint - basic health check."""
    return {
        "message": f"Kodeye {settings.APP_NAME} is running",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }


from app.api.v1 import router as v1_router
app.include_router(v1_router)

from app.api.reviews import router as reviews_router
from app.api.auth import router as auth_router

app.include_router(reviews_router, tags=["Reviews"])
app.include_router(auth_router, tags=["Authentication"])

@app.on_event("startup")
async def startup_event():
    """Application startup event."""
    logger.info(
        "application_startup",
        app_name=settings.APP_NAME,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        debug=settings.DEBUG,
    )
    logger.info("loaded_cors_origins", origins=cors_origins)


@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event."""
    logger.info(
        "application_shutdown",
        app_name=settings.APP_NAME,
    )

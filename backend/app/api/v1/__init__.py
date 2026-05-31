"""
API v1 endpoints for Kodeye.
All endpoints should be organized under v1 for future versioning.
"""

from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.github import router as github_router
from app.api.v1.health import router as health_router
from app.api.v1.issues import router as issues_router
from app.api.v1.reviews import router as reviews_router
from app.api.v1.users import router as users_router

router = APIRouter(prefix="/api/v1")

router.include_router(health_router)
router.include_router(auth_router)
router.include_router(users_router)
router.include_router(reviews_router)
router.include_router(issues_router)
router.include_router(dashboard_router)
router.include_router(github_router)

__all__ = ["router"]

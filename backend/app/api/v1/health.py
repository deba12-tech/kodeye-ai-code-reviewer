"""
Health check endpoints for monitoring application status.
"""

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.db.database import get_db
import structlog

logger = structlog.get_logger()

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("")
async def health_check():
    """
    Basic health check endpoint.
    
    Returns:
        dict: Status response
    """
    return {
        "status": "healthy",
        "service": "Kodeye Backend",
        "version": "1.0.0",
    }


@router.get("/ready")
async def readiness_check(db: Session = Depends(get_db)):
    """
    Readiness check that includes database connectivity.
    Used by load balancers and orchestration systems.
    
    Args:
        db: Database session
        
    Returns:
        dict: Readiness status with component checks
    """
    try:
        db.execute(text("SELECT 1"))
        db_status = "ready"
    except Exception as e:
        logger.error("database_readiness_check_failed", error=str(e))
        db_status = "not_ready"
    
    return {
        "status": "ready" if db_status == "ready" else "not_ready",
        "components": {
            "database": db_status,
        },
    }


@router.get("/live")
async def liveness_check():
    """
    Liveness check endpoint.
    Returns success if the service is running.
    Used by Kubernetes and orchestration systems.
    
    Returns:
        dict: Liveness status
    """
    return {
        "status": "alive",
        "service": "Kodeye Backend",
    }

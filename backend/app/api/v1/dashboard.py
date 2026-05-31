"""Dashboard API endpoints."""

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.v1.dependencies import get_current_user, get_db
from app.middleware.rate_limit import limiter
from app.models.issue import Issue
from app.models.review import Review
from app.models.user import User
from app.schemas.review import DashboardStatsResponse


router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStatsResponse, status_code=status.HTTP_200_OK)
@limiter.limit("60/minute")
def get_dashboard_stats(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DashboardStatsResponse:
    """Return dashboard metrics scoped to the authenticated user."""
    reviews_query = db.query(Review).filter(Review.user_id == current_user.id)
    issues_query = db.query(Issue).filter(Issue.user_id == current_user.id)

    total_reviews = reviews_query.count()
    total_issues = issues_query.count()
    open_issues = issues_query.filter(Issue.status.in_(["Open", "In Progress"])).count()
    fixed_issues = issues_query.filter(Issue.status == "Fixed").count()
    critical_issues = issues_query.filter(Issue.severity == "Critical", Issue.status != "Fixed").count()
    average_score = db.query(func.avg(Review.score)).filter(Review.user_id == current_user.id).scalar() or 0
    recent_reviews = reviews_query.order_by(Review.created_at.desc(), Review.id.desc()).limit(5).all()
    for review in recent_reviews:
        review.issues_count = len(review.issues)

    return DashboardStatsResponse(
        total_reviews=total_reviews,
        total_issues=total_issues,
        open_issues=open_issues,
        fixed_issues=fixed_issues,
        critical_issues=critical_issues,
        average_score=round(float(average_score), 2),
        recent_reviews=recent_reviews,
    )

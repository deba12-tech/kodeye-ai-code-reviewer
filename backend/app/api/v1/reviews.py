"""Review API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.v1.dependencies import get_current_user, get_db
from app.api.reviews import get_optional_user
from app.middleware.rate_limit import limiter
from app.models.issue import Issue as IssueModel
from app.models.review import Review
from app.models.user import User
from app.scanners.scanner_engine import InvalidCodeError, analyze_code
from app.schemas.pagination import PaginatedResponse
from app.schemas.review import ReviewListItem, ReviewRequest, ReviewResponse
from app.utils.pagination import PaginationParams, paginate_query, pagination_params


router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.post("/analyze", response_model=ReviewResponse)
@limiter.limit("20/minute")
def analyze_review(payload: ReviewRequest, request: Request, db: Session = Depends(get_db)):
    """Analyze code, persist the review and detected issues, and return the report."""
    if not payload.code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty.")

    try:
        result = analyze_code(payload.code, payload.language)
    except InvalidCodeError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    current_user = get_optional_user(request, db)
    user_id = current_user.id if current_user else None

    db_review = Review(
        project_name=payload.project_name,
        language=payload.language,
        score=result["score"],
        summary=result["summary"],
        improved_code=result["improved_code"],
        source_provider=payload.source_provider,
        source_repo=payload.source_repo,
        source_branch=payload.source_branch,
        source_path=payload.source_path,
        source_url=payload.source_url,
        user_id=user_id,
    )
    db.add(db_review)
    db.flush()

    for issue in result["issues"]:
        db.add(
            IssueModel(
                title=issue["title"],
                severity=issue["severity"],
                category=issue["category"],
                line_number=issue["line_number"],
                description=issue["description"],
                suggested_fix=issue["suggested_fix"],
                fixed_code=issue["fixed_code"],
                review_id=db_review.id,
                user_id=user_id,
            )
        )

    db.commit()

    return {
        "review_id": db_review.id,
        "project_name": payload.project_name,
        "language": payload.language,
        "score": result["score"],
        "summary": result["summary"],
        "issues": result["issues"],
        "improved_code": result["improved_code"],
        "source_provider": payload.source_provider,
        "source_repo": payload.source_repo,
        "source_branch": payload.source_branch,
        "source_path": payload.source_path,
        "source_url": payload.source_url,
    }


@router.get("", response_model=PaginatedResponse[ReviewListItem], status_code=status.HTTP_200_OK)
@limiter.limit("60/minute")
def list_reviews(
    request: Request,
    params: PaginationParams = Depends(pagination_params),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PaginatedResponse[ReviewListItem]:
    """List reviews with pagination, search, and safe sorting."""
    query = db.query(Review).filter(Review.user_id == current_user.id)
    response = paginate_query(
        query,
        params,
        search_columns=(Review.project_name, Review.language, Review.summary),
        allowed_sort_columns={
            "id": Review.id,
            "project_name": Review.project_name,
            "language": Review.language,
            "score": Review.score,
            "created_at": Review.created_at,
        },
        default_sort="id",
    )
    for item in response.items:
        item.issues_count = len(item.issues)
    return response


@router.get("/{review_id}", response_model=ReviewResponse, status_code=status.HTTP_200_OK)
@limiter.limit("60/minute")
def get_review(
    review_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ReviewResponse:
    """Fetch a review by ID."""
    review = (
        db.query(Review)
        .filter(Review.id == review_id, Review.user_id == current_user.id)
        .first()
    )
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    return {
        "review_id": review.id,
        "project_name": review.project_name,
        "language": review.language,
        "score": review.score,
        "summary": review.summary or "",
        "issues": review.issues,
        "improved_code": review.improved_code or "",
        "source_provider": review.source_provider,
        "source_repo": review.source_repo,
        "source_branch": review.source_branch,
        "source_path": review.source_path,
        "source_url": review.source_url,
    }


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
def delete_review(
    review_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    """Delete an owned review and its issues."""
    review = (
        db.query(Review)
        .filter(Review.id == review_id, Review.user_id == current_user.id)
        .first()
    )
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    db.delete(review)
    db.commit()

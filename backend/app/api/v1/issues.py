"""Issue API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.v1.dependencies import get_current_user, get_db
from app.middleware.rate_limit import limiter
from app.models.issue import Issue
from app.models.review import Review
from app.models.user import User
from app.schemas.pagination import PaginatedResponse
from app.schemas.review import IssueListItem, IssueUpdateRequest
from app.utils.pagination import PaginationParams, paginate_query, pagination_params


router = APIRouter(prefix="/issues", tags=["Issues"])


@router.get("", response_model=PaginatedResponse[IssueListItem], status_code=status.HTTP_200_OK)
@limiter.limit("60/minute")
def list_issues(
    request: Request,
    params: PaginationParams = Depends(pagination_params),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PaginatedResponse[IssueListItem]:
    """List issues with pagination, search, and safe sorting."""
    query = db.query(Issue).filter(Issue.user_id == current_user.id)
    response = paginate_query(
        query,
        params,
        search_columns=(Issue.title, Issue.severity, Issue.category, Issue.description),
        allowed_sort_columns={
            "id": Issue.id,
            "title": Issue.title,
            "severity": Issue.severity,
            "category": Issue.category,
            "line_number": Issue.line_number,
        },
        default_sort="id",
    )
    for item in response.items:
        item.project_name = item.review.project_name if item.review else None
    return response


@router.get("/{issue_id}", response_model=IssueListItem, status_code=status.HTTP_200_OK)
@limiter.limit("60/minute")
def get_issue(
    issue_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> IssueListItem:
    """Fetch an owned issue."""
    issue = (
        db.query(Issue)
        .filter(Issue.id == issue_id, Issue.user_id == current_user.id)
        .first()
    )
    if not issue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found")
    issue.project_name = issue.review.project_name if issue.review else None
    return issue


@router.patch("/{issue_id}", response_model=IssueListItem, status_code=status.HTTP_200_OK)
@limiter.limit("60/minute")
def update_issue(
    issue_id: int,
    payload: IssueUpdateRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> IssueListItem:
    """Update an owned issue."""
    issue = (
        db.query(Issue)
        .filter(Issue.id == issue_id, Issue.user_id == current_user.id)
        .first()
    )
    if not issue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found")
    if payload.status is not None:
        allowed = {"Open", "In Progress", "Fixed", "Ignored"}
        if payload.status not in allowed:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid issue status")
        issue.status = payload.status
    db.commit()
    db.refresh(issue)
    issue.project_name = issue.review.project_name if issue.review else None
    return issue


@router.delete("/{issue_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
def delete_issue(
    issue_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    """Delete an owned issue."""
    issue = (
        db.query(Issue)
        .filter(Issue.id == issue_id, Issue.user_id == current_user.id)
        .first()
    )
    if not issue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found")
    db.delete(issue)
    db.commit()

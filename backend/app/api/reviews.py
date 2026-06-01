from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.review import ReviewRequest, ReviewResponse
from app.scanners.scanner_engine import InvalidCodeError, analyze_code
from app.models.review import Review as ReviewModel
from app.models.issue import Issue as IssueModel
from app.models.user import User as UserModel
from app.core.security import decode_access_token

router = APIRouter(prefix="/reviews", tags=["Reviews"])


def get_optional_user(request: Request, db: Session) -> UserModel | None:
    """Helper to inspect the Authorization header and return the user if valid, or None otherwise."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.lower().startswith("bearer "):
        return None
    parts = auth_header.split(" ")
    if len(parts) != 2:
        return None
    token = parts[1]
    user_id_str = decode_access_token(token)
    if not user_id_str:
        return None
    try:
        user_id = int(user_id_str)
        return db.query(UserModel).filter(UserModel.id == user_id).first()
    except Exception:
        return None


@router.post("/analyze", response_model=ReviewResponse)
def analyze_review(payload: ReviewRequest, request: Request, db: Session = Depends(get_db)):
    if not payload.code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty.")

    try:
        result = analyze_code(payload.code, payload.language)
    except InvalidCodeError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    current_user = get_optional_user(request, db)
    user_id = current_user.id if current_user else None

    db_review = ReviewModel(
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
        user_id=user_id
    )
    db.add(db_review)
    db.flush()

    for issue in result["issues"]:
        db_issue = IssueModel(
            title=issue["title"],
            severity=issue["severity"],
            category=issue["category"],
            line_number=issue["line_number"],
            description=issue["description"],
            suggested_fix=issue["suggested_fix"],
            fixed_code=issue["fixed_code"],
            review_id=db_review.id,
            user_id=user_id
        )
        db.add(db_issue)

    db.commit()

    return {
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

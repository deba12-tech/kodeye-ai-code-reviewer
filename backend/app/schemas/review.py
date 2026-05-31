from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict


Severity = Literal["Critical", "High", "Medium", "Low"]
Category = Literal["Security", "Bug", "Performance", "Readability", "Best Practice"]


class ReviewRequest(BaseModel):
    project_name: str
    language: str
    code: str
    review_depth: Literal["quick", "deep"] = "quick"
    source_provider: Optional[str] = None
    source_repo: Optional[str] = None
    source_branch: Optional[str] = None
    source_path: Optional[str] = None
    source_url: Optional[str] = None


class Issue(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    title: str
    severity: Severity
    category: Category
    line_number: int
    description: str
    suggested_fix: str
    fixed_code: Optional[str] = ""


class ReviewResponse(BaseModel):
    review_id: Optional[int] = None
    project_name: str
    language: str
    score: int
    summary: str
    issues: List[Issue]
    improved_code: str
    source_provider: Optional[str] = None
    source_repo: Optional[str] = None
    source_branch: Optional[str] = None
    source_path: Optional[str] = None
    source_url: Optional[str] = None


class ReviewListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_name: str
    language: str
    score: int
    summary: Optional[str] = None
    improved_code: Optional[str] = None
    user_id: Optional[int] = None
    project_id: Optional[int] = None
    source_provider: Optional[str] = None
    source_repo: Optional[str] = None
    source_branch: Optional[str] = None
    source_path: Optional[str] = None
    source_url: Optional[str] = None
    created_at: datetime
    issues_count: int = 0


class IssueListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    severity: str
    category: str
    line_number: int
    description: str
    suggested_fix: Optional[str] = None
    fixed_code: Optional[str] = None
    status: str = "Open"
    github_issue_url: Optional[str] = None
    github_repo: Optional[str] = None
    review_id: int
    user_id: Optional[int] = None
    project_name: Optional[str] = None


class IssueUpdateRequest(BaseModel):
    status: Optional[str] = None


class DashboardStatsResponse(BaseModel):
    total_reviews: int
    total_issues: int
    open_issues: int
    fixed_issues: int
    critical_issues: int
    average_score: float
    recent_reviews: list[ReviewListItem]

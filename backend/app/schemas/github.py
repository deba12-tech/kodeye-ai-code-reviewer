"""GitHub integration schemas."""

from pydantic import BaseModel, Field


class GitHubConnectRequest(BaseModel):
    access_token: str = Field(..., min_length=1)


class GitHubProfileResponse(BaseModel):
    connected: bool
    username: str | None = None
    github_user_id: str | None = None


class GitHubRepoResponse(BaseModel):
    name: str
    full_name: str
    owner: str
    default_branch: str
    private: bool
    html_url: str
    language: str | None = None
    updated_at: str | None = None


class GitHubRepoFileItem(BaseModel):
    name: str
    path: str
    type: str
    size: int | None = None
    language: str | None = None
    importable: bool


class GitHubRepoFilesResponse(BaseModel):
    repo: str
    branch: str
    path: str
    items: list[GitHubRepoFileItem]


class GitHubRepoFileContentResponse(BaseModel):
    repo: str
    branch: str
    path: str
    name: str
    language: str
    content: str


class GitHubScanFileRequest(BaseModel):
    path: str = Field(..., min_length=1)
    branch: str | None = None
    project_name: str | None = None


class GitHubScanFileResponse(BaseModel):
    review_id: int
    project_name: str
    language: str
    score: int
    issues_count: int


class GitHubIssueCreateRequest(BaseModel):
    issue_id: int
    repo: str = Field(..., min_length=1, description="Repository full name, e.g. owner/repo")


class GitHubIssueCreateResponse(BaseModel):
    issue_url: str
    repo: str

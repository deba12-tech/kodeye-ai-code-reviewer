"""Reusable pagination response schemas."""

from typing import Generic, TypeVar

from pydantic import BaseModel, Field


T = TypeVar("T")


class PaginationMeta(BaseModel):
    """Metadata describing a paginated result set."""

    page: int = Field(..., ge=1)
    limit: int = Field(..., ge=1, le=100)
    total: int = Field(..., ge=0)
    total_pages: int = Field(..., ge=0)
    has_next: bool
    has_prev: bool


class PaginatedResponse(BaseModel, Generic[T]):
    """Standard response envelope for paginated list endpoints."""

    items: list[T]
    pagination: PaginationMeta

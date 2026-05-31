"""Pagination, search, and sorting helpers for SQLAlchemy queries."""

from collections.abc import Sequence
from math import ceil

from fastapi import HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import or_
from sqlalchemy.orm import Query as SQLAlchemyQuery

from app.schemas.pagination import PaginationMeta, PaginatedResponse


class PaginationParams(BaseModel):
    """Validated list endpoint query parameters."""

    page: int
    limit: int
    search: str | None = None
    sort_by: str | None = None
    sort_order: str = "asc"


def pagination_params(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: str | None = Query(None),
    sort_by: str | None = Query(None),
    sort_order: str = Query("asc", pattern="^(asc|desc)$"),
) -> PaginationParams:
    """FastAPI dependency for standard pagination query parameters."""

    return PaginationParams(
        page=page,
        limit=limit,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
    )


def apply_search(
    query: SQLAlchemyQuery,
    search: str | None,
    search_columns: Sequence,
) -> SQLAlchemyQuery:
    """Apply case-insensitive partial matching across allowed columns."""

    if not search:
        return query

    cleaned_search = search.strip()
    if not cleaned_search:
        return query

    search_filter = f"%{cleaned_search}%"
    return query.filter(or_(*(column.ilike(search_filter) for column in search_columns)))


def apply_sorting(
    query: SQLAlchemyQuery,
    sort_by: str | None,
    sort_order: str,
    allowed_sort_columns: dict[str, object],
    default_sort: str | None = None,
) -> SQLAlchemyQuery:
    """Apply safe sorting using a whitelist of allowed column names."""

    selected_sort = sort_by or default_sort
    if not selected_sort:
        return query

    sort_column = allowed_sort_columns.get(selected_sort)
    if sort_column is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid sort field: {selected_sort}",
        )

    if sort_order == "desc":
        return query.order_by(sort_column.desc())
    return query.order_by(sort_column.asc())


def paginate_query(
    query: SQLAlchemyQuery,
    params: PaginationParams,
    *,
    search_columns: Sequence = (),
    allowed_sort_columns: dict[str, object] | None = None,
    default_sort: str | None = "id",
) -> PaginatedResponse:
    """Return a standard paginated response for a SQLAlchemy query."""

    allowed_sort_columns = allowed_sort_columns or {}
    query = apply_search(query, params.search, search_columns)
    query = apply_sorting(
        query,
        params.sort_by,
        params.sort_order,
        allowed_sort_columns,
        default_sort,
    )

    total = query.count()
    total_pages = ceil(total / params.limit) if total else 0
    offset = (params.page - 1) * params.limit
    items = query.offset(offset).limit(params.limit).all()

    return PaginatedResponse(
        items=items,
        pagination=PaginationMeta(
            page=params.page,
            limit=params.limit,
            total=total,
            total_pages=total_pages,
            has_next=params.page < total_pages,
            has_prev=params.page > 1 and total_pages > 0,
        ),
    )

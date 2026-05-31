"""Pagination, search, and sorting endpoint tests."""

import pytest

from app.models.issue import Issue
from app.models.review import Review
from app.models.user import User


def seed_reviews_with_issues(db_session, count=15, user_id=None):
    reviews = []
    for index in range(1, count + 1):
        review = Review(
            project_name=f"Project {index}",
            language="python" if index % 2 else "javascript",
            score=100 - index,
            summary=f"Summary for project {index}",
            improved_code=f"print({index})",
            user_id=user_id,
        )
        db_session.add(review)
        db_session.flush()
        db_session.add(
            Issue(
                title=f"Issue {index}",
                severity="High" if index % 2 else "Low",
                category="Bug",
                line_number=index,
                description=f"Description for issue {index}",
                suggested_fix="Fix it",
                fixed_code="fixed",
                review_id=review.id,
                user_id=user_id,
            )
        )
        reviews.append(review)
    db_session.commit()
    return reviews


def seed_users(db_session, count=12):
    users = []
    for index in range(1, count + 1):
        user = User(
            name=f"Page User {index}",
            email=f"page-user-{index}@example.com",
            password_hash="hashed",
            is_verified=True,
        )
        db_session.add(user)
        users.append(user)
    db_session.commit()
    return users


@pytest.mark.pagination
class TestPagination:
    def test_default_pagination(self, client, db_session, auth_headers, registered_user):
        seed_reviews_with_issues(db_session, count=3, user_id=registered_user["user"]["id"])

        response = client.get("/api/v1/reviews", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 3
        assert data["pagination"] == {
            "page": 1,
            "limit": 10,
            "total": 3,
            "total_pages": 1,
            "has_next": False,
            "has_prev": False,
        }

    def test_custom_page_and_limit(self, client, db_session, auth_headers, registered_user):
        seed_reviews_with_issues(db_session, count=15, user_id=registered_user["user"]["id"])

        response = client.get("/api/v1/reviews?page=2&limit=5", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 5
        assert data["pagination"]["page"] == 2
        assert data["pagination"]["limit"] == 5
        assert data["pagination"]["total"] == 15
        assert data["pagination"]["total_pages"] == 3

    def test_max_limit_enforcement(self, client, auth_headers):
        response = client.get("/api/v1/reviews?limit=101", headers=auth_headers)

        assert response.status_code == 422

    def test_invalid_sort_field(self, client, auth_headers):
        response = client.get("/api/v1/reviews?sort_by=password_hash", headers=auth_headers)

        assert response.status_code == 400
        assert response.json()["detail"] == "Invalid sort field: password_hash"

    def test_search_query(self, client, db_session, auth_headers, registered_user):
        seed_reviews_with_issues(db_session, count=3, user_id=registered_user["user"]["id"])

        response = client.get("/api/v1/reviews?search=Project 2", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["pagination"]["total"] == 1
        assert data["items"][0]["project_name"] == "Project 2"

    def test_empty_result(self, client, db_session, auth_headers, registered_user):
        seed_reviews_with_issues(db_session, count=3, user_id=registered_user["user"]["id"])

        response = client.get("/api/v1/issues?search=no-match-here", headers=auth_headers)

        assert response.status_code == 200
        assert response.json() == {
            "items": [],
            "pagination": {
                "page": 1,
                "limit": 10,
                "total": 0,
                "total_pages": 0,
                "has_next": False,
                "has_prev": False,
            },
        }

    def test_second_page_result(self, client, db_session, auth_headers, registered_user):
        seed_reviews_with_issues(db_session, count=11, user_id=registered_user["user"]["id"])

        response = client.get("/api/v1/issues?page=2&limit=10", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 1
        assert data["pagination"]["has_next"] is False
        assert data["pagination"]["has_prev"] is True

    def test_users_pagination(self, client, db_session, auth_headers):
        seed_users(db_session, count=12)

        response = client.get(
            "/api/v1/users?page=2&limit=5&sort_by=email&sort_order=desc",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 5
        assert data["pagination"]["page"] == 2
        assert data["pagination"]["total"] == 13

"""Add issue status and GitHub metadata.

Revision ID: 003
Revises: 002
Create Date: 2026-05-31 18:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("issues", sa.Column("status", sa.String(), nullable=False, server_default="Open"))
    op.add_column("issues", sa.Column("github_issue_url", sa.String(), nullable=True))
    op.add_column("issues", sa.Column("github_repo", sa.String(), nullable=True))
    op.add_column("github_integrations", sa.Column("github_username", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("github_integrations", "github_username")
    op.drop_column("issues", "github_repo")
    op.drop_column("issues", "github_issue_url")
    op.drop_column("issues", "status")

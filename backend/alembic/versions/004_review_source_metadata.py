"""Add review source metadata.

Revision ID: 004
Revises: 003
Create Date: 2026-05-31 22:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "004"
down_revision = "003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("reviews", sa.Column("source_provider", sa.String(), nullable=True))
    op.add_column("reviews", sa.Column("source_repo", sa.String(), nullable=True))
    op.add_column("reviews", sa.Column("source_branch", sa.String(), nullable=True))
    op.add_column("reviews", sa.Column("source_path", sa.String(), nullable=True))
    op.add_column("reviews", sa.Column("source_url", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("reviews", "source_url")
    op.drop_column("reviews", "source_path")
    op.drop_column("reviews", "source_branch")
    op.drop_column("reviews", "source_repo")
    op.drop_column("reviews", "source_provider")

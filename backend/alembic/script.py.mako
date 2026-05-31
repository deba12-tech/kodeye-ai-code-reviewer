"""Alembic migration script template."""

from alembic import op
import sqlalchemy as sa


# revision identifiers
revision = '${rev}'
down_revision = ${down_rev}
branch_labels = ${branch_labels}
depends_on = ${depends_on}


def upgrade() -> None:
    """Apply the upgrade migration."""
    ${upgrades}


def downgrade() -> None:
    """Apply the downgrade migration."""
    ${downgrades}

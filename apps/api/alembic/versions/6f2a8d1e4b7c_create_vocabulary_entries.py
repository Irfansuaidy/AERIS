"""create vocabulary entries table

Revision ID: 6f2a8d1e4b7c
Revises: c25b644834c1
Create Date: 2026-09-06 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "6f2a8d1e4b7c"
down_revision: Union[str, Sequence[str], None] = "c25b644834c1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "vocabulary_entries",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("word", sa.String(length=150), nullable=False),
        sa.Column("meaning", sa.Text(), nullable=False),
        sa.Column("part_of_speech", sa.String(length=30), nullable=False),
        sa.Column("example", sa.Text(), nullable=False),
        sa.Column("translation", sa.String(length=200), nullable=False),
        sa.Column("synonyms", sa.String(length=500), nullable=False),
        sa.Column("topic", sa.String(length=100), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_vocabulary_entries_user_id"),
                    "vocabulary_entries", ["user_id"], unique=False)
    op.create_index(op.f("ix_vocabulary_entries_word"),
                    "vocabulary_entries", ["word"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_vocabulary_entries_word"),
                  table_name="vocabulary_entries")
    op.drop_index(op.f("ix_vocabulary_entries_user_id"),
                  table_name="vocabulary_entries")
    op.drop_table("vocabulary_entries")

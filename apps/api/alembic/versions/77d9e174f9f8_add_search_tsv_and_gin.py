"""add search tsv and gin (D1+D2)

Revision ID: 77d9e174f9f8
Revises: b0c9f428a4bd
Create Date: 2026-09-19

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '77d9e174f9f8'
down_revision: Union[str, Sequence[str], None] = 'b0c9f428a4bd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    for table, expr in [
        ("projects", "coalesce(name,'') || ' ' || coalesce(description,'')"),
        ("tasks", "coalesce(title,'') || ' ' || coalesce(description,'')"),
        ("notes", "coalesce(title,'') || ' ' || coalesce(content,'')"),
        ("documents", "coalesce(name,'') || ' ' || coalesce(file_path,'')"),
        ("events", "coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(location,'')"),
        ("tags", "coalesce(name,'')"),
        ("vocabulary_entries", "coalesce(word,'') || ' ' || coalesce(meaning,'') || ' ' || coalesce(example,'')"),
    ]:
        op.execute(sa.text(f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS tsv tsvector GENERATED ALWAYS AS (to_tsvector('english', {expr})) STORED"))
        op.execute(sa.text(f"CREATE INDEX IF NOT EXISTS ix_{table}_tsv_gin ON {table} USING GIN (tsv)"))


def downgrade() -> None:
    for table in ["projects", "tasks", "notes", "documents", "events", "tags", "vocabulary_entries"]:
        op.execute(sa.text(f"DROP INDEX IF EXISTS ix_{table}_tsv_gin"))
        op.execute(sa.text(f"ALTER TABLE {table} DROP COLUMN IF EXISTS tsv"))

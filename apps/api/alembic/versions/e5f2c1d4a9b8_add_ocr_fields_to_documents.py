"""add ocr fields to documents

Revision ID: e5f2c1d4a9b8
Revises: bdb37eb8a563
Create Date: 2026-09-18 03:45:16.497828

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'e5f2c1d4a9b8'
down_revision: Union[str, Sequence[str], None] = 'bdb37eb8a563'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('documents', sa.Column('ocr_status', sa.String(50), nullable=True))
    op.add_column('documents', sa.Column('ocr_task_id', sa.String(255), nullable=True))
    op.add_column('documents', sa.Column('ocr_result', sa.String(65535), nullable=True))


def downgrade() -> None:
    op.drop_column('documents', 'ocr_result')
    op.drop_column('documents', 'ocr_task_id')
    op.drop_column('documents', 'ocr_status')

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class VocabularyEntry(Base):
    __tablename__ = "vocabulary_entries"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    word: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    meaning: Mapped[str] = mapped_column(Text, nullable=False)
    part_of_speech: Mapped[str] = mapped_column(
        String(30), nullable=False, default="noun")
    example: Mapped[str] = mapped_column(Text, nullable=False)
    translation: Mapped[str] = mapped_column(
        String(200), nullable=False, default="")
    synonyms: Mapped[str] = mapped_column(
        String(500), nullable=False, default="")
    topic: Mapped[str] = mapped_column(
        String(100), nullable=False, default="General")
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="new")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

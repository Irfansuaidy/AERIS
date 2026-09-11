from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.vocabulary import VocabularyEntry
from app.schemas.vocabulary import VocabularyCreate, VocabularyUpdate


def create_vocabulary(db: Session, user_id: UUID, data: VocabularyCreate):
    entry = VocabularyEntry(user_id=user_id, **data.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def get_vocabulary(db: Session, user_id: UUID):
    result = db.execute(
        select(VocabularyEntry)
        .where(VocabularyEntry.user_id == user_id)
        .order_by(VocabularyEntry.updated_at.desc())
    )
    return result.scalars().all()


def get_vocabulary_entry(db: Session, entry_id: UUID, user_id: UUID):
    result = db.execute(
        select(VocabularyEntry).where(
            VocabularyEntry.id == entry_id,
            VocabularyEntry.user_id == user_id,
        )
    )
    return result.scalar_one_or_none()


def update_vocabulary(db: Session, entry: VocabularyEntry, data: VocabularyUpdate):
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(entry, field, value)
    db.commit()
    db.refresh(entry)
    return entry


def delete_vocabulary(db: Session, entry: VocabularyEntry):
    db.delete(entry)
    db.commit()

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.note import Note
from app.schemas.note import NoteCreate, NoteUpdate


def create_note(
    db: Session,
    user_id: UUID,
    data: NoteCreate,
):
    note = Note(
        user_id=user_id,
        **data.model_dump(),
    )

    db.add(note)
    db.commit()
    db.refresh(note)

    return note


def get_notes(
    db: Session,
    user_id: UUID,
):
    result = db.execute(
        select(Note)
        .where(Note.user_id == user_id)
        .order_by(Note.created_at.desc())
    )

    return result.scalars().all()


def get_note(
    db: Session,
    note_id: UUID,
    user_id: UUID,
):
    result = db.execute(
        select(Note).where(
            Note.id == note_id,
            Note.user_id == user_id,
        )
    )

    return result.scalar_one_or_none()


def update_note(
    db: Session,
    note: Note,
    data: NoteUpdate,
):
    for field, value in data.model_dump(
        exclude_unset=True
    ).items():
        setattr(note, field, value)

    db.commit()
    db.refresh(note)

    return note


def delete_note(
    db: Session,
    note: Note,
):
    db.delete(note)
    db.commit()

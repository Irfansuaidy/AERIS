from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.validation import (
    require_project,
    require_user,
)
from app.schemas.note import (
    NoteCreate,
    NoteResponse,
    NoteUpdate,
)
from app.services.note_service import (
    create_note,
    delete_note,
    get_note,
    get_notes,
    update_note,
)


router = APIRouter(
    prefix="/notes",
    tags=["Notes"],
)


@router.post(
    "",
    response_model=NoteResponse,
    status_code=status.HTTP_201_CREATED,
)
def create(
    data: NoteCreate,
    db: Session = Depends(get_db),
):
    require_user(db, data.user_id)

    if data.project_id is not None:
        require_project(
            db,
            data.project_id,
            data.user_id,
        )

    return create_note(db, data)


@router.get(
    "",
    response_model=list[NoteResponse],
)
def list_all(
    db: Session = Depends(get_db),
):
    return get_notes(db)


@router.get(
    "/{note_id}",
    response_model=NoteResponse,
)
def get_one(
    note_id: UUID,
    db: Session = Depends(get_db),
):
    note = get_note(db, note_id)

    if note is None:
        raise HTTPException(
            status_code=404,
            detail="Note not found",
        )

    return note


@router.patch(
    "/{note_id}",
    response_model=NoteResponse,
)
def update(
    note_id: UUID,
    data: NoteUpdate,
    db: Session = Depends(get_db),
):
    note = get_note(db, note_id)

    if note is None:
        raise HTTPException(
            status_code=404,
            detail="Note not found",
        )

    return update_note(db, note, data)


@router.delete(
    "/{note_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete(
    note_id: UUID,
    db: Session = Depends(get_db),
):
    note = get_note(db, note_id)

    if note is None:
        raise HTTPException(
            status_code=404,
            detail="Note not found",
        )

    delete_note(db, note)

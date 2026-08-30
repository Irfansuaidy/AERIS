from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.note import (
    NoteCreate,
    NoteResponse,
    NoteUpdate,
)
from app.services.note_service import (
    create_note,
    delete_note,
    get_notes,
    update_note,
)
from app.services.validation import require_note, require_project


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
    current_user: User = Depends(get_current_user),
):
    if data.project_id is not None:
        require_project(
            db,
            data.project_id,
            current_user.id,
        )

    return create_note(
        db,
        current_user.id,
        data,
    )


@router.get(
    "",
    response_model=list[NoteResponse],
)
def list_all(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_notes(
        db,
        current_user.id,
    )


@router.get(
    "/{note_id}",
    response_model=NoteResponse,
)
def get_one(
    note_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = require_note(db, note_id, current_user.id)

    return note


@router.patch(
    "/{note_id}",
    response_model=NoteResponse,
)
def update(
    note_id: UUID,
    data: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = require_note(db, note_id, current_user.id)

    if data.project_id is not None:
        require_project(
            db,
            data.project_id,
            current_user.id,
        )

    return update_note(
        db,
        note,
        data,
    )


@router.delete(
    "/{note_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete(
    note_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = require_note(db, note_id, current_user.id)

    delete_note(db, note)

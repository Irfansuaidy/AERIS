from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.vocabulary import VocabularyCreate, VocabularyResponse, VocabularyUpdate
from app.services.vocabulary_service import (
    create_vocabulary,
    delete_vocabulary,
    get_vocabulary,
    get_vocabulary_entry,
    update_vocabulary,
)

router = APIRouter(prefix="/vocabulary", tags=["Vocabulary"])


def require_entry(db: Session, entry_id: UUID, user_id: UUID):
    entry = get_vocabulary_entry(db, entry_id, user_id)
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Vocabulary entry not found")
    return entry


@router.post("", response_model=VocabularyResponse, status_code=status.HTTP_201_CREATED)
def create(
    data: VocabularyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_vocabulary(db, current_user.id, data)


@router.get("", response_model=list[VocabularyResponse])
def list_all(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_vocabulary(db, current_user.id)


@router.get("/{entry_id}", response_model=VocabularyResponse)
def get_one(
    entry_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return require_entry(db, entry_id, current_user.id)


@router.patch("/{entry_id}", response_model=VocabularyResponse)
def update(
    entry_id: UUID,
    data: VocabularyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = require_entry(db, entry_id, current_user.id)
    return update_vocabulary(db, entry, data)


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(
    entry_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_vocabulary(db, require_entry(db, entry_id, current_user.id))

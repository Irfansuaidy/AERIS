from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.services.validation import require_user
from app.core.database import get_db
from app.schemas.tag import (
    TagCreate,
    TagResponse,
    TagUpdate,
)
from app.services.tag_service import (
    create_tag,
    delete_tag,
    get_tag,
    get_tags,
    update_tag,
)


router = APIRouter(
    prefix="/tags",
    tags=["Tags"],
)


@router.post(
    "",
    response_model=TagResponse,
    status_code=status.HTTP_201_CREATED,
)
def create(
    data: TagCreate,
    db: Session = Depends(get_db),
):
    require_user(db, data.user_id)

    try:
        return create_tag(db, data)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Tag with this name already exists for this user",
        )


@router.get(
    "",
    response_model=list[TagResponse],
)
def list_all(
    db: Session = Depends(get_db),
):
    return get_tags(db)


@router.get(
    "/{tag_id}",
    response_model=TagResponse,
)
def get_one(
    tag_id: UUID,
    db: Session = Depends(get_db),
):
    tag = get_tag(db, tag_id)

    if tag is None:
        raise HTTPException(
            status_code=404,
            detail="Tag not found",
        )

    return tag


@router.patch(
    "/{tag_id}",
    response_model=TagResponse,
)
def update(
    tag_id: UUID,
    data: TagUpdate,
    db: Session = Depends(get_db),
):
    tag = get_tag(db, tag_id)

    if tag is None:
        raise HTTPException(
            status_code=404,
            detail="Tag not found",
        )

    try:
        return update_tag(db, tag, data)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Tag with this name already exists for this user",
        )


@router.delete(
    "/{tag_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete(
    tag_id: UUID,
    db: Session = Depends(get_db),
):
    tag = get_tag(db, tag_id)

    if tag is None:
        raise HTTPException(
            status_code=404,
            detail="Tag not found",
        )

    delete_tag(db, tag)

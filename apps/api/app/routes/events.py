from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.event import (
    EventCreate,
    EventResponse,
    EventUpdate,
)
from app.services.event_service import (
    create_event,
    delete_event,
    get_event,
    get_events,
    update_event,
)


router = APIRouter(
    prefix="/events",
    tags=["Events"],
)


@router.post(
    "",
    response_model=EventResponse,
    status_code=status.HTTP_201_CREATED,
)
def create(
    data: EventCreate,
    db: Session = Depends(get_db),
):
    return create_event(db, data)


@router.get(
    "",
    response_model=list[EventResponse],
)
def list_all(
    db: Session = Depends(get_db),
):
    return get_events(db)


@router.get(
    "/{event_id}",
    response_model=EventResponse,
)
def get_one(
    event_id: UUID,
    db: Session = Depends(get_db),
):
    event = get_event(db, event_id)

    if event is None:
        raise HTTPException(
            status_code=404,
            detail="Event not found",
        )

    return event


@router.patch(
    "/{event_id}",
    response_model=EventResponse,
)
def update(
    event_id: UUID,
    data: EventUpdate,
    db: Session = Depends(get_db),
):
    event = get_event(db, event_id)

    if event is None:
        raise HTTPException(
            status_code=404,
            detail="Event not found",
        )

    return update_event(db, event, data)


@router.delete(
    "/{event_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete(
    event_id: UUID,
    db: Session = Depends(get_db),
):
    event = get_event(db, event_id)

    if event is None:
        raise HTTPException(
            status_code=404,
            detail="Event not found",
        )

    delete_event(db, event)

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.validation import (
    require_event,
    require_project,
)
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
    current_user: User = Depends(get_current_user),
):
    if data.project_id is not None:
        require_project(db, data.project_id, current_user.id)
    
    # Override user_id from token
    data.user_id = current_user.id
    return create_event(db, data)


@router.get(
    "",
    response_model=list[EventResponse],
)
def list_all(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from sqlalchemy import select
    from app.models.event import Event
    result = db.execute(
        select(Event).where(Event.user_id == current_user.id).order_by(Event.start_at.asc())
    )
    return result.scalars().all()


@router.get(
    "/{event_id}",
    response_model=EventResponse,
)
def get_one(
    event_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    event = require_event(db, event_id, current_user.id)
    return event


@router.patch(
    "/{event_id}",
    response_model=EventResponse,
)
def update(
    event_id: UUID,
    data: EventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    event = require_event(db, event_id, current_user.id)

    if data.project_id is not None:
        require_project(db, data.project_id, current_user.id)

    return update_event(db, event, data)


@router.delete(
    "/{event_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete(
    event_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    event = require_event(db, event_id, current_user.id)
    delete_event(db, event)

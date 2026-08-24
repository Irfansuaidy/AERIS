from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.event import Event
from app.schemas.event import EventCreate, EventUpdate


def create_event(db: Session, data: EventCreate):
    event = Event(**data.model_dump())

    db.add(event)
    db.commit()
    db.refresh(event)

    return event


def get_events(db: Session):
    result = db.execute(
        select(Event).order_by(Event.start_at.asc())
    )

    return result.scalars().all()


def get_event(db: Session, event_id: UUID):
    return db.get(Event, event_id)


def update_event(
    db: Session,
    event: Event,
    data: EventUpdate,
):
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(event, field, value)

    db.commit()
    db.refresh(event)

    return event


def delete_event(db: Session, event: Event):
    db.delete(event)
    db.commit()

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class EventCreate(BaseModel):
    user_id: uuid.UUID
    project_id: uuid.UUID | None = None

    title: str
    description: str | None = None

    start_at: datetime
    end_at: datetime | None = None

    location: str | None = None
    event_type: str = "general"


class EventUpdate(BaseModel):
    project_id: uuid.UUID | None = None

    title: str | None = None
    description: str | None = None

    start_at: datetime | None = None
    end_at: datetime | None = None

    location: str | None = None
    event_type: str | None = None


class EventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    project_id: uuid.UUID | None

    title: str
    description: str | None

    start_at: datetime
    end_at: datetime | None

    location: str | None
    event_type: str

    created_at: datetime
    updated_at: datetime

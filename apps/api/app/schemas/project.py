import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class ProjectCreate(BaseModel):
    name: str
    description: str | None = None
    status: str = "planned"
    priority: int = 3
    start_date: date | None = None
    target_date: date | None = None


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    status: str | None = None
    priority: int | None = None
    start_date: date | None = None
    target_date: date | None = None
    completed_at: datetime | None = None


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    description: str | None
    status: str
    priority: int
    start_date: date | None
    target_date: date | None
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime

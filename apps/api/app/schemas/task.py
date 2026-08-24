import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TaskCreate(BaseModel):
    user_id: uuid.UUID
    project_id: uuid.UUID | None = None
    parent_task_id: uuid.UUID | None = None

    title: str
    description: str | None = None

    status: str = "todo"
    priority: int = 3

    due_at: datetime | None = None


class TaskUpdate(BaseModel):
    project_id: uuid.UUID | None = None
    parent_task_id: uuid.UUID | None = None

    title: str | None = None
    description: str | None = None

    status: str | None = None
    priority: int | None = None

    due_at: datetime | None = None
    completed_at: datetime | None = None


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    project_id: uuid.UUID | None
    parent_task_id: uuid.UUID | None

    title: str
    description: str | None

    status: str
    priority: int

    due_at: datetime | None
    completed_at: datetime | None

    created_at: datetime
    updated_at: datetime

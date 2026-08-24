import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class NoteCreate(BaseModel):
    user_id: uuid.UUID
    project_id: uuid.UUID | None = None

    title: str
    content: str
    note_type: str = "general"


class NoteUpdate(BaseModel):
    project_id: uuid.UUID | None = None
    title: str | None = None
    content: str | None = None
    note_type: str | None = None


class NoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    project_id: uuid.UUID | None

    title: str
    content: str
    note_type: str

    created_at: datetime
    updated_at: datetime

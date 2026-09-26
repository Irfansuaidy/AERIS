import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DocumentCreate(BaseModel):
    user_id: uuid.UUID | None = None
    project_id: uuid.UUID | None = None

    name: str
    file_path: str
    mime_type: str | None = None
    file_size: int | None = None
    checksum: str | None = None


class DocumentUpdate(BaseModel):
    project_id: uuid.UUID | None = None

    name: str | None = None
    file_path: str | None = None
    mime_type: str | None = None
    file_size: int | None = None
    checksum: str | None = None


class DocumentMove(BaseModel):
    folder: str = ""


class DocumentTriggerOCR(BaseModel):
    file_url: str


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    project_id: uuid.UUID | None

    name: str
    file_path: str
    mime_type: str | None
    file_size: int | None
    checksum: str | None

    ocr_status: str | None = None
    ocr_task_id: str | None = None
    ocr_result: str | None = None

    created_at: datetime
    updated_at: datetime

from uuid import UUID
from pydantic import BaseModel, HttpUrl
from app.models.task import TaskStatus


class OCRJobCreate(BaseModel):
    document_id: UUID
    file_url: HttpUrl
    callback_url: HttpUrl


class OCRJobResponse(BaseModel):
    task_id: str
    status: TaskStatus
    document_id: UUID


class OCRTaskStatus(BaseModel):
    task_id: str
    status: TaskStatus
    result: str | None = None
    error: str | None = None

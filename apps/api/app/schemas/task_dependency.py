import uuid
from datetime import datetime

from pydantic import BaseModel


class TaskDependencyCreate(BaseModel):
    depends_on_task_id: uuid.UUID


class TaskDependencyResponse(BaseModel):
    task_id: uuid.UUID
    depends_on_task_id: uuid.UUID
    created_at: datetime

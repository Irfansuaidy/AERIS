import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ProfileCreate(BaseModel):
    user_id: uuid.UUID
    full_name: str | None = None
    display_name: str | None = None
    bio: str | None = None
    timezone: str = "UTC"
    locale: str = "en-US"


class ProfileUpdate(BaseModel):
    full_name: str | None = None
    display_name: str | None = None
    bio: str | None = None
    timezone: str | None = None
    locale: str | None = None


class ProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    full_name: str | None
    display_name: str | None
    bio: str | None
    timezone: str
    locale: str
    created_at: datetime
    updated_at: datetime

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class VocabularyCreate(BaseModel):
    word: str = Field(min_length=1, max_length=150)
    meaning: str = Field(min_length=1)
    part_of_speech: str = Field(default="noun", max_length=30)
    example: str = Field(min_length=1)
    translation: str = Field(default="", max_length=200)
    synonyms: str = Field(default="", max_length=500)
    topic: str = Field(default="General", max_length=100)
    status: str = Field(default="new", max_length=20)


class VocabularyUpdate(BaseModel):
    word: str | None = Field(default=None, min_length=1, max_length=150)
    meaning: str | None = Field(default=None, min_length=1)
    part_of_speech: str | None = Field(default=None, max_length=30)
    example: str | None = Field(default=None, min_length=1)
    translation: str | None = Field(default=None, max_length=200)
    synonyms: str | None = Field(default=None, max_length=500)
    topic: str | None = Field(default=None, max_length=100)
    status: str | None = Field(default=None, max_length=20)


class VocabularyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    word: str
    meaning: str
    part_of_speech: str
    example: str
    translation: str
    synonyms: str
    topic: str
    status: str
    created_at: datetime
    updated_at: datetime

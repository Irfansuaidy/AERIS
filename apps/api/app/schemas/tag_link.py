import uuid

from pydantic import BaseModel


class TagLinkCreate(BaseModel):
    tag_id: uuid.UUID

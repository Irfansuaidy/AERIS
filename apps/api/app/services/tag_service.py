from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.tag import Tag
from app.schemas.tag import TagCreate, TagUpdate


def create_tag(db: Session, data: TagCreate):
    tag = Tag(**data.model_dump())

    db.add(tag)
    db.commit()
    db.refresh(tag)

    return tag


def get_tags(db: Session):
    result = db.execute(
        select(Tag).order_by(Tag.name.asc())
    )

    return result.scalars().all()


def get_tag(db: Session, tag_id: UUID):
    return db.get(Tag, tag_id)


def update_tag(
    db: Session,
    tag: Tag,
    data: TagUpdate,
):
    tag.name = data.name

    db.commit()
    db.refresh(tag)

    return tag


def delete_tag(db: Session, tag: Tag):
    db.delete(tag)
    db.commit()

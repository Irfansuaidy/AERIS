from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.tag import Tag
from app.schemas.tag import TagCreate, TagUpdate


def create_tag(db: Session, user_id: UUID, data: TagCreate):
    tag = Tag(user_id=user_id, name=data.name)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


def get_tags(db: Session, user_id: UUID):
    result = db.execute(
        select(Tag)
        .where(Tag.user_id == user_id)
        .order_by(Tag.name.asc())
    )
    return result.scalars().all()


def get_tag(db: Session, tag_id: UUID):
    return db.get(Tag, tag_id)


def update_tag(db: Session, tag: Tag, data: TagUpdate):
    tag.name = data.name
    db.commit()
    db.refresh(tag)
    return tag


def delete_tag(db: Session, tag: Tag):
    db.delete(tag)
    db.commit()

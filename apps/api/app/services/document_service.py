from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.document import Document
from app.schemas.document import (
    DocumentCreate,
    DocumentUpdate,
)


def create_document(
    db: Session,
    data: DocumentCreate,
):
    document = Document(**data.model_dump())

    db.add(document)
    db.commit()
    db.refresh(document)

    return document


def get_documents(db: Session):
    result = db.execute(
        select(Document).order_by(
            Document.created_at.desc()
        )
    )

    return result.scalars().all()


def get_document(
    db: Session,
    document_id: UUID,
):
    return db.get(Document, document_id)


def update_document(
    db: Session,
    document: Document,
    data: DocumentUpdate,
):
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(document, field, value)

    db.commit()
    db.refresh(document)

    return document


def delete_document(
    db: Session,
    document: Document,
):
    db.delete(document)
    db.commit()

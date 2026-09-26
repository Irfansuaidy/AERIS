from uuid import UUID
import httpx
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.document import Document
from app.schemas.document import (
    DocumentCreate,
    DocumentUpdate,
)
from app.core.config import settings
from app.services.activity_service import log_activity


def create_document(
    db: Session,
    data: DocumentCreate,
):
    document = Document(**data.model_dump())

    db.add(document)
    db.commit()
    db.refresh(document)
    try:
        log_activity(db, document.user_id, "document.created", "document", document.id, {"name": document.name})
    except Exception:
        pass
    return document


def get_documents(db: Session, user_id: UUID | None = None):
    query = select(Document).order_by(
        Document.created_at.desc()
    )
    if user_id is not None:
        query = query.where(Document.user_id == user_id)
    result = db.execute(
        query
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


def trigger_ocr(
    db: Session,
    document: Document,
    file_url: str,
):
    ocr_service_url = f"{settings.ocr_service_url}/api/v1/ocr/jobs"
    callback_url = f"{settings.iris_api_base_url}/documents/{document.id}/ocr-callback"
    
    try:
        response = httpx.post(
            ocr_service_url,
            json={
                "document_id": str(document.id),
                "file_url": file_url,
                "callback_url": callback_url,
            },
            timeout=10.0,
        )
        response.raise_for_status()
        
        result = response.json()
        document.ocr_status = "pending"
        document.ocr_task_id = result.get("task_id")
        
        db.commit()
        db.refresh(document)
        
        return document
    except Exception as e:
        raise Exception(f"Failed to trigger OCR: {str(e)}")


def update_ocr_result(
    db: Session,
    document: Document,
    status: str,
    result: str | None = None,
    error: str | None = None,
):
    document.ocr_status = status
    if status == "failed":
        document.ocr_result = error
    elif result:
        document.ocr_result = result
    
    db.commit()
    db.refresh(document)
    
    return document
    
    return document

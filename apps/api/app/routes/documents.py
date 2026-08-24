from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.document import (
    DocumentCreate,
    DocumentResponse,
    DocumentUpdate,
)
from app.services.document_service import (
    create_document,
    delete_document,
    get_document,
    get_documents,
    update_document,
)


router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)


@router.post(
    "",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create(
    data: DocumentCreate,
    db: Session = Depends(get_db),
):
    return create_document(db, data)


@router.get(
    "",
    response_model=list[DocumentResponse],
)
def list_all(
    db: Session = Depends(get_db),
):
    return get_documents(db)


@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
)
def get_one(
    document_id: UUID,
    db: Session = Depends(get_db),
):
    document = get_document(db, document_id)

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found",
        )

    return document


@router.patch(
    "/{document_id}",
    response_model=DocumentResponse,
)
def update(
    document_id: UUID,
    data: DocumentUpdate,
    db: Session = Depends(get_db),
):
    document = get_document(db, document_id)

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found",
        )

    return update_document(db, document, data)


@router.delete(
    "/{document_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete(
    document_id: UUID,
    db: Session = Depends(get_db),
):
    document = get_document(db, document_id)

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found",
        )

    delete_document(db, document)

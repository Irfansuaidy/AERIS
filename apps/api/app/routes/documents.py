from uuid import UUID

from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.document import (
    DocumentCreate,
    DocumentMove,
    DocumentResponse,
    DocumentUpdate,
    DocumentTriggerOCR,
)
from app.services.document_service import (
    create_document,
    delete_document,
    get_document,
    get_documents,
    update_document,
    trigger_ocr,
    update_ocr_result,
)
from app.core.config import settings
from app.core.dependencies import get_current_user
from app.models.user import User


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
    current_user: User = Depends(get_current_user),
):
    data.user_id = current_user.id
    return create_document(db, data)


@router.get(
    "",
    response_model=list[DocumentResponse],
)
def list_all(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_documents(db, current_user.id)


@router.post("/scan", response_model=list[DocumentResponse])
def scan_files(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    root = Path(settings.documents_root).resolve()
    root.mkdir(parents=True, exist_ok=True)
    existing = {document.file_path for document in get_documents(
        db, current_user.id)}
    imported = []

    for path in root.rglob("*"):
        if not path.is_file() or str(path) in existing:
            continue
        document = create_document(db, DocumentCreate(
            user_id=current_user.id,
            name=path.name,
            file_path=str(path),
            file_size=path.stat().st_size,
        ))
        imported.append(document)

    return imported


@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
)
def get_one(
    document_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = get_document(db, document_id)

    if document is None or document.user_id != current_user.id:
        # TODO(PRE-DEPLOY): switch 403 to 404 to hide existence
        raise HTTPException(
            status_code=403,
            detail="Document not found or not owned",
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
    current_user: User = Depends(get_current_user),
):
    document = get_document(db, document_id)

    if document is None or document.user_id != current_user.id:
        # TODO(PRE-DEPLOY): switch 403 to 404 to hide existence
        raise HTTPException(
            status_code=403,
            detail="Document not found or not owned",
        )

    return update_document(db, document, data)


@router.delete(
    "/{document_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete(
    document_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = get_document(db, document_id)

    if document is None or document.user_id != current_user.id:
        # TODO(PRE-DEPLOY): switch 403 to 404 to hide existence
        raise HTTPException(
            status_code=403,
            detail="Document not found or not owned",
        )

    delete_document(db, document)


@router.patch("/{document_id}/move", response_model=DocumentResponse)
def move(
    document_id: UUID,
    data: DocumentMove,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = get_document(db, document_id)
    if document is None or document.user_id != current_user.id:
        # TODO(PRE-DEPLOY): switch 403 to 404 to hide existence
        raise HTTPException(status_code=403, detail="Document not found or not owned")

    root = Path(settings.documents_root).resolve()
    source = Path(document.file_path).resolve()
    if root not in source.parents and source != root:
        raise HTTPException(
            status_code=400, detail="Document is outside the documents root")

    folder = Path(data.folder.strip())
    if folder.is_absolute() or ".." in folder.parts:
        raise HTTPException(
            status_code=400, detail="Invalid destination folder")
    destination_dir = (root / folder).resolve()
    if root not in destination_dir.parents and destination_dir != root:
        raise HTTPException(
            status_code=400, detail="Invalid destination folder")
    destination_dir.mkdir(parents=True, exist_ok=True)
    destination = destination_dir / source.name
    if destination.exists() and destination != source:
        raise HTTPException(
            status_code=409, detail="A file with this name already exists")
    if source.exists() and source != destination:
        source.rename(destination)
    document.file_path = str(destination)
    db.commit()
    db.refresh(document)
    return document


@router.post("/{document_id}/ocr", response_model=DocumentResponse)
def trigger_document_ocr(
    document_id: UUID,
    data: DocumentTriggerOCR,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = get_document(db, document_id)
    
    if document is None or document.user_id != current_user.id:
        # TODO(PRE-DEPLOY): switch 403 to 404 to hide existence
        raise HTTPException(status_code=403, detail="Document not found or not owned")
    
    try:
        return trigger_ocr(db, document, data.file_url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{document_id}/ocr-callback")
def ocr_callback(
    document_id: UUID,
    payload: dict,
    db: Session = Depends(get_db),
    x_api_key: str = Header(None),
):
    if x_api_key != settings.ocr_service_api_key:
        raise HTTPException(status_code=403, detail="Invalid API key")
    
    document = get_document(db, document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")
    
    status_value = payload.get("status")
    result = payload.get("result")
    error = payload.get("error")
    
    update_ocr_result(db, document, status_value, result, error)
    
    return {"status": "ok"}

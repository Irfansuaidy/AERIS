from fastapi import APIRouter, HTTPException, status
from celery.result import AsyncResult

from app.schemas.ocr import OCRJobCreate, OCRJobResponse, OCRTaskStatus
from app.services.ocr_worker import process_ocr
from app.models.task import TaskStatus
from app.core.celery import celery_app


router = APIRouter(
    prefix="/ocr",
    tags=["OCR"],
)


@router.post("/jobs", response_model=OCRJobResponse, status_code=status.HTTP_202_ACCEPTED)
def create_ocr_job(data: OCRJobCreate):
    task = process_ocr.apply_async(
        args=[str(data.document_id), str(data.file_url), str(data.callback_url)],
        task_id=None,
    )
    
    return OCRJobResponse(
        task_id=task.id,
        status=TaskStatus.PENDING,
        document_id=data.document_id,
    )


@router.get("/jobs/{task_id}", response_model=OCRTaskStatus)
def get_task_status(task_id: str):
    task_result = AsyncResult(task_id, app=celery_app)
    
    if task_result.state == "PENDING":
        status_enum = TaskStatus.PENDING
        result = None
        error = None
    elif task_result.state == "STARTED" or task_result.state == "PROCESSING":
        status_enum = TaskStatus.PROCESSING
        result = None
        error = None
    elif task_result.state == "SUCCESS":
        status_enum = TaskStatus.COMPLETED
        result = task_result.result.get("result") if isinstance(task_result.result, dict) else None
        error = None
    elif task_result.state == "FAILURE":
        status_enum = TaskStatus.FAILED
        result = None
        error = str(task_result.info)
    else:
        status_enum = TaskStatus.FAILED
        result = None
        error = f"Unknown state: {task_result.state}"
    
    return OCRTaskStatus(
        task_id=task_id,
        status=status_enum,
        result=result,
        error=error,
    )


@router.get("/health")
def health_check():
    return {"status": "healthy", "service": "ocr"}

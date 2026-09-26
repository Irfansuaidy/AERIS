from celery.result import AsyncResult
from app.models.task import TaskStatus
from app.core.celery import celery_app


def get_task_status(task_id: str) -> dict:
    task_result = AsyncResult(task_id, app=celery_app)
    
    return {
        "task_id": task_id,
        "status": task_result.state,
        "result": task_result.result if task_result.ready() else None,
        "error": str(task_result.info) if task_result.failed() else None,
    }


def queue_ocr_task(document_id: str, file_url: str, callback_url: str) -> str:
    from app.services.ocr_worker import process_ocr
    
    task = process_ocr.apply_async(
        args=[document_id, file_url, callback_url],
    )
    
    return task.id

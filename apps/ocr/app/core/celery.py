from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "ocr_worker",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.services.ocr_worker"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,
    task_soft_time_limit=25 * 60,
)

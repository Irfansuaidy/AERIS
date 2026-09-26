from app.core.config import settings
from app.core.celery import celery_app

__all__ = ["settings", "celery_app"]

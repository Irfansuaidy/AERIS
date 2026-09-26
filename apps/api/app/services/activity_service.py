from uuid import UUID
from sqlalchemy.orm import Session

from app.models.activity_log import ActivityLog


def log_activity(
    db: Session,
    user_id: UUID,
    action: str,
    entity_type: str,
    entity_id: UUID | None = None,
    metadata: dict | None = None,
):
    log = ActivityLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        metadata_json=metadata,
    )
    db.add(log)
    db.commit()

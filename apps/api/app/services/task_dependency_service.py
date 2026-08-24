from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models.task_dependency import TaskDependency


def add_dependency(
    db: Session,
    task_id: UUID,
    depends_on_task_id: UUID,
):
    dependency = TaskDependency(
        task_id=task_id,
        depends_on_task_id=depends_on_task_id,
    )

    db.add(dependency)
    db.commit()
    db.refresh(dependency)

    return dependency


def get_dependencies(
    db: Session,
    task_id: UUID,
):
    result = db.execute(
        select(TaskDependency)
        .where(TaskDependency.task_id == task_id)
        .order_by(TaskDependency.created_at.asc())
    )

    return result.scalars().all()


def remove_dependency(
    db: Session,
    task_id: UUID,
    depends_on_task_id: UUID,
):
    db.execute(
        delete(TaskDependency).where(
            TaskDependency.task_id == task_id,
            TaskDependency.depends_on_task_id == depends_on_task_id,
        )
    )

    db.commit()

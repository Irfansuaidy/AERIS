from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.task import Task
from app.models.task_dependency import TaskDependency


def validate_parent_task(
    db: Session,
    task_id: UUID | None,
    parent_task_id: UUID | None,
):
    if parent_task_id is None:
        return

    if task_id is not None and task_id == parent_task_id:
        raise HTTPException(
            status_code=400,
            detail="A task cannot be its own parent",
        )

    parent = db.get(Task, parent_task_id)

    if parent is None:
        raise HTTPException(
            status_code=404,
            detail="Parent task not found",
        )

    current_id = parent.id

    while current_id is not None:
        if task_id is not None and current_id == task_id:
            raise HTTPException(
                status_code=400,
                detail="Circular parent task relationship detected",
            )

        current = db.get(Task, current_id)

        if current is None:
            break

        current_id = current.parent_task_id


def validate_task_dependency(
    db: Session,
    task_id: UUID,
    depends_on_task_id: UUID,
):
    if task_id == depends_on_task_id:
        raise HTTPException(
            status_code=400,
            detail="A task cannot depend on itself",
        )

    visited: set[UUID] = set()
    current_id = depends_on_task_id

    while current_id is not None:

        if current_id == task_id:
            raise HTTPException(
                status_code=400,
                detail="Circular task dependency detected",
            )

        if current_id in visited:
            break

        visited.add(current_id)

        result = db.execute(
            select(TaskDependency.depends_on_task_id)
            .where(
                TaskDependency.task_id == current_id
            )
        )

        current_id = result.scalar_one_or_none()

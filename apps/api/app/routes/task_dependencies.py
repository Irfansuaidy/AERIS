from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.services.task_validation import (
    validate_task_dependency,
)
from app.core.database import get_db
from app.models.task import Task
from app.schemas.task_dependency import (
    TaskDependencyCreate,
    TaskDependencyResponse,
)
from app.services.task_dependency_service import (
    add_dependency,
    get_dependencies,
    remove_dependency,
)


router = APIRouter(
    prefix="/tasks",
    tags=["Task Dependencies"],
)


@router.post(
    "/{task_id}/dependencies",
    response_model=TaskDependencyResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_dependency(
    task_id: UUID,
    data: TaskDependencyCreate,
    db: Session = Depends(get_db),
):
    if task_id == data.depends_on_task_id:
        raise HTTPException(
            status_code=400,
            detail="A task cannot depend on itself",
        )

    validate_task_dependency(db, task_id, data.depends_on_task_id)

    task = db.get(Task, task_id)

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    dependency_task = db.get(
        Task,
        data.depends_on_task_id,
    )

    if dependency_task is None:
        raise HTTPException(
            status_code=404,
            detail="Dependency task not found",
        )

    try:
        return add_dependency(
            db,
            task_id,
            data.depends_on_task_id,
        )

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail="This dependency already exists",
        )


@router.get(
    "/{task_id}/dependencies",
    response_model=list[TaskDependencyResponse],
)
def list_dependencies(
    task_id: UUID,
    db: Session = Depends(get_db),
):
    task = db.get(Task, task_id)

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    return get_dependencies(db, task_id)


@router.delete(
    "/{task_id}/dependencies/{depends_on_task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_dependency(
    task_id: UUID,
    depends_on_task_id: UUID,
    db: Session = Depends(get_db),
):
    task = db.get(Task, task_id)

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    dependency_task = db.get(
        Task,
        depends_on_task_id,
    )

    if dependency_task is None:
        raise HTTPException(
            status_code=404,
            detail="Dependency task not found",
        )

    remove_dependency(
        db,
        task_id,
        depends_on_task_id,
    )

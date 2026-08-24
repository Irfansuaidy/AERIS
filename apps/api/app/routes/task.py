from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.services.task_validation import validate_parent_task
from app.core.database import get_db
from app.services.validation import (
    require_project,
    require_task,
    require_user,
)
from app.schemas.task import (
    TaskCreate,
    TaskResponse,
    TaskUpdate,
)
from app.services.task_service import (
    create_task,
    delete_task,
    get_task,
    get_tasks,
    update_task,
)


router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"],
)


@router.post(
    "",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
)
def create(
    data: TaskCreate,
    db: Session = Depends(get_db),
):
    require_user(db, data.user_id)

    if data.project_id is not None:
        require_project(
            db,
            data.project_id,
            data.user_id,
        )

    if data.parent_task_id is not None:
        parent = require_task(
            db,
            data.parent_task_id,
            data.user_id
        )
    validate_parent_task(db, None, data.parent_task_id)
    return create_task(db, data)


@router.get(
    "",
    response_model=list[TaskResponse],
)
def list_all(
    db: Session = Depends(get_db),
):
    return get_tasks(db)


@router.get(
    "/{task_id}",
    response_model=TaskResponse,
)
def get_one(
    task_id: UUID,
    db: Session = Depends(get_db),
):
    task = get_task(db, task_id)

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    return task


@router.patch(
    "/{task_id}",
    response_model=TaskResponse,
)
def update(
    task_id: UUID,
    data: TaskUpdate,
    db: Session = Depends(get_db),
):
    task = require_task(
        db,
        task_id,
        data.user_id,
    )

    if data.parent_task_id is not None:
        require_task(
            db,
            data.parent_task_id,
            data.user_id,
        )

    validate_parent_task(
        db,
        task_id,
        data.parent_task_id,
    )

    return update_task(db, task, data)


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete(
    task_id: UUID,
    db: Session = Depends(get_db),
):
    task = get_task(db, task_id)

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    delete_task(db, task)

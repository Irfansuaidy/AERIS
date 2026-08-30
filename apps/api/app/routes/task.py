from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.task_validation import validate_parent_task
from app.core.database import get_db
from app.services.validation import (
    require_project,
    require_task,
)
from app.schemas.task import (
    TaskCreate,
    TaskResponse,
    TaskUpdate,
)
from app.services.task_service import (
    create_task,
    delete_task,
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
    current_user: User = Depends(get_current_user),
):
    if data.project_id is not None:
        require_project(
            db,
            data.project_id,
            current_user.id,
        )

    if data.parent_task_id is not None:
        require_task(
            db,
            data.parent_task_id,
            current_user.id
        )

    validate_parent_task(db, None, data.parent_task_id)

    return create_task(db, current_user.id, data)


@router.get(
    "",
    response_model=list[TaskResponse],
)
def list_all(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_tasks(db, current_user.id)


@router.get(
    "/{task_id}",
    response_model=TaskResponse,
)
def get_one(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = require_task(
        db,
        task_id,
        current_user.id,
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
    current_user: User = Depends(get_current_user),
):
    task = require_task(
        db,
        task_id,
        current_user.id,
    )

    if data.project_id is not None:
        require_project(
            db,
            data.project_id,
            current_user.id,
        )

    if data.parent_task_id is not None:
        require_task(
            db,
            data.parent_task_id,
            current_user.id,
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
    current_user: User = Depends(get_current_user),
):
    task = require_task(
        db,
        task_id,
        current_user.id,
    )

    delete_task(db, task)

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


from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.validation import require_task

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
    current_user: User = Depends(get_current_user),
):
    # Ensure both tasks belong to the user
    task = require_task(db, task_id, current_user.id)
    dependency_task = require_task(db, data.depends_on_task_id, current_user.id)

    if task_id == data.depends_on_task_id:
        raise HTTPException(
            status_code=400,
            detail="A task cannot depend on itself",
        )

    validate_task_dependency(db, task_id, data.depends_on_task_id)

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
    current_user: User = Depends(get_current_user),
):
    require_task(db, task_id, current_user.id)
    return get_dependencies(db, task_id)


@router.delete(
    "/{task_id}/dependencies/{depends_on_task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_dependency(
    task_id: UUID,
    depends_on_task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_task(db, task_id, current_user.id)
    # Check dependency task exists and belongs to user too
    require_task(db, depends_on_task_id, current_user.id)

    remove_dependency(
        db,
        task_id,
        depends_on_task_id,
    )

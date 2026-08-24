from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.services.validation import require_user

from app.core.database import get_db
from app.schemas.project import (
    ProjectCreate,
    ProjectResponse,
    ProjectUpdate,
)
from app.services.project_service import (
    create_project,
    delete_project,
    get_project,
    get_projects,
    update_project,
)


router = APIRouter(
    prefix="/projects",
    tags=["Projects"],
)


@router.post(
    "",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
)
def create(
    data: ProjectCreate,
    db: Session = Depends(get_db),
):
    require_user(db, data.user_id)
    return create_project(db, data)


@router.get(
    "",
    response_model=list[ProjectResponse],
)
def list_all(
    db: Session = Depends(get_db),
):
    return get_projects(db)


@router.get(
    "/{project_id}",
    response_model=ProjectResponse,
)
def get_one(
    project_id: UUID,
    db: Session = Depends(get_db),
):
    project = get_project(db, project_id)

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    return project


@router.patch(
    "/{project_id}",
    response_model=ProjectResponse,
)
def update(
    project_id: UUID,
    data: ProjectUpdate,
    db: Session = Depends(get_db),
):
    project = get_project(db, project_id)

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    return update_project(db, project, data)


@router.delete(
    "/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete(
    project_id: UUID,
    db: Session = Depends(get_db),
):
    project = get_project(db, project_id)

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    delete_project(db, project)

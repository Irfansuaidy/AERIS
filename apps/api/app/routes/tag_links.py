from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.tag_link import TagLinkCreate
from app.services.validation import (
    require_note,
    require_project,
    require_tag,
    require_task,
)
from app.services.tag_link_service import (
    add_note_tag,
    add_project_tag,
    add_task_tag,
    get_note_tags,
    get_project_tags,
    get_task_tags,
    remove_note_tag,
    remove_project_tag,
    remove_task_tag,
)

router = APIRouter(tags=["Tag Links"])

# -------------------------
# Projects
# -------------------------


@router.post("/projects/{project_id}/tags", status_code=status.HTTP_201_CREATED)
def attach_project_tag(
    project_id: UUID,
    data: TagLinkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_project(db, project_id, current_user.id)
    require_tag(db, data.tag_id, current_user.id)
    add_project_tag(db, project_id, data.tag_id)
    return {"project_id": project_id, "tag_id": data.tag_id}


@router.get("/projects/{project_id}/tags")
def list_project_tags(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_project(db, project_id, current_user.id)
    return {"project_id": project_id, "tag_ids": get_project_tags(db, project_id)}


@router.delete("/projects/{project_id}/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def detach_project_tag(
    project_id: UUID,
    tag_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_project(db, project_id, current_user.id)
    require_tag(db, tag_id, current_user.id)
    remove_project_tag(db, project_id, tag_id)


# -------------------------
# Tasks
# -------------------------

@router.post("/tasks/{task_id}/tags", status_code=status.HTTP_201_CREATED)
def attach_task_tag(
    task_id: UUID,
    data: TagLinkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_task(db, task_id, current_user.id)
    require_tag(db, data.tag_id, current_user.id)
    add_task_tag(db, task_id, data.tag_id)
    return {"task_id": task_id, "tag_id": data.tag_id}


@router.get("/tasks/{task_id}/tags")
def list_task_tags(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_task(db, task_id, current_user.id)
    return {"task_id": task_id, "tag_ids": get_task_tags(db, task_id)}


@router.delete("/tasks/{task_id}/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def detach_task_tag(
    task_id: UUID,
    tag_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_task(db, task_id, current_user.id)
    require_tag(db, tag_id, current_user.id)
    remove_task_tag(db, task_id, tag_id)


# -------------------------
# Notes
# -------------------------

@router.post("/notes/{note_id}/tags", status_code=status.HTTP_201_CREATED)
def attach_note_tag(
    note_id: UUID,
    data: TagLinkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_note(db, note_id, current_user.id)
    require_tag(db, data.tag_id, current_user.id)
    add_note_tag(db, note_id, data.tag_id)
    return {"note_id": note_id, "tag_id": data.tag_id}


@router.get("/notes/{note_id}/tags")
def list_note_tags(
    note_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_note(db, note_id, current_user.id)
    return {"note_id": note_id, "tag_ids": get_note_tags(db, note_id)}


@router.delete("/notes/{note_id}/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def detach_note_tag(
    note_id: UUID,
    tag_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_note(db, note_id, current_user.id)
    require_tag(db, tag_id, current_user.id)
    remove_note_tag(db, note_id, tag_id)

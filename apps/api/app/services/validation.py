from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.note import Note
from app.models.project import Project
from app.models.tag import Tag
from app.models.task import Task
from app.models.user import User


def require_user(
    db: Session,
    user_id: UUID,
):
    user = db.get(User, user_id)

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return user


def require_project(
    db: Session,
    project_id: UUID,
    user_id: UUID,
):
    project = db.get(Project, project_id)

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    if project.user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Project does not belong to this user",
        )

    return project


def require_task(
    db: Session,
    task_id: UUID,
    user_id: UUID,
):
    task = db.get(Task, task_id)

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    if task.user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Task does not belong to this user",
        )

    return task


def require_note(
    db: Session,
    note_id: UUID,
    user_id: UUID,
):
    note = db.get(Note, note_id)

    if note is None:
        raise HTTPException(
            status_code=404,
            detail="Note not found",
        )

    if note.user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Note does not belong to this user",
        )

    return note


def require_tag(
    db: Session,
    tag_id: UUID,
    user_id: UUID,
):
    tag = db.get(Tag, tag_id)

    if tag is None:
        raise HTTPException(
            status_code=404,
            detail="Tag not found",
        )

    if tag.user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Tag does not belong to this user",
        )

    return tag

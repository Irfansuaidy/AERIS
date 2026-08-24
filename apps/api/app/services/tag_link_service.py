from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models.tag_links import (
    NoteTag,
    ProjectTag,
    TaskTag,
)


def add_project_tag(
    db: Session,
    project_id: UUID,
    tag_id: UUID,
):
    link = ProjectTag(
        project_id=project_id,
        tag_id=tag_id,
    )

    db.add(link)
    db.commit()

    return link


def remove_project_tag(
    db: Session,
    project_id: UUID,
    tag_id: UUID,
):
    db.execute(
        delete(ProjectTag).where(
            ProjectTag.project_id == project_id,
            ProjectTag.tag_id == tag_id,
        )
    )

    db.commit()


def get_project_tags(
    db: Session,
    project_id: UUID,
):
    result = db.execute(
        select(ProjectTag.tag_id).where(
            ProjectTag.project_id == project_id
        )
    )

    return result.scalars().all()


def add_task_tag(
    db: Session,
    task_id: UUID,
    tag_id: UUID,
):
    link = TaskTag(
        task_id=task_id,
        tag_id=tag_id,
    )

    db.add(link)
    db.commit()

    return link


def remove_task_tag(
    db: Session,
    task_id: UUID,
    tag_id: UUID,
):
    db.execute(
        delete(TaskTag).where(
            TaskTag.task_id == task_id,
            TaskTag.tag_id == tag_id,
        )
    )

    db.commit()


def get_task_tags(
    db: Session,
    task_id: UUID,
):
    result = db.execute(
        select(TaskTag.tag_id).where(
            TaskTag.task_id == task_id
        )
    )

    return result.scalars().all()


def add_note_tag(
    db: Session,
    note_id: UUID,
    tag_id: UUID,
):
    link = NoteTag(
        note_id=note_id,
        tag_id=tag_id,
    )

    db.add(link)
    db.commit()

    return link


def remove_note_tag(
    db: Session,
    note_id: UUID,
    tag_id: UUID,
):
    db.execute(
        delete(NoteTag).where(
            NoteTag.note_id == note_id,
            NoteTag.tag_id == tag_id,
        )
    )

    db.commit()


def get_note_tags(
    db: Session,
    note_id: UUID,
):
    result = db.execute(
        select(NoteTag.tag_id).where(
            NoteTag.note_id == note_id
        )
    )

    return result.scalars().all()

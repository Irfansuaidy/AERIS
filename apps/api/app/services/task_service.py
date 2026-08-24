from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate


def create_task(db: Session, data: TaskCreate):
    task = Task(**data.model_dump())

    db.add(task)
    db.commit()
    db.refresh(task)

    return task


def get_tasks(db: Session):
    result = db.execute(
        select(Task).order_by(Task.created_at.desc())
    )

    return result.scalars().all()


def get_task(db: Session, task_id: UUID):
    return db.get(Task, task_id)


def update_task(
    db: Session,
    task: Task,
    data: TaskUpdate,
):
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)

    return task


def delete_task(db: Session, task: Task):
    db.delete(task)
    db.commit()

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate


def create_project(db: Session, data: ProjectCreate):
    project = Project(**data.model_dump())

    db.add(project)
    db.commit()
    db.refresh(project)

    return project


def get_projects(db: Session):
    result = db.execute(
        select(Project).order_by(Project.created_at.desc())
    )

    return result.scalars().all()


def get_project(db: Session, project_id: UUID):
    return db.get(Project, project_id)


def update_project(
    db: Session,
    project: Project,
    data: ProjectUpdate,
):
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)

    return project


def delete_project(db: Session, project: Project):
    db.delete(project)
    db.commit()

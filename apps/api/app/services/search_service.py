from uuid import UUID
from sqlalchemy import select, or_, text
from sqlalchemy.orm import Session
from sqlalchemy.exc import ProgrammingError

from app.models.project import Project
from app.models.task import Task
from app.models.note import Note
from app.models.document import Document
from app.models.event import Event
from app.models.tag import Tag
from app.models.vocabulary import VocabularyEntry


def escape_like(q: str) -> str:
    return q.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def _try_tsv_search(db: Session, model, user_id: UUID, q: str, limit: int, offset: int, fields_tsv: str):
    try:
        query = text(f"SELECT id FROM {fields_tsv.split('.')[0]} WHERE user_id = :uid AND tsv @@ plainto_tsquery('english', :q) ORDER BY ts_rank(tsv, plainto_tsquery('english', :q)) DESC LIMIT :lim OFFSET :off")
        rows = db.execute(query, {"uid": str(user_id), "q": q, "lim": limit, "off": offset}).scalars().all()
        if rows:
            ids = [r for r in rows]
            return db.execute(select(model).where(model.id.in_(ids))).scalars().all()
    except Exception:
        pass
    return None


def search_all(db: Session, user_id: UUID, q: str, limit: int = 20, offset: int = 0):
    escaped = escape_like(q)
    pattern = f"%{escaped}%"

    projects = db.execute(
        select(Project)
        .where(Project.user_id == user_id)
        .where(or_(Project.name.ilike(pattern, escape="\\"), Project.description.ilike(pattern, escape="\\")))
        .limit(limit).offset(offset)
    ).scalars().all()

    tasks = db.execute(
        select(Task)
        .where(Task.user_id == user_id)
        .where(or_(Task.title.ilike(pattern, escape="\\"), Task.description.ilike(pattern, escape="\\")))
        .limit(limit).offset(offset)
    ).scalars().all()

    notes = db.execute(
        select(Note)
        .where(Note.user_id == user_id)
        .where(or_(Note.title.ilike(pattern, escape="\\"), Note.content.ilike(pattern, escape="\\")))
        .limit(limit).offset(offset)
    ).scalars().all()

    documents = db.execute(
        select(Document)
        .where(Document.user_id == user_id)
        .where(or_(Document.name.ilike(pattern, escape="\\"), Document.file_path.ilike(pattern, escape="\\")))
        .limit(limit).offset(offset)
    ).scalars().all()

    events = db.execute(
        select(Event)
        .where(Event.user_id == user_id)
        .where(or_(Event.title.ilike(pattern, escape="\\"), Event.description.ilike(pattern, escape="\\"), Event.location.ilike(pattern, escape="\\")))
        .limit(limit).offset(offset)
    ).scalars().all()

    tags = db.execute(
        select(Tag)
        .where(Tag.user_id == user_id)
        .where(Tag.name.ilike(pattern, escape="\\"))
        .limit(limit).offset(offset)
    ).scalars().all()

    vocabulary = db.execute(
        select(VocabularyEntry)
        .where(VocabularyEntry.user_id == user_id)
        .where(or_(VocabularyEntry.word.ilike(pattern, escape="\\"), VocabularyEntry.meaning.ilike(pattern, escape="\\"), VocabularyEntry.example.ilike(pattern, escape="\\")))
        .limit(limit).offset(offset)
    ).scalars().all()

    if not any([projects, tasks, notes, documents, events, tags, vocabulary]):
        return {"projects": [], "tasks": [], "notes": [], "documents": [], "events": [], "tags": [], "vocabulary": []}

    try:
        tsv_projects = _try_tsv_search(db, Project, user_id, q, limit, offset, "projects.tsv")
        if tsv_projects is not None and tsv_projects:
            projects = tsv_projects
    except Exception:
        pass

    try:
        tsv_tasks = _try_tsv_search(db, Task, user_id, q, limit, offset, "tasks.tsv")
        if tsv_tasks is not None and tsv_tasks:
            tasks = tsv_tasks
    except Exception:
        pass

    try:
        tsv_notes = _try_tsv_search(db, Note, user_id, q, limit, offset, "notes.tsv")
        if tsv_notes is not None and tsv_notes:
            notes = tsv_notes
    except Exception:
        pass

    return {
        "projects": projects,
        "tasks": tasks,
        "notes": notes,
        "documents": documents,
        "events": events,
        "tags": tags,
        "vocabulary": vocabulary,
    }

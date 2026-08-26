from fastapi import Depends, FastAPI
from sqlalchemy import text
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import get_db
from app.routes.users import router as users_router
from app.routes.profile import router as profile_router
from app.routes.project import router as project_router
from app.routes.task import router as task_router
from app.routes.note import router as note_router
from app.routes.tags import router as tags_router
from app.routes.tag_links import router as tag_links_router
from app.routes.task_dependencies import router as task_dependencies_router
from app.routes.events import router as events_router
from app.routes.documents import router as documents_router
from app.routes.auth import router as auth_router

app = FastAPI(
    title="IRIS API",
    version="0.1.0",
    description="Backend API for IRIS Personal Operating System",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(profile_router)
app.include_router(users_router)
app.include_router(project_router)
app.include_router(task_router)
app.include_router(note_router)
app.include_router(tags_router)
app.include_router(tag_links_router)
app.include_router(task_dependencies_router)
app.include_router(events_router)
app.include_router(documents_router)
app.include_router(auth_router)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "iris-api",
    }


@app.get("/health/db")
def database_health(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))

    return {
        "status": "ok",
        "database": "connected",
    }

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.sat_seeder import seed_sat_prep

router = APIRouter()

@router.post("/seed")
def seed_sat_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Seed SAT 1-Week Intensive Prep data for the current user.
    Creates project, 28 tasks (4 per day), and 7 notes.
    """
    project_id = seed_sat_prep(db, current_user.id)
    
    return {
        "message": "SAT Prep data seeded successfully",
        "project_id": str(project_id),
        "tasks_created": 28,
        "notes_created": 7,
    }

#!/usr/bin/env python3
"""
SAT Prep Data Seeder
Seed SAT 1-Week Intensive Prep data into IRIS database.
"""

import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "apps/api"))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "app.settings")
django.setup()

from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.project import Project
from app.models.task import Task
from app.models.note import Note
from app.models.user import User
from app.core.config import settings


SAT_SCHEDULE_DATA = [
    {
        "day": 1,
        "title": "Diagnostic & Foundations Kickoff",
        "focus": "Establish baseline score, understand test structure, and cover foundational concepts.",
        "math_topics": ["Unit 2: Algebra Foundations"],
        "rw_topics": ["Unit 2: Information & Ideas Foundations"],
        "practice_test": "Bluebook Practice Test 6",
        "breakdown": [
            ("Hour 1-1.5 (90 mins)", "Introduction & Diagnostic Test - Bluebook Practice Test 6"),
            ("Hour 1.5-3.0 (90 mins)", "Practice Test Breakdown - Analyze score & error categorization"),
            ("Hour 3.0-4.0 (60 mins)", "Foundations Sprint - Math Unit 2 & RW Unit 2"),
        ]
    },
    {
        "day": 2,
        "title": "Core Foundations Mastery",
        "focus": "Cover foundational problem-solving, advanced math concepts, craft, and grammar.",
        "math_topics": ["Unit 3: Problem Solving & Data Analysis", "Unit 4-5: Advanced Math & Geometry/Trig"],
        "rw_topics": ["Unit 3: Craft & Structure", "Unit 4: Expression of Ideas & Standard English Conventions"],
        "practice_test": None,
        "breakdown": [
            ("Hour 1.0-2.0 (120 mins)", "Math Foundations - Units 3, 4, 5"),
            ("Hour 2.0-4.0 (120 mins)", "Reading & Writing Foundations - Units 3, 4"),
        ]
    },
    {
        "day": 3,
        "title": "Medium-Level Practice & Application",
        "focus": "Elevate difficulty to medium-level SAT question patterns.",
        "math_topics": ["Unit 6: Medium Algebra", "Unit 7: Medium Problem Solving & Data Analysis"],
        "rw_topics": ["Unit 5: Medium Information & Ideas", "Unit 6-7: Medium Craft, Structure, Expression"],
        "practice_test": None,
        "breakdown": [
            ("Hour 1.0-2.0 (120 mins)", "Math Medium Level - Units 6, 7"),
            ("Hour 2.0-4.0 (120 mins)", "Reading & Writing Medium Level - Units 5, 6, 7"),
        ]
    },
    {
        "day": 4,
        "title": "Mid-Week Assessment & Progress Check",
        "focus": "Validate progress under real exam conditions and refine weak points.",
        "math_topics": ["Error Analysis", "Remediation Focus"],
        "rw_topics": ["Error Analysis", "Remediation Focus"],
        "practice_test": "Bluebook Practice Test 5",
        "breakdown": [
            ("Hour 1.0-2.5 (150 mins)", "Full Practice Test - Bluebook Practice Test 5"),
            ("Hour 2.5-4.0 (90 mins)", "In-Depth Review & Persistent Weak Spots Identification"),
        ]
    },
    {
        "day": 5,
        "title": "Advanced Topics & High-Difficulty Drills",
        "focus": "Master high-scoring, complex questions in Math and Reading/Writing.",
        "math_topics": ["Unit 8 & 12: Advanced Math (Nonlinear, Quadratics, Trig)", "Unit 9 & 13: Geometry & Trig (Circles, 3D)"],
        "rw_topics": ["Unit 8: Advanced Info & Ideas", "Unit 9-10: Advanced Craft & Conventions"],
        "practice_test": None,
        "breakdown": [
            ("Hour 1.0-2.0 (120 mins)", "Advanced Math - Units 8, 9, 12, 13"),
            ("Hour 2.0-4.0 (120 mins)", "Advanced Reading & Writing - Units 8, 9, 10"),
        ]
    },
    {
        "day": 6,
        "title": "Course Challenges & Targeted Fixes",
        "focus": "Comprehensive review across all modules and targeted drills on remaining weak areas.",
        "math_topics": ["Math Course Challenge", "Desmos Shortcuts"],
        "rw_topics": ["Reading & Writing Course Challenge"],
        "practice_test": None,
        "breakdown": [
            ("Hour 1.0-2.5 (90 mins)", "Course Challenges - Reading & Writing & Math"),
            ("Hour 2.5-4.0 (90 mins)", "Targeted Weakness Remediation & Desmos Shortcuts"),
        ]
    },
    {
        "day": 7,
        "title": "Final Mock Test & Pre-Exam Strategy",
        "focus": "Final score benchmark, timing refinement, and test-day strategy setup.",
        "math_topics": ["Formula Review", "Pacing Strategy"],
        "rw_topics": ["Grammar Rules", "Time Management"],
        "practice_test": "Bluebook Practice Test 4",
        "breakdown": [
            ("Hour 1.0-2.5 (150 mins)", "Final Practice Test - Bluebook Practice Test 4"),
            ("Hour 2.5-4.0 (90 mins)", "Final Review, Error Analysis & Test-Day Strategy"),
        ]
    },
]


def seed_sat_data(db: Session, user_id: str):
    """Seed SAT Prep data for a specific user."""
    
    print(f"Seeding SAT Prep data for user: {user_id}")
    
    # 1. Create or get SAT Project
    existing_project = db.query(Project).filter(
        Project.user_id == user_id,
        Project.name.ilike("%SAT%")
    ).first()
    
    if existing_project:
        project = existing_project
        print(f"Found existing SAT project: {project.name}")
    else:
        project = Project(
            id=str(uuid.uuid4()),
            user_id=user_id,
            name="SAT 1-Week Intensive Prep",
            description="7-day intensive SAT preparation roadmap (4 hours/day, total 28 hours)",
            status="active",
            priority=1,
            start_date=datetime.now(timezone.utc),
            target_date=datetime.now(timezone.utc) + timedelta(days=7),
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(project)
        db.flush()
        print(f"Created new SAT project: {project.name}")
    
    # 2. Seed Tasks (4 tasks per day)
    tasks_created = 0
    for day_info in SAT_SCHEDULE_DATA:
        day_num = day_info["day"]
        day_title = day_info["title"]
        
        tabs = [
            ("Learning", "Study foundational concepts and topics"),
            ("Doing", "Complete practice sets or practice test"),
            ("Re-learning", "Review shortcuts, tips, and Desmos tricks"),
            ("Evaluation", "Log errors and review misconseptions"),
        ]
        
        for tab_name, tab_desc in tabs:
            task_title = f"Day {day_num} - {tab_name}: {day_title}"
            
            existing_task = db.query(Task).filter(
                Task.user_id == user_id,
                Task.project_id == project.id,
                Task.title == task_title
            ).first()
            
            if not existing_task:
                task = Task(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    project_id=project.id,
                    title=task_title,
                    description=f"Day {day_num} {tab_name} Phase: {tab_desc}",
                    status="todo",
                    priority=2 if day_num <= 3 else 1,
                    due_at=datetime.now(timezone.utc) + timedelta(days=day_num),
                    created_at=datetime.now(timezone.utc),
                    updated_at=datetime.now(timezone.utc),
                )
                db.add(task)
                tasks_created += 1
    
    db.flush()
    print(f"Created {tasks_created} tasks")
    
    # 3. Seed Notes (Timeline per day)
    notes_created = 0
    for day_info in SAT_SCHEDULE_DATA:
        day_num = day_info["day"]
        note_title = f"Day {day_num} Schedule & Materials - {day_info['title']}"
        
        existing_note = db.query(Note).filter(
            Note.user_id == user_id,
            Note.project_id == project.id,
            Note.title == note_title
        ).first()
        
        if not existing_note:
            breakdown_str = "\n".join([f"- **{time}**: {act}" for time, act in day_info["breakdown"]])
            math_str = ", ".join(day_info["math_topics"])
            rw_str = ", ".join(day_info["rw_topics"])
            test_str = day_info["practice_test"] or "None"
            
            content = f"""# Day {day_num}: {day_info['title']}

**Goal:** {day_info['focus']}

## Schedule Breakdown
{breakdown_str}

## Topics Covered
- **Math:** {math_str}
- **Reading & Writing:** {rw_str}
- **Practice Test:** {test_str}

## Execution Strategy
- Practice first, review theory only for incorrect questions (80/20 Principle)
- Use Desmos calculator for rapid equation solving
- Keep strict adherence to the 4-hour daily window
"""
            
            note = Note(
                id=str(uuid.uuid4()),
                user_id=user_id,
                project_id=project.id,
                title=note_title,
                content=content,
                note_type="learning",
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            db.add(note)
            notes_created += 1
    
    db.commit()
    
    print(f"✅ SAT Prep data seeded successfully!")
    print(f"   Project: {project.name}")
    print(f"   Tasks: {tasks_created} created")
    print(f"   Notes: {notes_created} created")
    
    return project.id


if __name__ == "__main__":
    import uuid
    
    # Get user_id from environment or use default
    user_id = os.environ.get("SAT_SEED_USER_ID", "default-user-id")
    
    db = SessionLocal()
    try:
        project_id = seed_sat_data(db, user_id)
        print(f"\nProject ID: {project_id}")
    finally:
        db.close()

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.profile import Profile
from app.schemas.profile import ProfileCreate, ProfileUpdate


def create_profile(db: Session, data: ProfileCreate):
    profile = Profile(**data.model_dump())

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile


def get_profiles(db: Session):
    result = db.execute(
        select(Profile).order_by(Profile.created_at.desc())
    )

    return result.scalars().all()


def get_profile(db: Session, profile_id: UUID):
    return db.get(Profile, profile_id)


def update_profile(
    db: Session,
    profile: Profile,
    data: ProfileUpdate,
):
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    return profile


def delete_profile(db: Session, profile: Profile):
    db.delete(profile)
    db.commit()

from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.profile import Profile
from app.models.user import User
from app.schemas.profile import (
    ProfileCreate,
    ProfileResponse,
    ProfileUpdate,
)
from app.services.profile_service import (
    create_profile,
    delete_profile,
    get_profile,
    get_profiles,
    update_profile,
)


router = APIRouter(
    prefix="/profiles",
    tags=["Profiles"],
)


@router.get("/me")
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = (
        db.query(Profile)
        .filter(Profile.user_id == current_user.id)
        .first()
    )

    if profile is None:
        raise HTTPException(
            status_code=404,
            detail="Profile not found",
        )

    return profile


@router.post("/me")
def create_my_profile(
    data: ProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = (
        db.query(Profile)
        .filter(Profile.user_id == current_user.id)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Profile already exists",
        )

    profile = Profile(
        user_id=current_user.id,
        full_name=data.full_name,
        display_name=data.display_name,
        bio=data.bio,
        timezone=data.timezone,
        locale=data.locale,
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile


@router.post(
    "",
    response_model=ProfileResponse,
    status_code=status.HTTP_201_CREATED,
)
def create(
    data: ProfileCreate,
    db: Session = Depends(get_db),
):
    return create_profile(db, data)


@router.get(
    "",
    response_model=list[ProfileResponse],
)
def list_all(
    db: Session = Depends(get_db),
):
    return get_profiles(db)


@router.get(
    "/{profile_id}",
    response_model=ProfileResponse,
)
def get_one(
    profile_id: UUID,
    db: Session = Depends(get_db),
):
    profile = get_profile(db, profile_id)

    if profile is None:
        raise HTTPException(
            status_code=404,
            detail="Profile not found",
        )

    return profile


@router.patch(
    "/{profile_id}",
    response_model=ProfileResponse,
)
def update(
    profile_id: UUID,
    data: ProfileUpdate,
    db: Session = Depends(get_db),
):
    profile = get_profile(db, profile_id)

    if profile is None:
        raise HTTPException(
            status_code=404,
            detail="Profile not found",
        )

    return update_profile(db, profile, data)


@router.delete(
    "/{profile_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete(
    profile_id: UUID,
    db: Session = Depends(get_db),
):
    profile = get_profile(db, profile_id)

    if profile is None:
        raise HTTPException(
            status_code=404,
            detail="Profile not found",
        )

    delete_profile(db, profile)

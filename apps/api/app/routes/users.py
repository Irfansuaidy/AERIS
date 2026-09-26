from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserUpdate,
)
from app.services.user_service import (
    create_user,
    delete_user,
    get_user,
    get_users,
    update_user,
)
from app.core.dependencies import get_current_user
from app.models.user import User


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user),
):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at,
    }


@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def create(
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Only allow registration via auth/register or admin
    raise HTTPException(
        status_code=403,
        detail="Use /auth/register to create new users",
    )


@router.get(
    "",
    response_model=list[UserResponse],
)
def list_all(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Filter to only return current user
    return [current_user]


@router.get(
    "/{user_id}",
    response_model=UserResponse,
)
def get_one(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if user_id != current_user.id:
        # TODO(PRE-DEPLOY): switch 403 to 404 to hide existence
        raise HTTPException(
            status_code=403,
            detail="Cannot access other users' data",
        )

    return current_user


@router.patch(
    "/{user_id}",
    response_model=UserResponse,
)
def update(
    user_id: UUID,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Cannot update other users",
        )

    return update_user(db, current_user, data)


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Cannot delete other users",
        )

    delete_user(db, current_user)

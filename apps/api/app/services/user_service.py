from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate


def create_user(db: Session, data: UserCreate):
    user = User(
        username=data.username,
        email=data.email,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def get_users(db: Session):
    result = db.execute(
        select(User).order_by(User.created_at.desc())
    )

    return result.scalars().all()


def get_user(db: Session, user_id: UUID):
    return db.get(User, user_id)


def update_user(
    db: Session,
    user: User,
    data: UserUpdate,
):
    if data.username is not None:
        user.username = data.username

    if data.email is not None:
        user.email = data.email

    db.commit()
    db.refresh(user)

    return user


def delete_user(db: Session, user: User):
    db.delete(user)
    db.commit()

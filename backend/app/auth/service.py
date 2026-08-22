"""Auth business logic — user creation, login, token management."""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import User
from app.auth.schemas import SignupRequest
from app.core.exceptions import ConflictError, UnauthorizedError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)


async def create_user(db: AsyncSession, data: SignupRequest) -> User:
    """Register a new user. Raises ConflictError if email already exists."""
    # Check for existing email
    existing = await db.execute(
        select(User).where(User.email == data.email)
    )
    if existing.scalar_one_or_none() is not None:
        raise ConflictError("A user with this email already exists")

    user = User(
        id=uuid.uuid4(),
        email=data.email,
        password_hash=hash_password(data.password),
        name=data.name,
    )
    db.add(user)
    await db.flush()  # Populate server defaults (created_at) without committing
    return user


async def authenticate_user(
    db: AsyncSession, email: str, password: str
) -> User:
    """Validate credentials and return the user. Raises UnauthorizedError on failure."""
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if user is None or not verify_password(password, user.password_hash):
        raise UnauthorizedError("Invalid email or password")

    return user


def generate_tokens(user: User) -> dict[str, str]:
    """Generate an access + refresh token pair for the given user."""
    token_data = {"sub": str(user.id), "email": user.email, "role": user.role}
    return {
        "access_token": create_access_token(token_data),
        "refresh_token": create_refresh_token(token_data),
        "token_type": "bearer",
    }


async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> User | None:
    """Fetch a user by primary key."""
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()

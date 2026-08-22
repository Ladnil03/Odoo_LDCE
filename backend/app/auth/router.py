"""Auth API endpoints — signup, login, refresh, profile."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.auth.models import User
from app.auth.schemas import (
    LoginRequest,
    RefreshRequest,
    SignupRequest,
    TokenResponse,
    UserResponse,
)
from app.auth.service import authenticate_user, create_user, generate_tokens, get_user_by_id
from app.core.database import get_db
from app.core.exceptions import UnauthorizedError
from app.core.security import decode_token

import uuid

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=TokenResponse, status_code=201)
async def signup(
    data: SignupRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TokenResponse:
    """Register a new user and return JWT tokens."""
    user = await create_user(db, data)
    tokens = generate_tokens(user)
    return TokenResponse(**tokens)


@router.post("/login", response_model=TokenResponse)
async def login(
    data: LoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TokenResponse:
    """Authenticate with email + password and return JWT tokens."""
    user = await authenticate_user(db, data.email, data.password)
    tokens = generate_tokens(user)
    return TokenResponse(**tokens)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    data: RefreshRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TokenResponse:
    """Exchange a valid refresh token for a new access + refresh token pair."""
    payload = decode_token(data.refresh_token)
    if payload is None:
        raise UnauthorizedError("Invalid or expired refresh token")

    if payload.get("type") != "refresh":
        raise UnauthorizedError("Invalid token type — expected refresh token")

    user_id_str = payload.get("sub")
    if user_id_str is None:
        raise UnauthorizedError("Token missing subject claim")

    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        raise UnauthorizedError("Invalid user ID in token")

    user = await get_user_by_id(db, user_id)
    if user is None:
        raise UnauthorizedError("User no longer exists")

    tokens = generate_tokens(user)
    return TokenResponse(**tokens)


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: Annotated[User, Depends(get_current_user)],
) -> UserResponse:
    """Return the authenticated user's profile."""
    return UserResponse.model_validate(current_user)

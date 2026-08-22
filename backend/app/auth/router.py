"""Auth API endpoints — signup, login, refresh, profile, avatar upload."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.auth.models import User
from app.auth.schemas import (
    AvatarUploadResponse,
    LoginRequest,
    ProfileUpdateRequest,
    RefreshRequest,
    SignupRequest,
    TokenResponse,
    UserResponse,
)
from app.auth.service import (
    authenticate_user,
    create_user,
    generate_tokens,
    get_user_by_id,
    update_user_profile,
)
from app.core.cloudinary import upload_image
from app.core.database import get_db
from app.core.exceptions import BadRequestError, UnauthorizedError
from app.core.security import decode_token

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


@router.post("/avatar", response_model=AvatarUploadResponse)
@router.post("/profile-photo", response_model=AvatarUploadResponse)
async def upload_avatar(
    file: Annotated[UploadFile, File(...)],
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> AvatarUploadResponse:
    """Upload user avatar to Cloudinary and persist the permanent URL in the user record."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise BadRequestError("File must be an image (JPEG, PNG, WebP, etc.)")

    file_bytes = await file.read()
    if not file_bytes:
        raise BadRequestError("Uploaded image file cannot be empty")

    # Upload to Cloudinary under globetrotter/avatars
    avatar_url = await upload_image(
        file_bytes=file_bytes,
        filename=file.filename or "avatar.jpg",
        folder="globetrotter/avatars",
        public_id=f"user_{current_user.id}",
    )

    # Save to user in database
    await update_user_profile(db, current_user, avatar_url=avatar_url)
    await db.commit()

    return AvatarUploadResponse(
        avatar_url=avatar_url,
        message="Profile photo uploaded and persisted successfully",
    )


@router.patch("/profile", response_model=UserResponse)
async def update_profile(
    data: ProfileUpdateRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> UserResponse:
    """Update profile information (e.g. name or custom avatar URL)."""
    user = await update_user_profile(
        db, current_user, name=data.name, avatar_url=data.avatar_url
    )
    await db.commit()
    return UserResponse.model_validate(user)

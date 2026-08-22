"""Pydantic v2 schemas for auth requests and responses."""

import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


# ── Request schemas ──

class SignupRequest(BaseModel):
    """User registration request."""
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    name: str = Field(min_length=1, max_length=100)


class LoginRequest(BaseModel):
    """User login request."""
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    """Token refresh request."""
    refresh_token: str


class ProfileUpdateRequest(BaseModel):
    """User profile update request."""
    name: str | None = Field(default=None, min_length=1, max_length=100)
    avatar_url: str | None = Field(default=None, max_length=500)


# ── Response schemas ──

class TokenResponse(BaseModel):
    """JWT token pair response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """Public user profile data."""
    id: uuid.UUID
    email: str
    name: str
    avatar_url: str | None = None
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


class AvatarUploadResponse(BaseModel):
    """Avatar upload response containing the permanent image URL."""
    avatar_url: str
    message: str = "Profile photo updated successfully"


class MessageResponse(BaseModel):
    """Generic message response."""
    message: str

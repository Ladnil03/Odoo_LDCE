"""Pydantic schemas for community posts, likes, comments."""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


# ── Author brief (embedded in responses) ──

class AuthorBrief(BaseModel):
    id: uuid.UUID
    name: str
    avatar_url: str | None = None
    location: str | None = None
    verified: bool = False

    model_config = {"from_attributes": True}


# ── Comments ──

class CommentCreate(BaseModel):
    body: str = Field(min_length=1, max_length=1000)


class CommentResponse(BaseModel):
    id: uuid.UUID
    post_id: uuid.UUID
    body: str
    created_at: datetime
    author: AuthorBrief

    model_config = {"from_attributes": True}


# ── Posts ──

class CommunityPostCreate(BaseModel):
    trip_id: uuid.UUID
    title: str = Field(min_length=1, max_length=200)
    summary: str | None = Field(default=None, max_length=2000)
    destination: str | None = Field(default=None, max_length=200)
    country: str | None = Field(default=None, max_length=100)
    cover_image: str | None = Field(default=None, max_length=500)
    tags: list[str] = Field(default_factory=list)
    days_duration: int = Field(default=0, ge=0)
    budget_total: float = Field(default=0.0, ge=0)


class CommunityPostResponse(BaseModel):
    id: uuid.UUID
    trip_id: uuid.UUID
    title: str
    summary: str | None = None
    destination: str | None = None
    country: str | None = None
    cover_image: str | None = None
    tags: list[str] = []
    days_duration: int
    budget_total: float
    likes_count: int
    comments_count: int
    shares_count: int
    clones_count: int
    is_published: bool
    created_at: datetime
    author: AuthorBrief
    liked_by_me: bool = False

    model_config = {"from_attributes": True}


class CommunityPostListResponse(BaseModel):
    items: list[CommunityPostResponse]
    total: int
    page: int
    page_size: int

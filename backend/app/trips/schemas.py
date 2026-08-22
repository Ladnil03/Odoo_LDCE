"""Pydantic v2 schemas for trip requests and responses."""

import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field


# ── Request schemas ──

class TripCreateRequest(BaseModel):
    """Create a new trip."""
    name: str = Field(min_length=1, max_length=200)
    start_date: date | None = None
    end_date: date | None = None
    description: str | None = Field(default=None, max_length=2000)
    daily_budget: float | None = Field(default=None, ge=0)
    base_currency: str = Field(default="USD", min_length=3, max_length=3)


class TripUpdateRequest(BaseModel):
    """Update trip fields (all optional)."""
    name: str | None = Field(default=None, min_length=1, max_length=200)
    start_date: date | None = None
    end_date: date | None = None
    cover_photo: str | None = None
    description: str | None = Field(default=None, max_length=2000)
    daily_budget: float | None = Field(default=None, ge=0)
    base_currency: str | None = Field(default=None, min_length=3, max_length=3)


# ── Response schemas ──

class StopBrief(BaseModel):
    """Compact stop info embedded in trip responses."""
    id: uuid.UUID
    city_id: uuid.UUID
    order_index: int
    arrival_date: date | None = None
    departure_date: date | None = None

    model_config = {"from_attributes": True}


class TripResponse(BaseModel):
    """Full trip detail response."""
    id: uuid.UUID
    owner_id: uuid.UUID
    name: str
    start_date: date | None = None
    end_date: date | None = None
    cover_photo: str | None = None
    description: str | None = None
    is_public: bool
    share_slug: str | None = None
    daily_budget: float | None = None
    base_currency: str
    created_at: datetime
    stops: list[StopBrief] = []

    model_config = {"from_attributes": True}


class TripListResponse(BaseModel):
    """Paginated trip list."""
    items: list[TripResponse]
    total: int
    page: int
    page_size: int


class ShareResponse(BaseModel):
    """Response after sharing a trip."""
    share_slug: str
    public_url: str


class TripCopyResponse(BaseModel):
    """Response after copying a trip."""
    new_trip_id: uuid.UUID
    message: str

"""Pydantic v2 schemas for city and activity search/detail."""

import uuid

from pydantic import BaseModel, Field


# ── Response schemas ──

class CityResponse(BaseModel):
    """City detail response."""
    id: uuid.UUID
    name: str
    country: str
    region: str | None = None
    cost_index: float
    popularity_score: int
    lat: float
    lng: float

    model_config = {"from_attributes": True}


class CityListResponse(BaseModel):
    """Paginated city search results."""
    items: list[CityResponse]
    total: int
    page: int
    page_size: int


class ActivityResponse(BaseModel):
    """Activity detail response."""
    id: uuid.UUID
    city_id: uuid.UUID
    name: str
    category: str
    cost: float
    duration_minutes: int
    description: str | None = None
    image_url: str | None = None

    model_config = {"from_attributes": True}


class ActivityListResponse(BaseModel):
    """Paginated activity search results."""
    items: list[ActivityResponse]
    total: int
    page: int
    page_size: int

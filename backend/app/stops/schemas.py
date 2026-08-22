"""Pydantic v2 schemas for stop requests and responses."""

import uuid
from datetime import date

from pydantic import BaseModel, Field


# ── Request schemas ──

class StopCreateRequest(BaseModel):
    """Add a stop to a trip."""
    city_id: uuid.UUID
    arrival_date: date | None = None
    departure_date: date | None = None


class StopReorderRequest(BaseModel):
    """Reorder stops within a trip."""
    ordered_ids: list[uuid.UUID] = Field(
        ..., description="Stop IDs in the desired order"
    )


# ── Response schemas ──

class CityBrief(BaseModel):
    """Compact city info embedded in stop responses."""
    id: uuid.UUID
    name: str
    country: str

    model_config = {"from_attributes": True}


class StopResponse(BaseModel):
    """Full stop detail response."""
    id: uuid.UUID
    trip_id: uuid.UUID
    city_id: uuid.UUID
    order_index: int
    arrival_date: date | None = None
    departure_date: date | None = None
    city: CityBrief | None = None

    model_config = {"from_attributes": True}

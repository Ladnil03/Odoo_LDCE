"""Pydantic v2 schemas for itinerary management."""

import uuid
from datetime import date, time
from typing import Optional

from pydantic import BaseModel, Field


# ── Request schemas ──

class AssignActivityRequest(BaseModel):
    """Assign an activity to a stop."""
    activity_id: uuid.UUID
    scheduled_date: Optional[date] = None
    scheduled_time: Optional[time] = None
    cost_override: Optional[float] = Field(default=None, ge=0)


class UpdateTripActivityRequest(BaseModel):
    """Update scheduling or cost for an assigned activity."""
    scheduled_date: Optional[date] = None
    scheduled_time: Optional[time] = None
    cost_override: Optional[float] = Field(default=None, ge=0)


class RescheduleRequest(BaseModel):
    """Move an activity to a new date/time/order."""
    new_date: Optional[date] = None
    new_time: Optional[time] = None
    new_order_index: Optional[int] = Field(default=None, ge=0)


# ── Response schemas ──

class ActivityBrief(BaseModel):
    """Compact activity info embedded in itinerary responses."""
    id: uuid.UUID
    name: str
    category: str
    cost: float
    duration_minutes: int

    model_config = {"from_attributes": True}


class TripActivityResponse(BaseModel):
    """A single activity assignment within the itinerary."""
    id: uuid.UUID
    stop_id: uuid.UUID
    activity_id: uuid.UUID
    scheduled_date: Optional[date] = None
    scheduled_time: Optional[time] = None
    cost_override: Optional[float] = None
    order_index: int
    activity: Optional[ActivityBrief] = None

    model_config = {"from_attributes": True}


class DayItinerary(BaseModel):
    """Activities grouped by day for a single city stop."""
    day_date: Optional[date] = None
    activities: list[TripActivityResponse]
    day_total: float


class StopItinerary(BaseModel):
    """Full itinerary for a single stop (city)."""
    stop_id: uuid.UUID
    city_name: str
    city_country: str
    order_index: int
    arrival_date: Optional[date] = None
    departure_date: Optional[date] = None
    days: list[DayItinerary]
    stop_total: float


class FullItineraryResponse(BaseModel):
    """Complete trip itinerary grouped by stop → day → activities."""
    trip_id: uuid.UUID
    trip_name: str
    stops: list[StopItinerary]
    total_cost: float


class CalendarDayEntry(BaseModel):
    """A single activity entry for calendar rendering."""
    id: uuid.UUID
    name: str
    entry_time: Optional[time] = None
    cost: float
    category: str
    duration_minutes: int


class CalendarResponse(BaseModel):
    """Date-keyed itinerary for calendar rendering."""
    trip_id: uuid.UUID
    calendar: dict[str, dict]  # date_str → {"city": str, "activities": [...], "day_total": float}

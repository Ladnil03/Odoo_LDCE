"""Pydantic v2 schemas for admin analytics responses."""

import uuid
from datetime import datetime

from pydantic import BaseModel


class OverviewStats(BaseModel):
    """High-level platform statistics."""
    total_users: int
    total_trips: int
    total_activities_assigned: int
    total_cities: int


class TimeBucket(BaseModel):
    """A single time bucket for trend charts."""
    period: str  # e.g. "2026-W34" or "2026-08"
    count: int


class TripsOverTimeResponse(BaseModel):
    """Trips created over time, bucketed."""
    buckets: list[TimeBucket]
    bucket_type: str  # "week" | "month"


class PopularItem(BaseModel):
    """A popular city or activity with its count."""
    id: uuid.UUID
    name: str
    count: int


class TopCitiesResponse(BaseModel):
    """Most popular cities by trip inclusion."""
    cities: list[PopularItem]


class TopActivitiesResponse(BaseModel):
    """Most assigned activities."""
    activities: list[PopularItem]


class BudgetStats(BaseModel):
    """Aggregate budget statistics across all trips."""
    average_trip_budget: float
    median_trip_budget: float
    total_revenue_potential: float
    category_distribution: dict[str, float]


class AdminUserResponse(BaseModel):
    """User info for admin listing."""
    id: uuid.UUID
    email: str
    name: str
    role: str
    created_at: datetime
    trip_count: int

    model_config = {"from_attributes": True}


class AdminUserListResponse(BaseModel):
    """Paginated admin user list."""
    items: list[AdminUserResponse]
    total: int
    page: int
    page_size: int

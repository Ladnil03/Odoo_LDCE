"""Pydantic v2 schemas for budget responses."""

import uuid
from datetime import date
from typing import Optional

from pydantic import BaseModel


class CategoryBreakdown(BaseModel):
    """Cost breakdown by activity category."""
    transport: float = 0.0
    stay: float = 0.0
    activity: float = 0.0
    food: float = 0.0


class DayBudget(BaseModel):
    """Budget summary for a single day."""
    day_date: Optional[date] = None
    total: float
    is_overbudget: bool


class StopBudget(BaseModel):
    """Budget summary for a single stop (city)."""
    stop_id: uuid.UUID
    city_name: str
    total: float


class BudgetResponse(BaseModel):
    """Full budget breakdown for a trip."""
    trip_id: uuid.UUID
    total_cost: float
    daily_budget: Optional[float] = None
    currency: str
    by_category: CategoryBreakdown
    by_day: list[DayBudget]
    by_stop: list[StopBudget]


class DailyBudgetResponse(BaseModel):
    """Per-day budget with overbudget flags."""
    trip_id: uuid.UUID
    daily_budget: Optional[float] = None
    currency: str
    days: list[DayBudget]


class CategoryBudgetResponse(BaseModel):
    """Budget grouped by category."""
    trip_id: uuid.UUID
    currency: str
    total_cost: float
    by_category: CategoryBreakdown

"""Budget engine — CTE-based cost aggregation queries."""

import uuid
from datetime import date as date_type

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import User
from app.budget.schemas import (
    BudgetResponse,
    CategoryBreakdown,
    CategoryBudgetResponse,
    DailyBudgetResponse,
    DayBudget,
    StopBudget,
)
from app.catalog.models import Activity, City
from app.core.exceptions import ForbiddenError, NotFoundError
from app.itinerary.models import TripActivity
from app.stops.models import Stop
from app.trips.models import Trip


async def _get_trip_for_budget(
    db: AsyncSession, trip_id: uuid.UUID, user: User
) -> Trip:
    """Load trip and verify ownership for budget access."""
    result = await db.execute(
        select(Trip).where(Trip.id == trip_id, Trip.deleted_at.is_(None))
    )
    trip = result.scalar_one_or_none()
    if trip is None:
        raise NotFoundError("Trip")
    if trip.owner_id != user.id:
        raise ForbiddenError("You do not own this trip")
    return trip


async def get_full_budget(
    db: AsyncSession, trip_id: uuid.UUID, user: User
) -> BudgetResponse:
    """Compute the full budget breakdown using SQL CTE.

    Returns total cost, by-category, by-day (with overbudget flags), and by-stop.
    """
    trip = await _get_trip_for_budget(db, trip_id, user)

    # ── 1. Define Activity Costs CTE ──
    effective_cost_expr = func.coalesce(TripActivity.cost_override, Activity.cost).label("effective_cost")

    activity_costs_cte = (
        select(
            TripActivity.id.label("ta_id"),
            TripActivity.stop_id,
            TripActivity.scheduled_date,
            Activity.category,
            City.name.label("city_name"),
            effective_cost_expr,
        )
        .join(Activity, TripActivity.activity_id == Activity.id)
        .join(Stop, TripActivity.stop_id == Stop.id)
        .join(City, Stop.city_id == City.id)
        .where(Stop.trip_id == trip_id)
        .cte("activity_costs")
    )

    # ── 2. Total Cost Query ──
    total_query = select(func.coalesce(func.sum(activity_costs_cte.c.effective_cost), 0.0))
    total_result = await db.execute(total_query)
    total_cost = float(total_result.scalar_one() or 0.0)

    # ── 3. Category Breakdown Query ──
    cat_query = (
        select(
            activity_costs_cte.c.category,
            func.coalesce(func.sum(activity_costs_cte.c.effective_cost), 0.0).label("cat_total"),
        )
        .group_by(activity_costs_cte.c.category)
    )
    cat_result = await db.execute(cat_query)
    categories = {"transport": 0.0, "stay": 0.0, "activity": 0.0, "food": 0.0}
    for row in cat_result.all():
        cat, cat_total = row[0], float(row[1]) if row[1] else 0.0
        if cat in categories:
            categories[cat] = round(cat_total, 2)

    # ── 4. Day Breakdown Query ──
    day_query = (
        select(
            activity_costs_cte.c.scheduled_date,
            func.coalesce(func.sum(activity_costs_cte.c.effective_cost), 0.0).label("day_total"),
        )
        .where(activity_costs_cte.c.scheduled_date.is_not(None))
        .group_by(activity_costs_cte.c.scheduled_date)
        .order_by(activity_costs_cte.c.scheduled_date)
    )
    day_result = await db.execute(day_query)
    days: list[DayBudget] = []
    for row in day_result.all():
        raw_date, raw_total = row[0], float(row[1]) if row[1] else 0.0
        parsed_date = (
            date_type.fromisoformat(str(raw_date))
            if isinstance(raw_date, str)
            else raw_date
        )
        is_over = raw_total > trip.daily_budget if trip.daily_budget else False
        days.append(DayBudget(
            day_date=parsed_date,
            total=round(raw_total, 2),
            is_overbudget=is_over,
        ))

    # ── 5. Stop Breakdown Query ──
    stop_query = (
        select(
            activity_costs_cte.c.stop_id,
            activity_costs_cte.c.city_name,
            func.coalesce(func.sum(activity_costs_cte.c.effective_cost), 0.0).label("stop_total"),
        )
        .group_by(activity_costs_cte.c.stop_id, activity_costs_cte.c.city_name)
    )
    stop_result = await db.execute(stop_query)
    stops: list[StopBudget] = []
    for row in stop_result.all():
        stop_id_val, city_name, raw_total = row[0], row[1], float(row[2]) if row[2] else 0.0
        stops.append(StopBudget(
            stop_id=uuid.UUID(str(stop_id_val)) if not isinstance(stop_id_val, uuid.UUID) else stop_id_val,
            city_name=city_name or "Unknown",
            total=round(raw_total, 2),
        ))

    return BudgetResponse(
        trip_id=trip_id,
        total_cost=round(total_cost, 2),
        daily_budget=trip.daily_budget,
        currency=trip.base_currency,
        by_category=CategoryBreakdown(**categories),
        by_day=days,
        by_stop=stops,
    )


async def get_daily_budget(
    db: AsyncSession, trip_id: uuid.UUID, user: User
) -> DailyBudgetResponse:
    """Get per-day budget with overbudget flags."""
    trip = await _get_trip_for_budget(db, trip_id, user)

    effective_cost_expr = func.coalesce(TripActivity.cost_override, Activity.cost).label("effective_cost")
    query = (
        select(
            TripActivity.scheduled_date,
            func.coalesce(func.sum(effective_cost_expr), 0.0).label("day_total"),
        )
        .join(Activity, TripActivity.activity_id == Activity.id)
        .join(Stop, TripActivity.stop_id == Stop.id)
        .where(Stop.trip_id == trip_id, TripActivity.scheduled_date.is_not(None))
        .group_by(TripActivity.scheduled_date)
        .order_by(TripActivity.scheduled_date)
    )

    result = await db.execute(query)
    days = []
    for row in result.all():
        raw_date, raw_total = row[0], float(row[1]) if row[1] else 0.0
        parsed_date = (
            date_type.fromisoformat(str(raw_date))
            if isinstance(raw_date, str)
            else raw_date
        )
        is_over = raw_total > trip.daily_budget if trip.daily_budget else False
        days.append(DayBudget(
            day_date=parsed_date,
            total=round(raw_total, 2),
            is_overbudget=is_over,
        ))

    return DailyBudgetResponse(
        trip_id=trip_id,
        daily_budget=trip.daily_budget,
        currency=trip.base_currency,
        days=days,
    )


async def get_category_budget(
    db: AsyncSession, trip_id: uuid.UUID, user: User
) -> CategoryBudgetResponse:
    """Get budget grouped by category."""
    trip = await _get_trip_for_budget(db, trip_id, user)

    effective_cost_expr = func.coalesce(TripActivity.cost_override, Activity.cost).label("effective_cost")
    query = (
        select(
            Activity.category,
            func.coalesce(func.sum(effective_cost_expr), 0.0).label("cat_total"),
        )
        .join(Activity, TripActivity.activity_id == Activity.id)
        .join(Stop, TripActivity.stop_id == Stop.id)
        .where(Stop.trip_id == trip_id)
        .group_by(Activity.category)
    )

    result = await db.execute(query)
    categories = {"transport": 0.0, "stay": 0.0, "activity": 0.0, "food": 0.0}
    total = 0.0
    for row in result.all():
        cat, raw_total = row[0], float(row[1]) if row[1] else 0.0
        if cat in categories:
            categories[cat] = round(raw_total, 2)
        total += raw_total

    return CategoryBudgetResponse(
        trip_id=trip_id,
        currency=trip.base_currency,
        total_cost=round(total, 2),
        by_category=CategoryBreakdown(**categories),
    )

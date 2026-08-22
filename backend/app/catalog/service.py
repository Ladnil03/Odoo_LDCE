"""Catalog business logic — city/activity search with full-text search."""

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.catalog.models import Activity, City
from app.core.exceptions import NotFoundError


# ── City search ──

async def search_cities(
    db: AsyncSession,
    *,
    query: str | None = None,
    country: str | None = None,
    region: str | None = None,
    page: int = 1,
    page_size: int = 20,
    sort_by: str = "popularity",
) -> tuple[list[City], int]:
    """Search cities with optional full-text search, country/region filters."""
    stmt = select(City)
    count_stmt = select(func.count()).select_from(City)

    # Full-text search filter
    if query:
        ts_query = func.websearch_to_tsquery("english", query)
        fts_filter = City.search_vector.bool_op("@@")(ts_query)
        stmt = stmt.where(fts_filter)
        count_stmt = count_stmt.where(fts_filter)

    # Country filter
    if country:
        stmt = stmt.where(City.country.ilike(f"%{country}%"))
        count_stmt = count_stmt.where(City.country.ilike(f"%{country}%"))

    # Region filter
    if region:
        stmt = stmt.where(City.region.ilike(f"%{region}%"))
        count_stmt = count_stmt.where(City.region.ilike(f"%{region}%"))

    # Total count
    total = (await db.execute(count_stmt)).scalar_one()

    # Sorting
    if query:
        # Sort by relevance when searching
        ts_query = func.websearch_to_tsquery("english", query)
        stmt = stmt.order_by(
            func.ts_rank(City.search_vector, ts_query).desc()
        )
    elif sort_by == "cost":
        stmt = stmt.order_by(City.cost_index.asc())
    else:
        stmt = stmt.order_by(City.popularity_score.desc())

    # Pagination
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(stmt)
    return list(result.scalars().all()), total


async def get_city(db: AsyncSession, city_id: uuid.UUID) -> City:
    """Get a single city by ID."""
    result = await db.execute(select(City).where(City.id == city_id))
    city = result.scalar_one_or_none()
    if city is None:
        raise NotFoundError("City")
    return city


# ── Activity search ──

async def search_activities(
    db: AsyncSession,
    *,
    query: str | None = None,
    city_id: uuid.UUID | None = None,
    category: str | None = None,
    max_cost: float | None = None,
    max_duration: int | None = None,
    page: int = 1,
    page_size: int = 20,
    sort_by: str = "cost",
) -> tuple[list[Activity], int]:
    """Search activities with optional FTS, city, category, cost/duration filters."""
    stmt = select(Activity)
    count_stmt = select(func.count()).select_from(Activity)

    # Full-text search
    if query:
        ts_query = func.websearch_to_tsquery("english", query)
        fts_filter = Activity.search_vector.bool_op("@@")(ts_query)
        stmt = stmt.where(fts_filter)
        count_stmt = count_stmt.where(fts_filter)

    # City filter
    if city_id:
        stmt = stmt.where(Activity.city_id == city_id)
        count_stmt = count_stmt.where(Activity.city_id == city_id)

    # Category filter
    if category:
        valid_categories = {"transport", "stay", "activity", "food"}
        if category.lower() not in valid_categories:
            pass  # Silently ignore invalid categories — returns empty
        stmt = stmt.where(Activity.category == category.lower())
        count_stmt = count_stmt.where(Activity.category == category.lower())

    # Cost filter
    if max_cost is not None:
        stmt = stmt.where(Activity.cost <= max_cost)
        count_stmt = count_stmt.where(Activity.cost <= max_cost)

    # Duration filter
    if max_duration is not None:
        stmt = stmt.where(Activity.duration_minutes <= max_duration)
        count_stmt = count_stmt.where(Activity.duration_minutes <= max_duration)

    # Total count
    total = (await db.execute(count_stmt)).scalar_one()

    # Sorting
    if query:
        ts_query = func.websearch_to_tsquery("english", query)
        stmt = stmt.order_by(
            func.ts_rank(Activity.search_vector, ts_query).desc()
        )
    elif sort_by == "duration":
        stmt = stmt.order_by(Activity.duration_minutes.asc())
    else:
        stmt = stmt.order_by(Activity.cost.asc())

    # Pagination
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(stmt)
    return list(result.scalars().all()), total


async def get_activity(db: AsyncSession, activity_id: uuid.UUID) -> Activity:
    """Get a single activity by ID."""
    result = await db.execute(
        select(Activity).where(Activity.id == activity_id)
    )
    activity = result.scalar_one_or_none()
    if activity is None:
        raise NotFoundError("Activity")
    return activity

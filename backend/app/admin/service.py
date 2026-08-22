"""Admin analytics business logic — aggregate queries with date bucketing."""

import uuid

from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.admin.schemas import (
    AdminUserListResponse,
    AdminUserResponse,
    BudgetStats,
    OverviewStats,
    PopularItem,
    TimeBucket,
    TopActivitiesResponse,
    TopCitiesResponse,
    TripsOverTimeResponse,
)
from app.auth.models import User
from app.catalog.models import City
from app.itinerary.models import TripActivity
from app.stops.models import Stop
from app.trips.models import Trip


async def get_overview(db: AsyncSession) -> OverviewStats:
    """Get high-level platform stats."""
    users_count = (await db.execute(select(func.count(User.id)))).scalar_one()
    trips_count = (await db.execute(
        select(func.count(Trip.id)).where(Trip.deleted_at.is_(None))
    )).scalar_one()
    activities_count = (await db.execute(
        select(func.count(TripActivity.id))
    )).scalar_one()
    cities_count = (await db.execute(select(func.count(City.id)))).scalar_one()

    return OverviewStats(
        total_users=users_count,
        total_trips=trips_count,
        total_activities_assigned=activities_count,
        total_cities=cities_count,
    )


async def get_trips_over_time(
    db: AsyncSession, bucket_type: str = "week"
) -> TripsOverTimeResponse:
    """Get trip creation counts bucketed by week or month."""
    trunc_field = "week" if bucket_type == "week" else "month"

    query = text(f"""
        SELECT
            TO_CHAR(date_trunc('{trunc_field}', created_at), 'YYYY-"W"IW') AS period,
            COUNT(*) AS trip_count
        FROM trips
        WHERE deleted_at IS NULL
        GROUP BY date_trunc('{trunc_field}', created_at)
        ORDER BY date_trunc('{trunc_field}', created_at) DESC
        LIMIT 52
    """) if bucket_type == "week" else text("""
        SELECT
            TO_CHAR(date_trunc('month', created_at), 'YYYY-MM') AS period,
            COUNT(*) AS trip_count
        FROM trips
        WHERE deleted_at IS NULL
        GROUP BY date_trunc('month', created_at)
        ORDER BY date_trunc('month', created_at) DESC
        LIMIT 24
    """)

    result = await db.execute(query)
    buckets = [
        TimeBucket(period=row[0], count=row[1])
        for row in result.fetchall()
    ]

    return TripsOverTimeResponse(buckets=buckets, bucket_type=bucket_type)


async def get_top_cities(db: AsyncSession, limit: int = 10) -> TopCitiesResponse:
    """Get most popular cities by number of trip stops."""
    query = (
        select(
            City.id,
            City.name,
            func.count(Stop.id).label("stop_count"),
        )
        .join(Stop, Stop.city_id == City.id)
        .join(Trip, Trip.id == Stop.trip_id)
        .where(Trip.deleted_at.is_(None))
        .group_by(City.id, City.name)
        .order_by(func.count(Stop.id).desc())
        .limit(limit)
    )

    result = await db.execute(query)
    cities = [
        PopularItem(id=row[0], name=row[1], count=row[2])
        for row in result.fetchall()
    ]

    return TopCitiesResponse(cities=cities)


async def get_top_activities(
    db: AsyncSession, limit: int = 10
) -> TopActivitiesResponse:
    """Get most assigned activities across all trips."""
    from app.catalog.models import Activity

    query = (
        select(
            Activity.id,
            Activity.name,
            func.count(TripActivity.id).label("assignment_count"),
        )
        .join(TripActivity, TripActivity.activity_id == Activity.id)
        .group_by(Activity.id, Activity.name)
        .order_by(func.count(TripActivity.id).desc())
        .limit(limit)
    )

    result = await db.execute(query)
    activities = [
        PopularItem(id=row[0], name=row[1], count=row[2])
        for row in result.fetchall()
    ]

    return TopActivitiesResponse(activities=activities)


async def get_budget_stats(db: AsyncSession) -> BudgetStats:
    """Get aggregate budget statistics across all trips."""
    query = text("""
        WITH trip_totals AS (
            SELECT
                s.trip_id,
                SUM(COALESCE(ta.cost_override, a.cost)) AS trip_total
            FROM trip_activities ta
            JOIN activities a ON ta.activity_id = a.id
            JOIN stops s ON ta.stop_id = s.id
            JOIN trips t ON s.trip_id = t.id
            WHERE t.deleted_at IS NULL
            GROUP BY s.trip_id
        ),
        category_totals AS (
            SELECT
                a.category,
                SUM(COALESCE(ta.cost_override, a.cost)) AS cat_total
            FROM trip_activities ta
            JOIN activities a ON ta.activity_id = a.id
            JOIN stops s ON ta.stop_id = s.id
            JOIN trips t ON s.trip_id = t.id
            WHERE t.deleted_at IS NULL
            GROUP BY a.category
        )
        SELECT
            COALESCE(AVG(trip_total), 0) AS avg_budget,
            COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY trip_total), 0) AS median_budget,
            COALESCE(SUM(trip_total), 0) AS total_potential
        FROM trip_totals
    """)

    result = await db.execute(query)
    row = result.fetchone()

    # Get category distribution separately
    cat_query = text("""
        SELECT
            a.category,
            SUM(COALESCE(ta.cost_override, a.cost)) AS cat_total
        FROM trip_activities ta
        JOIN activities a ON ta.activity_id = a.id
        JOIN stops s ON ta.stop_id = s.id
        JOIN trips t ON s.trip_id = t.id
        WHERE t.deleted_at IS NULL
        GROUP BY a.category
    """)
    cat_result = await db.execute(cat_query)
    category_dist = {r[0]: round(float(r[1]), 2) for r in cat_result.fetchall()}

    return BudgetStats(
        average_trip_budget=round(float(row[0]), 2) if row else 0.0,
        median_trip_budget=round(float(row[1]), 2) if row else 0.0,
        total_revenue_potential=round(float(row[2]), 2) if row else 0.0,
        category_distribution=category_dist,
    )


async def list_users(
    db: AsyncSession, *, page: int = 1, page_size: int = 20
) -> AdminUserListResponse:
    """List all users with their trip counts (admin view)."""
    # Total count
    total = (await db.execute(select(func.count(User.id)))).scalar_one()

    # Users with trip count
    query = (
        select(
            User,
            func.count(Trip.id).filter(Trip.deleted_at.is_(None)).label("trip_count"),
        )
        .outerjoin(Trip, Trip.owner_id == User.id)
        .group_by(User.id)
        .order_by(User.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    result = await db.execute(query)
    items = []
    for row in result.all():
        user, trip_count = row
        items.append(AdminUserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            created_at=user.created_at,
            trip_count=trip_count or 0,
        ))

    return AdminUserListResponse(
        items=items, total=total, page=page, page_size=page_size
    )


async def update_user_role(
    db: AsyncSession, user_id: uuid.UUID, new_role: str
) -> User:
    """Promote or demote a user's role."""
    from app.core.exceptions import BadRequestError, NotFoundError

    if new_role not in ("user", "admin"):
        raise BadRequestError("Role must be 'user' or 'admin'")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise NotFoundError("User")

    user.role = new_role
    await db.flush()
    return user

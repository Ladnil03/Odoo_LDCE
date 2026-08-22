"""Itinerary business logic — assign activities, build grouped views, calendar."""

import uuid
from collections import defaultdict

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.models import User
from app.catalog.models import Activity
from app.core.exceptions import BadRequestError, ForbiddenError, NotFoundError
from app.itinerary.models import TripActivity
from app.itinerary.schemas import (
    AssignActivityRequest,
    CalendarDayEntry,
    DayItinerary,
    FullItineraryResponse,
    StopItinerary,
    TripActivityResponse,
    UpdateTripActivityRequest,
)
from app.stops.models import Stop
from app.trips.models import Trip


async def _verify_trip_ownership(
    db: AsyncSession, trip_id: uuid.UUID, user: User
) -> Trip:
    """Load trip and verify ownership."""
    result = await db.execute(
        select(Trip).where(Trip.id == trip_id, Trip.deleted_at.is_(None))
    )
    trip = result.scalar_one_or_none()
    if trip is None:
        raise NotFoundError("Trip")
    if trip.owner_id != user.id:
        raise ForbiddenError("You do not own this trip")
    return trip


async def _verify_stop_belongs_to_trip(
    db: AsyncSession, stop_id: uuid.UUID, trip_id: uuid.UUID
) -> Stop:
    """Verify that a stop belongs to the given trip."""
    result = await db.execute(
        select(Stop).where(Stop.id == stop_id, Stop.trip_id == trip_id)
    )
    stop = result.scalar_one_or_none()
    if stop is None:
        raise NotFoundError("Stop not found in this trip")
    return stop


# ── Assignment ──

async def assign_activity(
    db: AsyncSession,
    trip_id: uuid.UUID,
    stop_id: uuid.UUID,
    data: AssignActivityRequest,
    user: User,
) -> TripActivity:
    """Assign an activity to a stop within a trip."""
    await _verify_trip_ownership(db, trip_id, user)
    await _verify_stop_belongs_to_trip(db, stop_id, trip_id)

    # Verify activity exists
    act_result = await db.execute(
        select(Activity).where(Activity.id == data.activity_id)
    )
    if act_result.scalar_one_or_none() is None:
        raise NotFoundError("Activity")

    # Get next order_index for this stop
    max_idx = await db.execute(
        select(func.coalesce(func.max(TripActivity.order_index), -1)).where(
            TripActivity.stop_id == stop_id
        )
    )
    next_index = max_idx.scalar_one() + 1

    trip_activity = TripActivity(
        id=uuid.uuid4(),
        stop_id=stop_id,
        activity_id=data.activity_id,
        scheduled_date=data.scheduled_date,
        scheduled_time=data.scheduled_time,
        cost_override=data.cost_override,
        order_index=next_index,
    )
    db.add(trip_activity)
    await db.flush()
    
    # Reload with activity eagerly loaded
    reloaded = await db.execute(
        select(TripActivity)
        .options(selectinload(TripActivity.activity))
        .where(TripActivity.id == trip_activity.id)
    )
    return reloaded.scalar_one()


async def remove_activity(
    db: AsyncSession,
    trip_id: uuid.UUID,
    stop_id: uuid.UUID,
    trip_activity_id: uuid.UUID,
    user: User,
) -> None:
    """Remove an assigned activity from a stop."""
    await _verify_trip_ownership(db, trip_id, user)

    result = await db.execute(
        select(TripActivity).where(
            TripActivity.id == trip_activity_id,
            TripActivity.stop_id == stop_id,
        )
    )
    ta = result.scalar_one_or_none()
    if ta is None:
        raise NotFoundError("Trip activity")

    await db.delete(ta)
    await db.flush()


async def update_trip_activity(
    db: AsyncSession,
    trip_id: uuid.UUID,
    stop_id: uuid.UUID,
    trip_activity_id: uuid.UUID,
    data: UpdateTripActivityRequest,
    user: User,
) -> TripActivity:
    """Update scheduling or cost override for an assigned activity."""
    await _verify_trip_ownership(db, trip_id, user)

    result = await db.execute(
        select(TripActivity)
        .options(selectinload(TripActivity.activity))
        .where(
            TripActivity.id == trip_activity_id,
            TripActivity.stop_id == stop_id,
        )
    )
    ta = result.scalar_one_or_none()
    if ta is None:
        raise NotFoundError("Trip activity")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(ta, field, value)

    await db.flush()
    return ta


# ── Full itinerary ──

async def get_full_itinerary(
    db: AsyncSession, trip_id: uuid.UUID, user: User
) -> FullItineraryResponse:
    """Build the complete itinerary grouped by stop → day → activities.

    Uses selectinload to avoid N+1 queries.
    """
    trip = await _verify_trip_ownership(db, trip_id, user)

    # Load stops with their activities (and activity details) in one query
    stops_result = await db.execute(
        select(Stop)
        .options(
            selectinload(Stop.trip_activities).selectinload(TripActivity.activity),
            selectinload(Stop.city),
        )
        .where(Stop.trip_id == trip_id)
        .order_by(Stop.order_index)
    )
    stops = list(stops_result.scalars().all())

    total_cost = 0.0
    stop_itineraries = []

    for stop in stops:
        # Group activities by scheduled_date
        days_map: dict = defaultdict(list)
        for ta in sorted(stop.trip_activities, key=lambda x: (x.scheduled_date or "", x.order_index)):
            effective_cost = ta.cost_override if ta.cost_override is not None else ta.activity.cost
            ta_response = TripActivityResponse(
                id=ta.id,
                stop_id=ta.stop_id,
                activity_id=ta.activity_id,
                scheduled_date=ta.scheduled_date,
                scheduled_time=ta.scheduled_time,
                cost_override=ta.cost_override,
                order_index=ta.order_index,
                activity={
                    "id": ta.activity.id,
                    "name": ta.activity.name,
                    "category": ta.activity.category,
                    "cost": ta.activity.cost,
                    "duration_minutes": ta.activity.duration_minutes,
                } if ta.activity else None,
            )
            days_map[ta.scheduled_date].append((ta_response, effective_cost))

        days = []
        stop_total = 0.0
        for day_date, items in sorted(days_map.items(), key=lambda x: (x[0] is None, x[0])):
            day_cost = sum(cost for _, cost in items)
            stop_total += day_cost
            days.append(DayItinerary(
                day_date=day_date,
                activities=[item[0] for item in items],
                day_total=round(day_cost, 2),
            ))

        total_cost += stop_total
        city_name = stop.city.name if stop.city else "Unknown"
        city_country = stop.city.country if stop.city else ""

        stop_itineraries.append(StopItinerary(
            stop_id=stop.id,
            city_name=city_name,
            city_country=city_country,
            order_index=stop.order_index,
            arrival_date=stop.arrival_date,
            departure_date=stop.departure_date,
            days=days,
            stop_total=round(stop_total, 2),
        ))

    return FullItineraryResponse(
        trip_id=trip_id,
        trip_name=trip.name,
        stops=stop_itineraries,
        total_cost=round(total_cost, 2),
    )


# ── Calendar view ──

async def get_calendar_view(
    db: AsyncSession, trip_id: uuid.UUID, user: User
) -> dict:
    """Build a date-keyed calendar structure for the trip."""
    trip = await _verify_trip_ownership(db, trip_id, user)

    stops_result = await db.execute(
        select(Stop)
        .options(
            selectinload(Stop.trip_activities).selectinload(TripActivity.activity),
            selectinload(Stop.city),
        )
        .where(Stop.trip_id == trip_id)
        .order_by(Stop.order_index)
    )
    stops = list(stops_result.scalars().all())

    calendar: dict = {}

    for stop in stops:
        city_name = stop.city.name if stop.city else "Unknown"
        for ta in sorted(stop.trip_activities, key=lambda x: (x.scheduled_date or "", x.order_index)):
            if ta.scheduled_date is None:
                continue

            date_key = ta.scheduled_date.isoformat()
            if date_key not in calendar:
                calendar[date_key] = {
                    "city": city_name,
                    "activities": [],
                    "day_total": 0.0,
                }

            effective_cost = ta.cost_override if ta.cost_override is not None else ta.activity.cost
            calendar[date_key]["activities"].append({
                "id": str(ta.id),
                "name": ta.activity.name,
                "time": ta.scheduled_time.isoformat() if ta.scheduled_time else None,
                "cost": effective_cost,
                "category": ta.activity.category,
                "duration_minutes": ta.activity.duration_minutes,
            })
            calendar[date_key]["day_total"] = round(
                calendar[date_key]["day_total"] + effective_cost, 2
            )

    return {"trip_id": str(trip_id), "calendar": calendar}


# ── Reschedule ──

async def reschedule_activity(
    db: AsyncSession,
    trip_activity_id: uuid.UUID,
    new_date=None,
    new_time=None,
    new_order_index=None,
    user: User = None,
) -> TripActivity:
    """Move an activity to a new date/time/order position."""
    result = await db.execute(
        select(TripActivity)
        .options(selectinload(TripActivity.stop), selectinload(TripActivity.activity))
        .where(TripActivity.id == trip_activity_id)
    )
    ta = result.scalar_one_or_none()
    if ta is None:
        raise NotFoundError("Trip activity")

    # Verify ownership through the stop → trip chain
    stop = ta.stop
    trip_result = await db.execute(
        select(Trip).where(Trip.id == stop.trip_id, Trip.deleted_at.is_(None))
    )
    trip = trip_result.scalar_one_or_none()
    if trip is None:
        raise NotFoundError("Trip")
    if user and trip.owner_id != user.id:
        raise ForbiddenError("You do not own this trip")

    if new_date is not None:
        ta.scheduled_date = new_date
    if new_time is not None:
        ta.scheduled_time = new_time
    if new_order_index is not None:
        ta.order_index = new_order_index

    await db.flush()
    return ta

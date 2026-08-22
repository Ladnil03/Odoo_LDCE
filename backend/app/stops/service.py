"""Stop business logic — add, remove, reorder stops within a trip."""

import uuid

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy.orm import selectinload

from app.auth.models import User
from app.core.exceptions import BadRequestError, ForbiddenError, NotFoundError
from app.stops.models import Stop
from app.stops.schemas import StopCreateRequest
from app.trips.models import Trip


async def _get_trip_and_check_owner(
    db: AsyncSession, trip_id: uuid.UUID, user: User
) -> Trip:
    """Fetch a trip and verify ownership."""
    result = await db.execute(
        select(Trip).where(Trip.id == trip_id, Trip.deleted_at.is_(None))
    )
    trip = result.scalar_one_or_none()
    if trip is None:
        raise NotFoundError("Trip")
    if trip.owner_id != user.id:
        raise ForbiddenError("You do not own this trip")
    return trip


async def add_stop(
    db: AsyncSession, trip_id: uuid.UUID, data: StopCreateRequest, user: User
) -> Stop:
    """Add a new stop to the end of a trip's itinerary."""
    await _get_trip_and_check_owner(db, trip_id, user)

    if data.departure_date and data.arrival_date and data.departure_date < data.arrival_date:
        raise BadRequestError("departure_date must be on or after arrival_date")

    # Get the next order_index
    max_idx_result = await db.execute(
        select(func.coalesce(func.max(Stop.order_index), -1)).where(
            Stop.trip_id == trip_id
        )
    )
    next_index = max_idx_result.scalar_one() + 1

    stop = Stop(
        id=uuid.uuid4(),
        trip_id=trip_id,
        city_id=data.city_id,
        order_index=next_index,
        arrival_date=data.arrival_date,
        departure_date=data.departure_date,
    )
    db.add(stop)
    await db.flush()
    
    # Reload with city eagerly loaded
    reloaded = await db.execute(
        select(Stop).options(selectinload(Stop.city)).where(Stop.id == stop.id)
    )
    return reloaded.scalar_one()


async def list_stops(
    db: AsyncSession, trip_id: uuid.UUID, user: User
) -> list[Stop]:
    """List all stops for a trip, ordered by order_index."""
    await _get_trip_and_check_owner(db, trip_id, user)

    result = await db.execute(
        select(Stop)
        .options(selectinload(Stop.city))
        .where(Stop.trip_id == trip_id)
        .order_by(Stop.order_index)
    )
    return list(result.scalars().all())


async def remove_stop(
    db: AsyncSession, trip_id: uuid.UUID, stop_id: uuid.UUID, user: User
) -> None:
    """Remove a stop and re-compact order_index values."""
    await _get_trip_and_check_owner(db, trip_id, user)

    result = await db.execute(
        select(Stop).where(Stop.id == stop_id, Stop.trip_id == trip_id)
    )
    stop = result.scalar_one_or_none()
    if stop is None:
        raise NotFoundError("Stop")

    await db.delete(stop)
    await db.flush()

    # Re-compact order_index values
    remaining = await db.execute(
        select(Stop)
        .where(Stop.trip_id == trip_id)
        .order_by(Stop.order_index)
    )
    for idx, s in enumerate(remaining.scalars().all()):
        s.order_index = idx

    await db.flush()


async def reorder_stops(
    db: AsyncSession, trip_id: uuid.UUID, ordered_ids: list[uuid.UUID], user: User
) -> list[Stop]:
    """Reorder stops within a trip using the provided ID sequence.

    Validates that all stop IDs belong to the trip and the list is complete.
    Updates order_index atomically within the current transaction.
    """
    await _get_trip_and_check_owner(db, trip_id, user)

    # Fetch all existing stops for this trip
    result = await db.execute(
        select(Stop).options(selectinload(Stop.city)).where(Stop.trip_id == trip_id)
    )
    stops_by_id = {s.id: s for s in result.scalars().all()}

    # Validate completeness
    existing_ids = set(stops_by_id.keys())
    provided_ids = set(ordered_ids)

    if existing_ids != provided_ids:
        missing = existing_ids - provided_ids
        extra = provided_ids - existing_ids
        parts = []
        if missing:
            parts.append(f"missing: {[str(i) for i in missing]}")
        if extra:
            parts.append(f"unknown: {[str(i) for i in extra]}")
        raise BadRequestError(f"Stop ID list mismatch — {', '.join(parts)}")

    # Apply new order
    for new_index, stop_id in enumerate(ordered_ids):
        stops_by_id[stop_id].order_index = new_index

    await db.flush()

    # Return in new order
    return [stops_by_id[sid] for sid in ordered_ids]

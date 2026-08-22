"""Trip business logic — CRUD, sharing, copy-trip."""

import uuid
from datetime import datetime, timezone

from nanoid import generate as nanoid
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.models import User
from app.core.exceptions import BadRequestError, ForbiddenError, NotFoundError
from app.trips.models import Trip, TripCopy, TripShare
from app.trips.schemas import TripCreateRequest, TripUpdateRequest


# ── Helpers ──

async def _get_trip_or_404(
    db: AsyncSession, trip_id: uuid.UUID, *, include_deleted: bool = False
) -> Trip:
    """Fetch a trip by ID, excluding soft-deleted by default."""
    stmt = select(Trip).options(selectinload(Trip.stops)).where(Trip.id == trip_id)
    if not include_deleted:
        stmt = stmt.where(Trip.deleted_at.is_(None))
    result = await db.execute(stmt)
    trip = result.scalar_one_or_none()
    if trip is None:
        raise NotFoundError("Trip")
    return trip


def _check_ownership(trip: Trip, user: User) -> None:
    """Raise ForbiddenError if the user is not the trip owner."""
    if trip.owner_id != user.id:
        raise ForbiddenError("You do not own this trip")


# ── CRUD ──

async def create_trip(
    db: AsyncSession, data: TripCreateRequest, owner: User
) -> Trip:
    """Create a new trip owned by the given user."""
    if data.end_date and data.start_date and data.end_date < data.start_date:
        raise BadRequestError("end_date must be on or after start_date")

    trip = Trip(
        id=uuid.uuid4(),
        owner_id=owner.id,
        name=data.name,
        start_date=data.start_date,
        end_date=data.end_date,
        description=data.description,
        daily_budget=data.daily_budget,
        base_currency=data.base_currency,
    )
    trip.stops = []
    db.add(trip)
    await db.flush()
    return trip


async def list_user_trips(
    db: AsyncSession, user: User, *, page: int = 1, page_size: int = 20
) -> tuple[list[Trip], int]:
    """List trips owned by the user (paginated, excludes soft-deleted)."""
    base = select(Trip).where(
        Trip.owner_id == user.id, Trip.deleted_at.is_(None)
    )

    # Total count
    count_result = await db.execute(
        select(func.count()).select_from(base.subquery())
    )
    total = count_result.scalar_one()

    # Paginated results
    stmt = (
        base.options(selectinload(Trip.stops))
        .order_by(Trip.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    result = await db.execute(stmt)
    trips = list(result.scalars().all())

    return trips, total


async def get_trip_detail(
    db: AsyncSession, trip_id: uuid.UUID, user: User
) -> Trip:
    """Get a single trip with stops. Checks ownership."""
    trip = await _get_trip_or_404(db, trip_id)
    _check_ownership(trip, user)
    return trip


async def update_trip(
    db: AsyncSession, trip_id: uuid.UUID, data: TripUpdateRequest, user: User
) -> Trip:
    """Update mutable trip fields. Checks ownership."""
    trip = await _get_trip_or_404(db, trip_id)
    _check_ownership(trip, user)

    update_data = data.model_dump(exclude_unset=True)

    # Validate dates if both are being set
    start = update_data.get("start_date", trip.start_date)
    end = update_data.get("end_date", trip.end_date)
    if start and end and end < start:
        raise BadRequestError("end_date must be on or after start_date")

    for field, value in update_data.items():
        setattr(trip, field, value)

    await db.flush()
    return trip


async def soft_delete_trip(
    db: AsyncSession, trip_id: uuid.UUID, user: User
) -> None:
    """Soft-delete a trip by setting deleted_at timestamp."""
    trip = await _get_trip_or_404(db, trip_id)
    _check_ownership(trip, user)
    trip.deleted_at = datetime.now(timezone.utc)
    await db.flush()


# ── Sharing ──

async def share_trip(db: AsyncSession, trip_id: uuid.UUID, user: User) -> str:
    """Make a trip public and generate a share slug. Returns the slug."""
    trip = await _get_trip_or_404(db, trip_id)
    _check_ownership(trip, user)

    if not trip.share_slug:
        trip.share_slug = nanoid(size=12)
    trip.is_public = True
    await db.flush()
    return trip.share_slug


async def unshare_trip(
    db: AsyncSession, trip_id: uuid.UUID, user: User
) -> None:
    """Revoke public sharing of a trip."""
    trip = await _get_trip_or_404(db, trip_id)
    _check_ownership(trip, user)
    trip.is_public = False
    # Keep the slug so re-sharing uses the same URL
    await db.flush()


async def get_public_trip(db: AsyncSession, slug: str) -> Trip:
    """Fetch a publicly shared trip by its slug (read-only, no auth)."""
    stmt = (
        select(Trip)
        .options(selectinload(Trip.stops))
        .where(Trip.share_slug == slug, Trip.is_public.is_(True), Trip.deleted_at.is_(None))
    )
    result = await db.execute(stmt)
    trip = result.scalar_one_or_none()
    if trip is None:
        raise NotFoundError("Shared trip not found or is no longer public")
    return trip


# ── Copy Trip ──

async def copy_trip(
    db: AsyncSession, trip_id: uuid.UUID, user: User
) -> Trip:
    """Deep-clone a public trip (trip + stops + trip_activities) for the requesting user.

    The original trip must be public OR owned by the user.
    """
    from app.stops.models import Stop
    from app.itinerary.models import TripActivity

    original = await _get_trip_or_404(db, trip_id)

    # Must be public or owned by the user
    if not original.is_public and original.owner_id != user.id:
        raise ForbiddenError("This trip is not available for copying")

    # 1. Clone trip
    new_trip_id = uuid.uuid4()
    new_trip = Trip(
        id=new_trip_id,
        owner_id=user.id,
        name=f"{original.name} (copy)",
        start_date=original.start_date,
        end_date=original.end_date,
        description=original.description,
        daily_budget=original.daily_budget,
        base_currency=original.base_currency,
        is_public=False,
        share_slug=None,
    )
    db.add(new_trip)

    # 2. Clone stops & build old→new ID mapping
    stop_result = await db.execute(
        select(Stop).where(Stop.trip_id == trip_id).order_by(Stop.order_index)
    )
    old_stops = list(stop_result.scalars().all())
    stop_id_map: dict[uuid.UUID, uuid.UUID] = {}

    for old_stop in old_stops:
        new_stop_id = uuid.uuid4()
        stop_id_map[old_stop.id] = new_stop_id
        db.add(
            Stop(
                id=new_stop_id,
                trip_id=new_trip_id,
                city_id=old_stop.city_id,
                order_index=old_stop.order_index,
                arrival_date=old_stop.arrival_date,
                departure_date=old_stop.departure_date,
            )
        )

    # 3. Clone trip_activities (remap stop IDs)
    if stop_id_map:
        ta_result = await db.execute(
            select(TripActivity).where(
                TripActivity.stop_id.in_(list(stop_id_map.keys()))
            )
        )
        for old_ta in ta_result.scalars().all():
            db.add(
                TripActivity(
                    id=uuid.uuid4(),
                    stop_id=stop_id_map[old_ta.stop_id],
                    activity_id=old_ta.activity_id,
                    scheduled_date=old_ta.scheduled_date,
                    scheduled_time=old_ta.scheduled_time,
                    cost_override=old_ta.cost_override,
                    order_index=old_ta.order_index,
                )
            )

    # 4. Audit record
    db.add(
        TripCopy(
            id=uuid.uuid4(),
            original_trip_id=trip_id,
            copied_trip_id=new_trip_id,
            copied_by=user.id,
        )
    )

    await db.flush()
    return new_trip

"""Itinerary API endpoints — assign/remove/update activities, full itinerary, calendar."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.auth.dependencies import get_current_user
from app.auth.models import User
from app.core.database import get_db
from app.core.exceptions import NotFoundError
from app.itinerary.models import TripActivity
from app.itinerary.schemas import (
    AssignActivityRequest,
    CalendarResponse,
    FullItineraryResponse,
    RescheduleRequest,
    TripActivityResponse,
    UpdateTripActivityRequest,
)
from app.itinerary.service import (
    assign_activity,
    get_calendar_view,
    get_full_itinerary,
    remove_activity,
    reschedule_activity,
    update_trip_activity,
)

router = APIRouter(tags=["Itinerary"])


@router.get(
    "/trips/{trip_id}/itinerary",
    response_model=FullItineraryResponse,
)
async def get_itinerary_endpoint(
    trip_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> FullItineraryResponse:
    """Get the full trip itinerary grouped by stop → day → activities."""
    return await get_full_itinerary(db, trip_id, user)


@router.post(
    "/trips/{trip_id}/stops/{stop_id}/activities",
    response_model=TripActivityResponse,
    status_code=201,
)
async def assign_activity_endpoint(
    trip_id: uuid.UUID,
    stop_id: uuid.UUID,
    data: AssignActivityRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> TripActivityResponse:
    """Assign an activity to a stop."""
    ta = await assign_activity(db, trip_id, stop_id, data, user)
    return TripActivityResponse.model_validate(ta)


@router.delete(
    "/trips/{trip_id}/stops/{stop_id}/activities/{trip_activity_id}",
    status_code=204,
)
@router.delete(
    "/trips/{trip_id}/itinerary/activities/{trip_activity_id}",
    status_code=204,
)
async def remove_activity_endpoint(
    trip_id: uuid.UUID,
    trip_activity_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
    stop_id: uuid.UUID | None = None,
) -> None:
    """Remove an assigned activity from a stop or by ID directly."""
    if stop_id is None:
        ta_res = await db.execute(select(TripActivity).where(TripActivity.id == trip_activity_id))
        ta = ta_res.scalar_one_or_none()
        if ta is None:
            raise NotFoundError("Trip activity")
        stop_id = ta.stop_id

    await remove_activity(db, trip_id, stop_id, trip_activity_id, user)


@router.patch(
    "/trips/{trip_id}/stops/{stop_id}/activities/{trip_activity_id}",
    response_model=TripActivityResponse,
)
async def update_activity_endpoint(
    trip_id: uuid.UUID,
    stop_id: uuid.UUID,
    trip_activity_id: uuid.UUID,
    data: UpdateTripActivityRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> TripActivityResponse:
    """Update scheduling or cost override for an assigned activity."""
    ta = await update_trip_activity(db, trip_id, stop_id, trip_activity_id, data, user)
    return TripActivityResponse.model_validate(ta)


# ── Calendar ──

@router.get("/trips/{trip_id}/calendar")
@router.get("/trips/{trip_id}/itinerary/calendar")
async def get_calendar_endpoint(
    trip_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> dict:
    """Get date-keyed itinerary for calendar rendering."""
    return await get_calendar_view(db, trip_id, user)


# ── Reschedule ──

@router.patch(
    "/trip-activities/{trip_activity_id}/reschedule",
    response_model=TripActivityResponse,
)
async def reschedule_endpoint(
    trip_activity_id: uuid.UUID,
    data: RescheduleRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> TripActivityResponse:
    """Move an activity to a new date/time/order position."""
    ta = await reschedule_activity(
        db, trip_activity_id,
        new_date=data.new_date,
        new_time=data.new_time,
        new_order_index=data.new_order_index,
        user=user,
    )
    return TripActivityResponse.model_validate(ta)

"""Stop API endpoints — add, list, remove, reorder."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.auth.models import User
from app.core.database import get_db
from app.stops.schemas import StopCreateRequest, StopReorderRequest, StopResponse
from app.stops.service import add_stop, list_stops, remove_stop, reorder_stops

router = APIRouter(prefix="/trips/{trip_id}/stops", tags=["Stops"])


@router.post("", response_model=StopResponse, status_code=201)
async def add_stop_endpoint(
    trip_id: uuid.UUID,
    data: StopCreateRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> StopResponse:
    """Add a stop to a trip."""
    stop = await add_stop(db, trip_id, data, user)
    return StopResponse.model_validate(stop)


@router.get("", response_model=list[StopResponse])
async def list_stops_endpoint(
    trip_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> list[StopResponse]:
    """List all stops in a trip, ordered by itinerary position."""
    stops = await list_stops(db, trip_id, user)
    return [StopResponse.model_validate(s) for s in stops]


@router.delete("/{stop_id}", status_code=204)
async def remove_stop_endpoint(
    trip_id: uuid.UUID,
    stop_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> None:
    """Remove a stop from a trip."""
    await remove_stop(db, trip_id, stop_id, user)


@router.put("/reorder", response_model=list[StopResponse])
@router.patch("/reorder", response_model=list[StopResponse])
async def reorder_stops_endpoint(
    trip_id: uuid.UUID,
    data: StopReorderRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> list[StopResponse]:
    """Reorder stops within a trip by providing the complete ID sequence."""
    stops = await reorder_stops(db, trip_id, data.ordered_ids, user)
    return [StopResponse.model_validate(s) for s in stops]

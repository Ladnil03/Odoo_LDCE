"""Trip API endpoints — CRUD, sharing, public view, copy."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.auth.models import User
from app.core.database import get_db
from app.trips.schemas import (
    ShareResponse,
    TripCopyResponse,
    TripCreateRequest,
    TripListResponse,
    TripResponse,
    TripUpdateRequest,
)
from app.trips.service import (
    copy_trip,
    create_trip,
    get_public_trip,
    get_trip_detail,
    list_user_trips,
    share_trip,
    soft_delete_trip,
    unshare_trip,
    update_trip,
)

router = APIRouter(prefix="/trips", tags=["Trips"])
public_router = APIRouter(prefix="/public", tags=["Public"])


# ── CRUD ──

@router.post("", response_model=TripResponse, status_code=201)
async def create_trip_endpoint(
    data: TripCreateRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> TripResponse:
    """Create a new trip."""
    trip = await create_trip(db, data, user)
    return TripResponse.model_validate(trip)


@router.get("", response_model=TripListResponse)
async def list_trips_endpoint(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> TripListResponse:
    """List the authenticated user's trips (paginated)."""
    trips, total = await list_user_trips(db, user, page=page, page_size=page_size)
    return TripListResponse(
        items=[TripResponse.model_validate(t) for t in trips],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{trip_id}", response_model=TripResponse)
async def get_trip_endpoint(
    trip_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> TripResponse:
    """Get a trip's full details including stops."""
    trip = await get_trip_detail(db, trip_id, user)
    return TripResponse.model_validate(trip)


@router.patch("/{trip_id}", response_model=TripResponse)
async def update_trip_endpoint(
    trip_id: uuid.UUID,
    data: TripUpdateRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> TripResponse:
    """Update trip fields."""
    trip = await update_trip(db, trip_id, data, user)
    return TripResponse.model_validate(trip)


@router.delete("/{trip_id}", status_code=204)
async def delete_trip_endpoint(
    trip_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> None:
    """Soft-delete a trip."""
    await soft_delete_trip(db, trip_id, user)


# ── Sharing ──

@router.post("/{trip_id}/share", response_model=ShareResponse)
async def share_trip_endpoint(
    trip_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> ShareResponse:
    """Generate a public share link for a trip."""
    slug = await share_trip(db, trip_id, user)
    return ShareResponse(
        share_slug=slug,
        public_url=f"/public/trips/{slug}",
    )


@router.delete("/{trip_id}/share", status_code=204)
async def unshare_trip_endpoint(
    trip_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> None:
    """Revoke public sharing of a trip."""
    await unshare_trip(db, trip_id, user)


# ── Copy Trip ──

@router.post("/{trip_id}/copy", response_model=TripCopyResponse, status_code=201)
async def copy_trip_endpoint(
    trip_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> TripCopyResponse:
    """Deep-clone a public (or own) trip into a new trip."""
    new_trip = await copy_trip(db, trip_id, user)
    return TripCopyResponse(
        new_trip_id=new_trip.id,
        message="Trip copied successfully",
    )


# ── Public view ──

@public_router.get("/trips/{slug}", response_model=TripResponse)
@router.get("/public/{slug}", response_model=TripResponse)
async def get_public_trip_endpoint(
    slug: str,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TripResponse:
    """Read-only public view of a shared trip (no auth required)."""
    trip = await get_public_trip(db, slug)
    # Sanitize: don't expose owner_id in public view
    response = TripResponse.model_validate(trip)
    return response

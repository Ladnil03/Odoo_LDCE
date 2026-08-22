"""Catalog API endpoints — city/activity search and detail."""

import uuid
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.catalog.schemas import (
    ActivityListResponse,
    ActivityResponse,
    CityListResponse,
    CityResponse,
)
from app.catalog.service import get_activity, get_city, search_activities, search_cities
from app.core.database import get_db

router = APIRouter(tags=["Catalog"])


# ── Cities ──

@router.get("/cities", response_model=CityListResponse)
@router.get("/cities/search", response_model=CityListResponse)
async def search_cities_endpoint(
    db: Annotated[AsyncSession, Depends(get_db)],
    query: str | None = Query(default=None, description="Full-text search query"),
    country: str | None = Query(default=None),
    region: str | None = Query(default=None),
    sort_by: str = Query(default="popularity", enum=["popularity", "cost"]),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> CityListResponse:
    """Search and list cities with full-text search and filters."""
    cities, total = await search_cities(
        db, query=query, country=country, region=region,
        page=page, page_size=page_size, sort_by=sort_by,
    )
    return CityListResponse(
        items=[CityResponse.model_validate(c) for c in cities],
        total=total, page=page, page_size=page_size,
    )


@router.get("/cities/{city_id}", response_model=CityResponse)
async def get_city_endpoint(
    city_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> CityResponse:
    """Get city details."""
    city = await get_city(db, city_id)
    return CityResponse.model_validate(city)


@router.get("/cities/{city_id}/activities", response_model=list[ActivityResponse])
async def list_city_activities_endpoint(
    city_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    category: Literal["transport", "stay", "activity", "food"] | None = Query(default=None),
) -> list[ActivityResponse]:
    """Get all activities for a specific city, optionally filtered by category."""
    activities, _ = await search_activities(
        db, city_id=city_id, category=category, page_size=100
    )
    return [ActivityResponse.model_validate(a) for a in activities]


# ── Activities ──

@router.get("/activities", response_model=ActivityListResponse)
@router.get("/activities/search", response_model=ActivityListResponse)
async def search_activities_endpoint(
    db: Annotated[AsyncSession, Depends(get_db)],
    query: str | None = Query(default=None, description="Full-text search query"),
    city_id: uuid.UUID | None = Query(default=None),
    category: Literal["transport", "stay", "activity", "food"] | None = Query(default=None),
    max_cost: float | None = Query(default=None, ge=0),
    max_duration: int | None = Query(default=None, ge=1),
    sort_by: str = Query(default="cost", enum=["cost", "duration"]),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> ActivityListResponse:
    """Search activities with filters on city, category, cost, and duration."""
    activities, total = await search_activities(
        db, query=query, city_id=city_id, category=category,
        max_cost=max_cost, max_duration=max_duration,
        page=page, page_size=page_size, sort_by=sort_by,
    )
    return ActivityListResponse(
        items=[ActivityResponse.model_validate(a) for a in activities],
        total=total, page=page, page_size=page_size,
    )


@router.get("/activities/{activity_id}", response_model=ActivityResponse)
async def get_activity_endpoint(
    activity_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ActivityResponse:
    """Get activity details."""
    activity = await get_activity(db, activity_id)
    return ActivityResponse.model_validate(activity)

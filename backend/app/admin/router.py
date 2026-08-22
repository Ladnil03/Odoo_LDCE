"""Admin API endpoints — analytics and user management (role-gated)."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.admin.schemas import (
    AdminUserListResponse,
    BudgetStats,
    OverviewStats,
    TopActivitiesResponse,
    TopCitiesResponse,
    TripsOverTimeResponse,
)
from app.admin.service import (
    get_budget_stats,
    get_overview,
    get_top_activities,
    get_top_cities,
    get_trips_over_time,
    list_users,
    update_user_role,
)
from app.auth.dependencies import require_admin
from app.auth.models import User
from app.auth.schemas import UserResponse
from app.core.database import get_db

router = APIRouter(prefix="/admin", tags=["Admin"])


class RoleUpdateRequest(BaseModel):
    """Request to update a user's role."""
    role: str


# ── Analytics ──

@router.get("/analytics/overview", response_model=OverviewStats)
async def overview_endpoint(
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[User, Depends(require_admin)],
) -> OverviewStats:
    """Platform overview: total users, trips, activities, cities."""
    return await get_overview(db)


@router.get("/analytics/trips-over-time", response_model=TripsOverTimeResponse)
async def trips_over_time_endpoint(
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[User, Depends(require_admin)],
    bucket: str = Query(default="week", enum=["week", "month"]),
) -> TripsOverTimeResponse:
    """Trips created over time, bucketed by week or month."""
    return await get_trips_over_time(db, bucket_type=bucket)


@router.get("/analytics/top-cities", response_model=TopCitiesResponse)
async def top_cities_endpoint(
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[User, Depends(require_admin)],
    limit: int = Query(default=10, ge=1, le=50),
) -> TopCitiesResponse:
    """Most popular cities by trip inclusion count."""
    return await get_top_cities(db, limit=limit)


@router.get("/analytics/top-activities", response_model=TopActivitiesResponse)
async def top_activities_endpoint(
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[User, Depends(require_admin)],
    limit: int = Query(default=10, ge=1, le=50),
) -> TopActivitiesResponse:
    """Most assigned activities across all trips."""
    return await get_top_activities(db, limit=limit)


@router.get("/analytics/budget-stats", response_model=BudgetStats)
async def budget_stats_endpoint(
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[User, Depends(require_admin)],
) -> BudgetStats:
    """Aggregate budget statistics across all trips."""
    return await get_budget_stats(db)


# ── User management ──

@router.get("/users", response_model=AdminUserListResponse)
async def list_users_endpoint(
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[User, Depends(require_admin)],
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> AdminUserListResponse:
    """List all users with trip counts."""
    return await list_users(db, page=page, page_size=page_size)


@router.patch("/users/{user_id}/role", response_model=UserResponse)
async def update_role_endpoint(
    user_id: uuid.UUID,
    data: RoleUpdateRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[User, Depends(require_admin)],
) -> UserResponse:
    """Promote or demote a user's role."""
    user = await update_user_role(db, user_id, data.role)
    return UserResponse.model_validate(user)

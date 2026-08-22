"""Budget API endpoints — full breakdown, daily, and category views."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.auth.models import User
from app.budget.schemas import BudgetResponse, CategoryBudgetResponse, DailyBudgetResponse
from app.budget.service import get_category_budget, get_daily_budget, get_full_budget
from app.core.database import get_db

router = APIRouter(prefix="/trips/{trip_id}/budget", tags=["Budget"])


@router.get("", response_model=BudgetResponse)
async def get_budget_endpoint(
    trip_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> BudgetResponse:
    """Get the full budget breakdown for a trip."""
    return await get_full_budget(db, trip_id, user)


@router.get("/daily", response_model=DailyBudgetResponse)
async def get_daily_budget_endpoint(
    trip_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> DailyBudgetResponse:
    """Get per-day budget with overbudget flags."""
    return await get_daily_budget(db, trip_id, user)


@router.get("/category", response_model=CategoryBudgetResponse)
async def get_category_budget_endpoint(
    trip_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> CategoryBudgetResponse:
    """Get budget breakdown by category (transport/stay/activity/food)."""
    return await get_category_budget(db, trip_id, user)

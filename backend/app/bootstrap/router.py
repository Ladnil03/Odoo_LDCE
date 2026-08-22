"""Bootstrap endpoints — let the frontend ask 'is this DB empty? if so seed it'."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.bootstrap.schemas import BootstrapResult, BootstrapStatus
from app.bootstrap.service import get_status, run_bootstrap
from app.core.database import get_db

router = APIRouter(prefix="/bootstrap", tags=["Bootstrap"])


@router.get("/status", response_model=BootstrapStatus)
async def status_endpoint(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> BootstrapStatus:
    """Return current row counts so the frontend can decide whether to bootstrap."""
    s = await get_status(db)
    needs_bootstrap = (
        s["cities"] == 0
        or s["activities"] == 0
        or s["users"] == 0
        or s["trips"] == 0
        or s["community_posts"] == 0
    )
    return BootstrapStatus(needs_bootstrap=needs_bootstrap, **s)


@router.post("/run", response_model=BootstrapResult)
async def run_endpoint(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> BootstrapResult:
    """Idempotently seed the database with demo cities, activities, users, trips, and posts."""
    counts = await run_bootstrap(db)
    await db.commit()
    return BootstrapResult(
        ok=True,
        message="Bootstrap completed (idempotent — existing rows were preserved).",
        **counts,
    )

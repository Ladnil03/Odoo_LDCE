"""Async SQLAlchemy engine, session factory, and Base model for Neon DB."""

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

# ── Engine ──
# Neon requires SSL; the connection string already includes ?sslmode=require
# SQLite doesn't support pool_size/max_overflow, so conditionally set kwargs
_engine_kwargs: dict = {"echo": settings.DEBUG}
if "sqlite" not in settings.async_database_url:
    _engine_kwargs.update(
        pool_pre_ping=True,
        pool_size=2,
        max_overflow=3,
        pool_recycle=300,
        pool_timeout=30,
    )

engine = create_async_engine(settings.async_database_url, **_engine_kwargs)

# ── Session factory ──
async_session = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# ── Declarative base ──
class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""
    pass


# ── Dependency ──
async def get_db() -> AsyncSession:  # type: ignore[misc]
    """FastAPI dependency that yields an async database session.

    The session is automatically closed after the request completes.
    """
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise

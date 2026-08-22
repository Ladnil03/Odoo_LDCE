"""Shared test fixtures — test database, async client, auth helpers."""

import uuid
from pathlib import Path
from typing import AsyncGenerator

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.dialects.postgresql import TSVECTOR
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.pool import NullPool
from sqlalchemy.schema import Computed

# ── SQLite compatibility for PostgreSQL specific types during unit tests ──
@compiles(TSVECTOR, "sqlite")
def _compile_tsvector_sqlite(type_, compiler, **kw):
    return "TEXT"

@compiles(Computed, "sqlite")
def _compile_computed_sqlite(element, compiler, **kw):
    return ""

from app.core.database import Base, get_db
from app.core.security import hash_password

# ── Ensure all models are registered in Base.metadata ──
from app.auth.models import User  # noqa: F401
from app.trips.models import Trip, TripShare, TripCopy  # noqa: F401
from app.stops.models import Stop  # noqa: F401
from app.catalog.models import City, Activity  # noqa: F401
from app.itinerary.models import TripActivity  # noqa: F401

TEST_DB_PATH = Path("./test.db")
TEST_DATABASE_URL = f"sqlite+aiosqlite:///{TEST_DB_PATH.as_posix()}"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    poolclass=NullPool,
    connect_args={"timeout": 30},
)
test_session_factory = async_sessionmaker(
    bind=test_engine, class_=AsyncSession, expire_on_commit=False
)


@pytest_asyncio.fixture(scope="session", autouse=True)
async def init_test_db():
    """Ensure database file is initialized once at session startup."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    if TEST_DB_PATH.exists():
        try:
            TEST_DB_PATH.unlink(missing_ok=True)
        except OSError:
            pass


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Provide a clean database session for each test.

    Creates all tables before the test and drops them after.
    """
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with test_session_factory() as session:
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Provide an async HTTP client with the test DB session injected."""
    from app.main import app

    async def override_get_db():
        async with test_session_factory() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest_asyncio.fixture(scope="function")
async def test_user(db_session: AsyncSession) -> dict:
    """Create a test user and return their details + token."""
    from app.auth.models import User
    from app.auth.service import generate_tokens

    user = User(
        id=uuid.uuid4(),
        email="test@example.com",
        password_hash=hash_password("testpass123"),
        name="Test User",
        role="user",
    )
    db_session.add(user)
    await db_session.commit()

    tokens = generate_tokens(user)
    return {
        "user": user,
        "id": user.id,
        "email": user.email,
        "tokens": tokens,
        "auth_header": {"Authorization": f"Bearer {tokens['access_token']}"},
    }


@pytest_asyncio.fixture(scope="function")
async def second_user(db_session: AsyncSession) -> dict:
    """Create a second distinct user for authorization and IDOR tests."""
    from app.auth.models import User
    from app.auth.service import generate_tokens

    user = User(
        id=uuid.uuid4(),
        email="user2@example.com",
        password_hash=hash_password("user2pass123"),
        name="Second User",
        role="user",
    )
    db_session.add(user)
    await db_session.commit()

    tokens = generate_tokens(user)
    return {
        "user": user,
        "id": user.id,
        "email": user.email,
        "tokens": tokens,
        "auth_header": {"Authorization": f"Bearer {tokens['access_token']}"},
    }


@pytest_asyncio.fixture(scope="function")
async def admin_user(db_session: AsyncSession) -> dict:
    """Create an admin user and return their details + token."""
    from app.auth.models import User
    from app.auth.service import generate_tokens

    user = User(
        id=uuid.uuid4(),
        email="admin@example.com",
        password_hash=hash_password("adminpass123"),
        name="Admin User",
        role="admin",
    )
    db_session.add(user)
    await db_session.commit()

    tokens = generate_tokens(user)
    return {
        "user": user,
        "id": user.id,
        "email": user.email,
        "tokens": tokens,
        "auth_header": {"Authorization": f"Bearer {tokens['access_token']}"},
    }

"""Tests for catalog endpoints — city search, city list, activities list."""

import uuid

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.catalog.models import Activity, City


async def _seed_test_catalog(db_session: AsyncSession) -> tuple[uuid.UUID, uuid.UUID]:
    """Helper to seed cities and activities for catalog tests."""
    tokyo_id = uuid.uuid4()
    tokyo = City(
        id=tokyo_id,
        name="Tokyo",
        country="Japan",
        region="East Asia",
        cost_index=1.3,
        popularity_score=95,
        lat=35.6762,
        lng=139.6503,
    )
    paris_id = uuid.uuid4()
    paris = City(
        id=paris_id,
        name="Paris",
        country="France",
        region="Western Europe",
        cost_index=1.4,
        popularity_score=97,
        lat=48.8566,
        lng=2.3522,
    )
    db_session.add_all([tokyo, paris])
    await db_session.flush()

    act1 = Activity(
        id=uuid.uuid4(),
        city_id=tokyo_id,
        name="Senso-ji Temple",
        category="activity",
        cost=0.0,
        duration_minutes=90,
        description="Historic temple in Asakusa",
    )
    act2 = Activity(
        id=uuid.uuid4(),
        city_id=tokyo_id,
        name="Ramen Tasting",
        category="food",
        cost=15.0,
        duration_minutes=45,
        description="Delicious tonkotsu ramen",
    )
    act3 = Activity(
        id=uuid.uuid4(),
        city_id=paris_id,
        name="Eiffel Tower Tour",
        category="activity",
        cost=26.0,
        duration_minutes=120,
        description="Iconic iron tower visit",
    )
    db_session.add_all([act1, act2, act3])
    await db_session.commit()
    return tokyo_id, paris_id


@pytest.mark.asyncio
class TestCatalog:
    async def test_list_cities(self, client: AsyncClient, db_session: AsyncSession):
        await _seed_test_catalog(db_session)

        response = await client.get("/cities")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 2
        assert len(data["items"]) == 2

    async def test_filter_cities_by_country(self, client: AsyncClient, db_session: AsyncSession):
        await _seed_test_catalog(db_session)

        response = await client.get("/cities?country=Japan")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["items"][0]["name"] == "Tokyo"

    async def test_get_city_detail(self, client: AsyncClient, db_session: AsyncSession):
        tokyo_id, _ = await _seed_test_catalog(db_session)

        response = await client.get(f"/cities/{tokyo_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Tokyo"
        assert data["country"] == "Japan"

    async def test_list_activities_for_city(self, client: AsyncClient, db_session: AsyncSession):
        tokyo_id, _ = await _seed_test_catalog(db_session)

        response = await client.get(f"/cities/{tokyo_id}/activities")
        assert response.status_code == 200
        activities = response.json()
        assert len(activities) == 2

    async def test_filter_activities_by_category(self, client: AsyncClient, db_session: AsyncSession):
        tokyo_id, _ = await _seed_test_catalog(db_session)

        response = await client.get(f"/cities/{tokyo_id}/activities?category=food")
        assert response.status_code == 200
        activities = response.json()
        assert len(activities) == 1
        assert activities[0]["name"] == "Ramen Tasting"

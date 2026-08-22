"""Tests for budget engine endpoints — full breakdown, daily, and category views."""

import uuid

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.catalog.models import Activity, City


async def _setup_budget_test_data(
    client: AsyncClient, test_user: dict, db_session: AsyncSession
) -> str:
    """Setup a trip with multiple stops and categorized activities for budget testing."""
    tokyo_id = uuid.uuid4()
    tokyo = City(
        id=tokyo_id,
        name="Tokyo",
        country="Japan",
        cost_index=1.0,
        popularity_score=90,
        lat=35.6762,
        lng=139.6503,
    )
    hotel_act = Activity(
        id=uuid.uuid4(),
        city_id=tokyo_id,
        name="Hotel Night",
        category="stay",
        cost=120.0,
        duration_minutes=1440,
    )
    ramen_act = Activity(
        id=uuid.uuid4(),
        city_id=tokyo_id,
        name="Ramen",
        category="food",
        cost=15.0,
        duration_minutes=45,
    )
    temple_act = Activity(
        id=uuid.uuid4(),
        city_id=tokyo_id,
        name="Temple",
        category="activity",
        cost=10.0,
        duration_minutes=90,
    )
    train_act = Activity(
        id=uuid.uuid4(),
        city_id=tokyo_id,
        name="Metro Day Pass",
        category="transport",
        cost=8.0,
        duration_minutes=1440,
    )
    db_session.add_all([tokyo, hotel_act, ramen_act, temple_act, train_act])
    await db_session.commit()

    # Create trip with $100/day budget
    trip_resp = await client.post("/trips", json={
        "name": "Budget Test Trip",
        "start_date": "2026-11-01",
        "end_date": "2026-11-03",
        "daily_budget": 100.0,
    }, headers=test_user["auth_header"])
    trip_id = trip_resp.json()["id"]

    # Add stop
    stop_resp = await client.post(f"/trips/{trip_id}/stops", json={
        "city_id": str(tokyo_id),
    }, headers=test_user["auth_header"])
    stop_id = stop_resp.json()["id"]

    # Assign activities across different dates
    for act, date_str in [
        (hotel_act, "2026-11-01"),
        (ramen_act, "2026-11-01"),  # Total Day 1: 120 + 15 = 135 (overbudget!)
        (temple_act, "2026-11-02"),
        (train_act, "2026-11-02"),  # Total Day 2: 10 + 8 = 18 (underbudget)
    ]:
        await client.post(
            f"/trips/{trip_id}/stops/{stop_id}/activities",
            json={
                "activity_id": str(act.id),
                "scheduled_date": date_str,
            },
            headers=test_user["auth_header"],
        )

    return trip_id


@pytest.mark.asyncio
class TestBudgetEngine:
    async def test_get_full_budget(
        self, client: AsyncClient, test_user: dict, db_session: AsyncSession
    ):
        trip_id = await _setup_budget_test_data(client, test_user, db_session)

        response = await client.get(
            f"/trips/{trip_id}/budget",
            headers=test_user["auth_header"],
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total_cost"] == 153.0
        assert data["daily_budget"] == 100.0
        assert data["by_category"]["stay"] == 120.0
        assert data["by_category"]["food"] == 15.0
        assert data["by_category"]["activity"] == 10.0
        assert data["by_category"]["transport"] == 8.0

        # Day breakdown checks
        assert len(data["by_day"]) == 2
        day1 = data["by_day"][0]
        assert day1["total"] == 135.0
        assert day1["is_overbudget"] is True  # 135 > 100

        day2 = data["by_day"][1]
        assert day2["total"] == 18.0
        assert day2["is_overbudget"] is False  # 18 <= 100

    async def test_get_daily_budget(
        self, client: AsyncClient, test_user: dict, db_session: AsyncSession
    ):
        trip_id = await _setup_budget_test_data(client, test_user, db_session)

        response = await client.get(
            f"/trips/{trip_id}/budget/daily",
            headers=test_user["auth_header"],
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["days"]) == 2
        assert data["days"][0]["is_overbudget"] is True

    async def test_get_category_budget(
        self, client: AsyncClient, test_user: dict, db_session: AsyncSession
    ):
        trip_id = await _setup_budget_test_data(client, test_user, db_session)

        response = await client.get(
            f"/trips/{trip_id}/budget/category",
            headers=test_user["auth_header"],
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total_cost"] == 153.0
        assert data["by_category"]["stay"] == 120.0

"""Tests for itinerary endpoints — activity assignment, full itinerary, calendar view."""

import uuid

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.catalog.models import Activity, City


async def _setup_itinerary_data(
    client: AsyncClient, test_user: dict, db_session: AsyncSession
) -> tuple[str, str, str]:
    """Create a city, activity, trip, and stop for itinerary testing."""
    city_id = uuid.uuid4()
    city = City(
        id=city_id,
        name="Tokyo",
        country="Japan",
        cost_index=1.0,
        popularity_score=90,
        lat=35.6762,
        lng=139.6503,
    )
    act_id = uuid.uuid4()
    act = Activity(
        id=act_id,
        city_id=city_id,
        name="Senso-ji Temple",
        category="activity",
        cost=20.0,
        duration_minutes=90,
    )
    db_session.add_all([city, act])
    await db_session.commit()

    # Create trip
    trip_resp = await client.post("/trips", json={
        "name": "Tokyo Trip",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "daily_budget": 100.0,
    }, headers=test_user["auth_header"])
    trip_id = trip_resp.json()["id"]

    # Add stop
    stop_resp = await client.post(f"/trips/{trip_id}/stops", json={
        "city_id": str(city_id),
        "arrival_date": "2026-10-01",
        "departure_date": "2026-10-03",
    }, headers=test_user["auth_header"])
    stop_id = stop_resp.json()["id"]

    return trip_id, stop_id, str(act_id)


@pytest.mark.asyncio
class TestItinerary:
    async def test_assign_activity(
        self, client: AsyncClient, test_user: dict, db_session: AsyncSession
    ):
        trip_id, stop_id, act_id = await _setup_itinerary_data(client, test_user, db_session)

        response = await client.post(
            f"/trips/{trip_id}/stops/{stop_id}/activities",
            json={
                "activity_id": act_id,
                "scheduled_date": "2026-10-01",
                "cost_override": 15.0,
            },
            headers=test_user["auth_header"],
        )
        assert response.status_code == 201
        data = response.json()
        assert data["cost_override"] == 15.0
        assert data["activity"]["name"] == "Senso-ji Temple"

    async def test_get_full_itinerary(
        self, client: AsyncClient, test_user: dict, db_session: AsyncSession
    ):
        trip_id, stop_id, act_id = await _setup_itinerary_data(client, test_user, db_session)

        # Assign activity
        await client.post(
            f"/trips/{trip_id}/stops/{stop_id}/activities",
            json={
                "activity_id": act_id,
                "scheduled_date": "2026-10-01",
            },
            headers=test_user["auth_header"],
        )

        response = await client.get(
            f"/trips/{trip_id}/itinerary",
            headers=test_user["auth_header"],
        )
        assert response.status_code == 200
        data = response.json()
        assert data["trip_name"] == "Tokyo Trip"
        assert len(data["stops"]) == 1
        assert data["stops"][0]["city_name"] == "Tokyo"
        assert data["total_cost"] == 20.0

    async def test_get_calendar_view(
        self, client: AsyncClient, test_user: dict, db_session: AsyncSession
    ):
        trip_id, stop_id, act_id = await _setup_itinerary_data(client, test_user, db_session)

        await client.post(
            f"/trips/{trip_id}/stops/{stop_id}/activities",
            json={
                "activity_id": act_id,
                "scheduled_date": "2026-10-01",
            },
            headers=test_user["auth_header"],
        )

        response = await client.get(
            f"/trips/{trip_id}/itinerary/calendar",
            headers=test_user["auth_header"],
        )
        assert response.status_code == 200
        data = response.json()
        assert "calendar" in data
        assert "2026-10-01" in data["calendar"]
        day_info = data["calendar"]["2026-10-01"]
        assert day_info["city"] == "Tokyo"
        assert len(day_info["activities"]) == 1

    async def test_remove_activity(
        self, client: AsyncClient, test_user: dict, db_session: AsyncSession
    ):
        trip_id, stop_id, act_id = await _setup_itinerary_data(client, test_user, db_session)

        assign_resp = await client.post(
            f"/trips/{trip_id}/stops/{stop_id}/activities",
            json={"activity_id": act_id},
            headers=test_user["auth_header"],
        )
        activity_assignment_id = assign_resp.json()["id"]

        del_resp = await client.delete(
            f"/trips/{trip_id}/itinerary/activities/{activity_assignment_id}",
            headers=test_user["auth_header"],
        )
        assert del_resp.status_code == 204

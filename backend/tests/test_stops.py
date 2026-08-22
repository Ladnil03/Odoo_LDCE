"""Tests for stop endpoints — add, list, remove, reorder."""

import uuid

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.catalog.models import City


async def _create_test_city(db_session: AsyncSession) -> uuid.UUID:
    """Helper to create a test city."""
    city_id = uuid.uuid4()
    city = City(
        id=city_id,
        name="TestCity",
        country="TestCountry",
        cost_index=1.0,
        popularity_score=80,
        lat=35.6762,
        lng=139.6503,
    )
    db_session.add(city)
    await db_session.commit()
    return city_id


@pytest.mark.asyncio
class TestStops:
    async def test_add_stop(self, client: AsyncClient, test_user, db_session):
        city_id = await _create_test_city(db_session)

        # Create a trip first
        trip_resp = await client.post("/trips", json={
            "name": "Test Trip"
        }, headers=test_user["auth_header"])
        trip_id = trip_resp.json()["id"]

        # Add a stop
        response = await client.post(f"/trips/{trip_id}/stops", json={
            "city_id": str(city_id),
        }, headers=test_user["auth_header"])
        assert response.status_code == 201
        assert response.json()["order_index"] == 0

    async def test_list_stops(self, client: AsyncClient, test_user, db_session):
        city_id = await _create_test_city(db_session)

        trip_resp = await client.post("/trips", json={
            "name": "Multi Stop"
        }, headers=test_user["auth_header"])
        trip_id = trip_resp.json()["id"]

        # Add two stops
        await client.post(f"/trips/{trip_id}/stops", json={
            "city_id": str(city_id),
        }, headers=test_user["auth_header"])
        await client.post(f"/trips/{trip_id}/stops", json={
            "city_id": str(city_id),
        }, headers=test_user["auth_header"])

        response = await client.get(f"/trips/{trip_id}/stops", headers=test_user["auth_header"])
        assert response.status_code == 200
        stops = response.json()
        assert len(stops) == 2
        assert stops[0]["order_index"] == 0
        assert stops[1]["order_index"] == 1

    async def test_remove_stop(self, client: AsyncClient, test_user, db_session):
        city_id = await _create_test_city(db_session)

        trip_resp = await client.post("/trips", json={
            "name": "Remove Stop Trip"
        }, headers=test_user["auth_header"])
        trip_id = trip_resp.json()["id"]

        stop_resp = await client.post(f"/trips/{trip_id}/stops", json={
            "city_id": str(city_id),
        }, headers=test_user["auth_header"])
        stop_id = stop_resp.json()["id"]

        response = await client.delete(
            f"/trips/{trip_id}/stops/{stop_id}",
            headers=test_user["auth_header"],
        )
        assert response.status_code == 204

    async def test_reorder_stops(self, client: AsyncClient, test_user, db_session):
        city_id = await _create_test_city(db_session)

        trip_resp = await client.post("/trips", json={
            "name": "Reorder Trip"
        }, headers=test_user["auth_header"])
        trip_id = trip_resp.json()["id"]

        # Add 3 stops
        stop_ids = []
        for _ in range(3):
            resp = await client.post(f"/trips/{trip_id}/stops", json={
                "city_id": str(city_id),
            }, headers=test_user["auth_header"])
            stop_ids.append(resp.json()["id"])

        # Reverse the order
        reversed_ids = list(reversed(stop_ids))
        response = await client.patch(f"/trips/{trip_id}/stops/reorder", json={
            "ordered_ids": reversed_ids,
        }, headers=test_user["auth_header"])
        assert response.status_code == 200
        stops = response.json()
        assert stops[0]["id"] == reversed_ids[0]
        assert stops[2]["id"] == reversed_ids[2]

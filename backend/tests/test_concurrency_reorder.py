"""Concurrency, Idempotency & Budget Threshold Boundary Test Suite.

Verifies idempotency of reordering, atomic multi-stop sequencing, and exact budget threshold logic.
"""

import asyncio
import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.catalog.models import Activity, City


@pytest.mark.asyncio
class TestConcurrencyAndIdempotency:
    async def test_reorder_stops_idempotency(
        self, client: AsyncClient, test_user: dict, db_session: AsyncSession
    ):
        # Create 3 cities
        c1 = City(id=uuid.uuid4(), name="Tokyo", country="Japan", cost_index=1.2, popularity_score=95, lat=35.6, lng=139.6)
        c2 = City(id=uuid.uuid4(), name="Kyoto", country="Japan", cost_index=1.1, popularity_score=90, lat=35.0, lng=135.7)
        c3 = City(id=uuid.uuid4(), name="Osaka", country="Japan", cost_index=1.0, popularity_score=85, lat=34.6, lng=135.5)
        db_session.add_all([c1, c2, c3])
        await db_session.commit()

        # Create trip
        t_resp = await client.post("/trips", json={"name": "Japan Rail Trip"}, headers=test_user["auth_header"])
        trip_id = t_resp.json()["id"]

        # Add 3 stops: Tokyo (0), Kyoto (1), Osaka (2)
        s1 = (await client.post(f"/trips/{trip_id}/stops", json={"city_id": str(c1.id)}, headers=test_user["auth_header"])).json()["id"]
        s2 = (await client.post(f"/trips/{trip_id}/stops", json={"city_id": str(c2.id)}, headers=test_user["auth_header"])).json()["id"]
        s3 = (await client.post(f"/trips/{trip_id}/stops", json={"city_id": str(c3.id)}, headers=test_user["auth_header"])).json()["id"]

        # Reorder to reverse: [Osaka, Kyoto, Tokyo]
        reverse_order = [s3, s2, s1]
        resp1 = await client.put(
            f"/trips/{trip_id}/stops/reorder",
            json={"ordered_ids": reverse_order},
            headers=test_user["auth_header"],
        )
        assert resp1.status_code == 200
        items1 = [s["id"] for s in resp1.json()]
        assert items1 == reverse_order

        # Re-run same reorder (Idempotency check)
        resp2 = await client.put(
            f"/trips/{trip_id}/stops/reorder",
            json={"ordered_ids": reverse_order},
            headers=test_user["auth_header"],
        )
        assert resp2.status_code == 200
        items2 = [s["id"] for s in resp2.json()]
        assert items2 == reverse_order

        # Verify persisted GET stops returns exact new order
        get_stops = await client.get(f"/trips/{trip_id}/stops", headers=test_user["auth_header"])
        assert [s["id"] for s in get_stops.json()] == reverse_order

    async def test_budget_exact_threshold_boundary_logic(
        self, client: AsyncClient, test_user: dict, db_session: AsyncSession
    ):
        """Test daily budget threshold: is_overbudget is True only strictly when total > daily_budget."""
        city = City(id=uuid.uuid4(), name="Berlin", country="Germany", cost_index=1.0, popularity_score=80, lat=52.5, lng=13.4)
        act = Activity(id=uuid.uuid4(), city_id=city.id, name="Museum Pass", category="activity", cost=100.0, duration_minutes=180)
        db_session.add_all([city, act])
        await db_session.commit()

        # Trip with daily_budget = 100.0
        t_resp = await client.post("/trips", json={
            "name": "Berlin Culture Trip",
            "daily_budget": 100.0,
        }, headers=test_user["auth_header"])
        trip_id = t_resp.json()["id"]

        s_resp = await client.post(f"/trips/{trip_id}/stops", json={"city_id": str(city.id)}, headers=test_user["auth_header"])
        stop_id = s_resp.json()["id"]

        # Case 1: Cost = 99.0 (< threshold 100.0) -> is_overbudget: False
        assign1 = await client.post(
            f"/trips/{trip_id}/stops/{stop_id}/activities",
            json={"activity_id": str(act.id), "scheduled_date": "2026-09-01", "cost_override": 99.0},
            headers=test_user["auth_header"],
        )
        ta1_id = assign1.json()["id"]

        b1 = await client.get(f"/trips/{trip_id}/budget/daily", headers=test_user["auth_header"])
        day_entry = b1.json()["days"][0]
        assert day_entry["total"] == 99.0
        assert day_entry["is_overbudget"] is False

        # Case 2: Cost = 100.0 (== threshold 100.0) -> is_overbudget: False
        await client.patch(
            f"/trips/{trip_id}/stops/{stop_id}/activities/{ta1_id}",
            json={"cost_override": 100.0},
            headers=test_user["auth_header"],
        )
        b2 = await client.get(f"/trips/{trip_id}/budget/daily", headers=test_user["auth_header"])
        day_entry = b2.json()["days"][0]
        assert day_entry["total"] == 100.0
        assert day_entry["is_overbudget"] is False

        # Case 3: Cost = 100.01 (> threshold 100.0) -> is_overbudget: True
        await client.patch(
            f"/trips/{trip_id}/stops/{stop_id}/activities/{ta1_id}",
            json={"cost_override": 100.01},
            headers=test_user["auth_header"],
        )
        b3 = await client.get(f"/trips/{trip_id}/budget/daily", headers=test_user["auth_header"])
        day_entry = b3.json()["days"][0]
        assert day_entry["total"] == 100.01
        assert day_entry["is_overbudget"] is True

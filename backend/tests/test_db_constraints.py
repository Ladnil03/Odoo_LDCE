"""Database Constraints, Cascading, and Error Handling Test Suite.

Verifies database unique constraints, soft-delete isolation, price overrides, and security of error responses.
"""

import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.catalog.models import Activity, City


@pytest.mark.asyncio
class TestDatabaseConstraintsAndErrors:
    async def test_duplicate_email_conflict_response(self, client: AsyncClient, test_user: dict):
        """Attempting to signup with an existing email returns 409 Conflict without DB crash."""
        resp = await client.post("/auth/signup", json={
            "email": test_user["email"],
            "password": "anotherpassword123",
            "name": "Duplicate User",
        })
        assert resp.status_code == 409
        data = resp.json()
        detail_str = data["detail"].lower()
        assert "already registered" in detail_str or "already exists" in detail_str
        # Verify no raw SQL error or traceback in output
        assert "Traceback" not in str(data)

    async def test_soft_delete_lifecycle_and_exclusion(
        self, client: AsyncClient, test_user: dict
    ):
        """Soft-deleted trips must be completely hidden from list and detail queries."""
        # 1. Create trip
        create_resp = await client.post("/trips", json={
            "name": "Trip To Be Soft Deleted",
        }, headers=test_user["auth_header"])
        trip_id = create_resp.json()["id"]

        # 2. Verify it is visible
        list1 = await client.get("/trips", headers=test_user["auth_header"])
        assert any(t["id"] == trip_id for t in list1.json()["items"])

        # 3. Soft delete
        del_resp = await client.delete(f"/trips/{trip_id}", headers=test_user["auth_header"])
        assert del_resp.status_code == 204

        # 4. Excluded from list
        list2 = await client.get("/trips", headers=test_user["auth_header"])
        assert not any(t["id"] == trip_id for t in list2.json()["items"])

        # 5. Detail query returns 404
        detail_resp = await client.get(f"/trips/{trip_id}", headers=test_user["auth_header"])
        assert detail_resp.status_code == 404

    async def test_activity_base_cost_vs_cost_override_budgeting(
        self, client: AsyncClient, test_user: dict, db_session: AsyncSession
    ):
        """Verify budget engine uses base catalog cost when cost_override is null, and override when specified."""
        city = City(id=uuid.uuid4(), name="Sydney", country="Australia", cost_index=1.3, popularity_score=85, lat=-33.8, lng=151.2)
        act = Activity(id=uuid.uuid4(), city_id=city.id, name="Opera House Tour", category="activity", cost=50.0, duration_minutes=90)
        db_session.add_all([city, act])
        await db_session.commit()

        t_resp = await client.post("/trips", json={"name": "Sydney Trip"}, headers=test_user["auth_header"])
        trip_id = t_resp.json()["id"]
        s_resp = await client.post(f"/trips/{trip_id}/stops", json={"city_id": str(city.id)}, headers=test_user["auth_header"])
        stop_id = s_resp.json()["id"]

        # Assignment 1: No cost_override -> should use catalog cost (50.0)
        a1 = await client.post(
            f"/trips/{trip_id}/stops/{stop_id}/activities",
            json={"activity_id": str(act.id)},
            headers=test_user["auth_header"],
        )
        assert a1.status_code == 201

        b1 = await client.get(f"/trips/{trip_id}/budget", headers=test_user["auth_header"])
        assert b1.json()["total_cost"] == 50.0

        # Assignment 2: With cost_override (75.0) -> total should be 50.0 + 75.0 = 125.0
        a2 = await client.post(
            f"/trips/{trip_id}/stops/{stop_id}/activities",
            json={"activity_id": str(act.id), "cost_override": 75.0},
            headers=test_user["auth_header"],
        )
        assert a2.status_code == 201

        b2 = await client.get(f"/trips/{trip_id}/budget", headers=test_user["auth_header"])
        assert b2.json()["total_cost"] == 125.0

    async def test_nonexistent_foreign_resource_returns_404(
        self, client: AsyncClient, test_user: dict
    ):
        """Operations on non-existent stops or trips return clean 404 errors."""
        fake_trip_id = uuid.uuid4()
        fake_stop_id = uuid.uuid4()
        fake_act_id = uuid.uuid4()

        # Stop creation on non-existent trip
        resp1 = await client.post(
            f"/trips/{fake_trip_id}/stops",
            json={"city_id": str(uuid.uuid4())},
            headers=test_user["auth_header"],
        )
        assert resp1.status_code == 404

        # Activity assignment on non-existent stop
        resp2 = await client.post(
            f"/trips/{fake_trip_id}/stops/{fake_stop_id}/activities",
            json={"activity_id": str(fake_act_id)},
            headers=test_user["auth_header"],
        )
        assert resp2.status_code == 404

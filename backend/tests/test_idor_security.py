"""Security & IDOR Isolation Test Suite.

Verifies that users cannot read, modify, or delete resources belonging to other users.
"""

import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.catalog.models import Activity, City


async def _create_user_a_trip_with_stop(
    client: AsyncClient, test_user: dict, db_session: AsyncSession
) -> tuple[str, str, str]:
    """Helper to create a trip, stop, and activity owned by test_user (User A)."""
    city_id = uuid.uuid4()
    city = City(
        id=city_id,
        name="Kyoto",
        country="Japan",
        cost_index=1.1,
        popularity_score=88,
        lat=35.0116,
        lng=135.7681,
    )
    act_id = uuid.uuid4()
    act = Activity(
        id=act_id,
        city_id=city_id,
        name="Tea Ceremony",
        category="activity",
        cost=35.0,
        duration_minutes=60,
    )
    db_session.add_all([city, act])
    await db_session.commit()

    # User A creates trip
    trip_resp = await client.post("/trips", json={
        "name": "User A Private Trip",
        "start_date": "2026-12-01",
        "end_date": "2026-12-10",
        "daily_budget": 150.0,
    }, headers=test_user["auth_header"])
    trip_id = trip_resp.json()["id"]

    # User A adds stop
    stop_resp = await client.post(f"/trips/{trip_id}/stops", json={
        "city_id": str(city_id),
    }, headers=test_user["auth_header"])
    stop_id = stop_resp.json()["id"]

    return trip_id, stop_id, str(act_id)


@pytest.mark.asyncio
class TestIDORSecurity:
    async def test_user_b_cannot_read_user_a_trip(
        self, client: AsyncClient, test_user: dict, second_user: dict, db_session: AsyncSession
    ):
        trip_id, _, _ = await _create_user_a_trip_with_stop(client, test_user, db_session)

        # User B attempts to read User A's trip
        resp = await client.get(f"/trips/{trip_id}", headers=second_user["auth_header"])
        assert resp.status_code == 403

    async def test_user_b_cannot_update_user_a_trip(
        self, client: AsyncClient, test_user: dict, second_user: dict, db_session: AsyncSession
    ):
        trip_id, _, _ = await _create_user_a_trip_with_stop(client, test_user, db_session)

        resp = await client.patch(
            f"/trips/{trip_id}",
            json={"name": "Hacked Trip Name"},
            headers=second_user["auth_header"],
        )
        assert resp.status_code == 403

    async def test_user_b_cannot_delete_user_a_trip(
        self, client: AsyncClient, test_user: dict, second_user: dict, db_session: AsyncSession
    ):
        trip_id, _, _ = await _create_user_a_trip_with_stop(client, test_user, db_session)

        resp = await client.delete(f"/trips/{trip_id}", headers=second_user["auth_header"])
        assert resp.status_code == 403

    async def test_user_b_cannot_add_stop_to_user_a_trip(
        self, client: AsyncClient, test_user: dict, second_user: dict, db_session: AsyncSession
    ):
        trip_id, _, _ = await _create_user_a_trip_with_stop(client, test_user, db_session)

        resp = await client.post(
            f"/trips/{trip_id}/stops",
            json={"city_id": str(uuid.uuid4())},
            headers=second_user["auth_header"],
        )
        assert resp.status_code == 403

    async def test_user_b_cannot_delete_stop_of_user_a_trip(
        self, client: AsyncClient, test_user: dict, second_user: dict, db_session: AsyncSession
    ):
        trip_id, stop_id, _ = await _create_user_a_trip_with_stop(client, test_user, db_session)

        resp = await client.delete(
            f"/trips/{trip_id}/stops/{stop_id}",
            headers=second_user["auth_header"],
        )
        assert resp.status_code == 403

    async def test_user_b_cannot_reorder_stops_of_user_a_trip(
        self, client: AsyncClient, test_user: dict, second_user: dict, db_session: AsyncSession
    ):
        trip_id, stop_id, _ = await _create_user_a_trip_with_stop(client, test_user, db_session)

        resp = await client.put(
            f"/trips/{trip_id}/stops/reorder",
            json={"ordered_ids": [stop_id]},
            headers=second_user["auth_header"],
        )
        assert resp.status_code == 403

    async def test_user_b_cannot_view_user_a_itinerary(
        self, client: AsyncClient, test_user: dict, second_user: dict, db_session: AsyncSession
    ):
        trip_id, _, _ = await _create_user_a_trip_with_stop(client, test_user, db_session)

        resp = await client.get(f"/trips/{trip_id}/itinerary", headers=second_user["auth_header"])
        assert resp.status_code == 403

    async def test_user_b_cannot_assign_activity_to_user_a_trip(
        self, client: AsyncClient, test_user: dict, second_user: dict, db_session: AsyncSession
    ):
        trip_id, stop_id, act_id = await _create_user_a_trip_with_stop(client, test_user, db_session)

        resp = await client.post(
            f"/trips/{trip_id}/stops/{stop_id}/activities",
            json={"activity_id": act_id},
            headers=second_user["auth_header"],
        )
        assert resp.status_code == 403

    async def test_user_b_cannot_view_user_a_budget(
        self, client: AsyncClient, test_user: dict, second_user: dict, db_session: AsyncSession
    ):
        trip_id, _, _ = await _create_user_a_trip_with_stop(client, test_user, db_session)

        resp = await client.get(f"/trips/{trip_id}/budget", headers=second_user["auth_header"])
        assert resp.status_code == 403

    async def test_user_b_cannot_view_user_a_calendar(
        self, client: AsyncClient, test_user: dict, second_user: dict, db_session: AsyncSession
    ):
        trip_id, _, _ = await _create_user_a_trip_with_stop(client, test_user, db_session)

        resp = await client.get(f"/trips/{trip_id}/calendar", headers=second_user["auth_header"])
        assert resp.status_code == 403

    async def test_standard_user_cannot_access_admin_dashboard(
        self, client: AsyncClient, test_user: dict
    ):
        resp = await client.get("/admin/analytics/overview", headers=test_user["auth_header"])
        assert resp.status_code == 403

    async def test_standard_user_cannot_modify_user_roles(
        self, client: AsyncClient, test_user: dict, second_user: dict
    ):
        resp = await client.patch(
            f"/admin/users/{second_user['id']}/role",
            json={"role": "admin"},
            headers=test_user["auth_header"],
        )
        assert resp.status_code == 403

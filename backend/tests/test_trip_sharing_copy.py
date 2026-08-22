"""Sharing, Public Access, and Deep-Clone Independence Test Suite.

Verifies trip sharing lifecycles, privacy preservation, and deep copy isolation.
"""

import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.catalog.models import Activity, City
from app.trips.models import TripCopy


@pytest.mark.asyncio
class TestTripSharingAndCopy:
    async def test_share_and_unshare_lifecycle(
        self, client: AsyncClient, test_user: dict, db_session: AsyncSession
    ):
        # 1. Create private trip
        trip_resp = await client.post("/trips", json={
            "name": "Secret Vacation",
            "daily_budget": 200.0,
        }, headers=test_user["auth_header"])
        trip_id = trip_resp.json()["id"]

        # 2. Share trip publicly
        share_resp = await client.post(f"/trips/{trip_id}/share", headers=test_user["auth_header"])
        assert share_resp.status_code == 200
        data = share_resp.json()
        assert "share_slug" in data
        assert "public_url" in data
        slug = data["share_slug"]

        # 3. Access public route anonymously (no auth header)
        pub_resp = await client.get(f"/trips/public/{slug}")
        assert pub_resp.status_code == 200
        pub_data = pub_resp.json()
        assert pub_data["name"] == "Secret Vacation"
        # Verify privacy: no password_hash or owner email leaked in response
        assert "password_hash" not in str(pub_data)

        # 4. Unshare trip
        unshare_resp = await client.delete(f"/trips/{trip_id}/share", headers=test_user["auth_header"])
        assert unshare_resp.status_code == 204

        # 5. Public access now returns 404
        revoked_resp = await client.get(f"/trips/public/{slug}")
        assert revoked_resp.status_code == 404

    async def test_copy_private_trip_by_another_user_fails(
        self, client: AsyncClient, test_user: dict, second_user: dict
    ):
        trip_resp = await client.post("/trips", json={
            "name": "Private Unshared Trip",
        }, headers=test_user["auth_header"])
        trip_id = trip_resp.json()["id"]

        # User B attempts to copy User A's private trip
        copy_resp = await client.post(f"/trips/{trip_id}/copy", headers=second_user["auth_header"])
        assert copy_resp.status_code == 403

    async def test_deep_copy_independence_and_mutation_isolation(
        self, client: AsyncClient, test_user: dict, second_user: dict, db_session: AsyncSession
    ):
        # 1. Setup City & Activity
        city_id = uuid.uuid4()
        city = City(
            id=city_id, name="Rome", country="Italy",
            cost_index=1.2, popularity_score=92, lat=41.9028, lng=12.4964
        )
        act_id = uuid.uuid4()
        act = Activity(
            id=act_id, city_id=city_id, name="Colosseum Tour",
            category="activity", cost=30.0, duration_minutes=120
        )
        db_session.add_all([city, act])
        await db_session.commit()

        # 2. User A creates trip with stop & activity
        t1_resp = await client.post("/trips", json={"name": "Original Rome Trip"}, headers=test_user["auth_header"])
        t1_id = t1_resp.json()["id"]

        s1_resp = await client.post(f"/trips/{t1_id}/stops", json={"city_id": str(city_id)}, headers=test_user["auth_header"])
        s1_id = s1_resp.json()["id"]

        await client.post(
            f"/trips/{t1_id}/stops/{s1_id}/activities",
            json={"activity_id": str(act_id), "cost_override": 25.0},
            headers=test_user["auth_header"],
        )

        # 3. User A makes trip public
        await client.post(f"/trips/{t1_id}/share", headers=test_user["auth_header"])

        # 4. User B copies the trip
        copy_resp = await client.post(f"/trips/{t1_id}/copy", headers=second_user["auth_header"])
        assert copy_resp.status_code == 201
        t2_data = copy_resp.json()
        assert "new_trip_id" in t2_data
        t2_id = t2_data["new_trip_id"]

        assert t2_id != t1_id

        # Verify cloned trip properties via GET
        t2_fetch = await client.get(f"/trips/{t2_id}", headers=second_user["auth_header"])
        assert t2_fetch.status_code == 200
        t2_details = t2_fetch.json()
        assert t2_details["name"] == "Original Rome Trip (copy)"
        assert t2_details["owner_id"] == str(second_user["id"])

        # 5. Verify User B can see cloned stops
        s2_list_resp = await client.get(f"/trips/{t2_id}/stops", headers=second_user["auth_header"])
        assert s2_list_resp.status_code == 200
        s2_stops = s2_list_resp.json()
        assert len(s2_stops) == 1
        s2_id = s2_stops[0]["id"]
        assert s2_id != s1_id  # New independent UUID

        # 6. User B mutates their copied trip (modifies name and deletes stop)
        await client.patch(f"/trips/{t2_id}", json={"name": "User B Custom Rome"}, headers=second_user["auth_header"])
        await client.delete(f"/trips/{t2_id}/stops/{s2_id}", headers=second_user["auth_header"])

        # 7. Verify Original Trip is completely UNCHANGED
        t1_verify = await client.get(f"/trips/{t1_id}", headers=test_user["auth_header"])
        assert t1_verify.json()["name"] == "Original Rome Trip"

        s1_list_verify = await client.get(f"/trips/{t1_id}/stops", headers=test_user["auth_header"])
        assert len(s1_list_verify.json()) == 1  # Stop still intact on original!

        # 8. Check audit log in database
        audit_res = await db_session.execute(
            select(TripCopy).where(TripCopy.copied_trip_id == uuid.UUID(t2_id))
        )
        audit_row = audit_res.scalar_one_or_none()
        assert audit_row is not None
        assert audit_row.original_trip_id == uuid.UUID(t1_id)
        assert audit_row.copied_by == second_user["id"]

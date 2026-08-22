"""Validation, Boundary Value & Input Gating Test Suite.

Verifies strict input validation across request payloads, query params, and route parameters.
"""

import uuid
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
class TestValidationBoundaries:
    # ── Auth Validations ──

    async def test_signup_empty_body(self, client: AsyncClient):
        resp = await client.post("/auth/signup", json={})
        assert resp.status_code == 422

    async def test_signup_short_password(self, client: AsyncClient):
        resp = await client.post("/auth/signup", json={
            "email": "valid@example.com",
            "password": "123",
            "name": "Short Pass",
        })
        assert resp.status_code == 422

    async def test_signup_invalid_email_format(self, client: AsyncClient):
        resp = await client.post("/auth/signup", json={
            "email": "not-an-email",
            "password": "validpassword123",
            "name": "Bad Email",
        })
        assert resp.status_code == 422

    # ── Trip Validations ──

    async def test_trip_create_invalid_date_range(self, client: AsyncClient, test_user: dict):
        resp = await client.post("/trips", json={
            "name": "Invalid Date Trip",
            "start_date": "2026-10-15",
            "end_date": "2026-10-10",  # End before start
        }, headers=test_user["auth_header"])
        assert resp.status_code in (400, 422)

    async def test_trip_create_negative_daily_budget(self, client: AsyncClient, test_user: dict):
        resp = await client.post("/trips", json={
            "name": "Negative Budget Trip",
            "daily_budget": -50.0,
        }, headers=test_user["auth_header"])
        assert resp.status_code == 422

    async def test_trip_invalid_uuid_in_path(self, client: AsyncClient, test_user: dict):
        resp = await client.get("/trips/not-a-valid-uuid", headers=test_user["auth_header"])
        assert resp.status_code == 422

    async def test_trip_pagination_out_of_bounds(self, client: AsyncClient, test_user: dict):
        # page=0 is invalid (ge=1)
        resp0 = await client.get("/trips?page=0", headers=test_user["auth_header"])
        assert resp0.status_code == 422

        # page_size=200 is invalid (le=100)
        resp200 = await client.get("/trips?page_size=200", headers=test_user["auth_header"])
        assert resp200.status_code == 422

    # ── Catalog Validations ──

    async def test_activity_search_invalid_category(self, client: AsyncClient):
        resp = await client.get("/activities/search?category=invalid_category")
        assert resp.status_code == 422

    async def test_activity_search_negative_cost(self, client: AsyncClient):
        resp = await client.get("/activities/search?max_cost=-10")
        assert resp.status_code == 422

    async def test_activity_search_zero_duration(self, client: AsyncClient):
        # duration must be ge=1
        resp = await client.get("/activities/search?max_duration=0")
        assert resp.status_code == 422

    # ── Stop Reordering Validations ──

    async def test_stop_reorder_empty_list(self, client: AsyncClient, test_user: dict):
        trip_resp = await client.post("/trips", json={"name": "Reorder Test"}, headers=test_user["auth_header"])
        trip_id = trip_resp.json()["id"]

        # Add a stop
        await client.post(f"/trips/{trip_id}/stops", json={"city_id": str(uuid.uuid4())}, headers=test_user["auth_header"])

        # Attempt to reorder with empty list (mismatch with 1 existing stop)
        resp = await client.put(
            f"/trips/{trip_id}/stops/reorder",
            json={"ordered_ids": []},
            headers=test_user["auth_header"],
        )
        assert resp.status_code == 400

    async def test_stop_reorder_invalid_or_missing_ids(self, client: AsyncClient, test_user: dict):
        trip_resp = await client.post("/trips", json={"name": "Reorder Test"}, headers=test_user["auth_header"])
        trip_id = trip_resp.json()["id"]

        fake_stop_id = str(uuid.uuid4())
        resp = await client.put(
            f"/trips/{trip_id}/stops/reorder",
            json={"ordered_ids": [fake_stop_id]},
            headers=test_user["auth_header"],
        )
        assert resp.status_code == 400

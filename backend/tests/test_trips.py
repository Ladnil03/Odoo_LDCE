"""Tests for trip CRUD endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
class TestTripCRUD:
    async def test_create_trip(self, client: AsyncClient, test_user):
        response = await client.post("/trips", json={
            "name": "Japan Adventure",
            "start_date": "2026-09-15",
            "end_date": "2026-09-25",
            "daily_budget": 150.0,
        }, headers=test_user["auth_header"])
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Japan Adventure"
        assert data["daily_budget"] == 150.0

    async def test_create_trip_no_auth(self, client: AsyncClient):
        response = await client.post("/trips", json={"name": "Test Trip"})
        assert response.status_code == 401

    async def test_create_trip_invalid_dates(self, client: AsyncClient, test_user):
        response = await client.post("/trips", json={
            "name": "Bad Dates Trip",
            "start_date": "2026-09-25",
            "end_date": "2026-09-15",  # end before start
        }, headers=test_user["auth_header"])
        assert response.status_code == 400

    async def test_list_trips(self, client: AsyncClient, test_user):
        # Create two trips
        await client.post("/trips", json={"name": "Trip 1"}, headers=test_user["auth_header"])
        await client.post("/trips", json={"name": "Trip 2"}, headers=test_user["auth_header"])

        response = await client.get("/trips", headers=test_user["auth_header"])
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 2
        assert len(data["items"]) == 2

    async def test_get_trip_detail(self, client: AsyncClient, test_user):
        create_resp = await client.post("/trips", json={
            "name": "Detail Trip"
        }, headers=test_user["auth_header"])
        trip_id = create_resp.json()["id"]

        response = await client.get(f"/trips/{trip_id}", headers=test_user["auth_header"])
        assert response.status_code == 200
        assert response.json()["name"] == "Detail Trip"

    async def test_update_trip(self, client: AsyncClient, test_user):
        create_resp = await client.post("/trips", json={
            "name": "Original Name"
        }, headers=test_user["auth_header"])
        trip_id = create_resp.json()["id"]

        response = await client.patch(f"/trips/{trip_id}", json={
            "name": "Updated Name",
            "daily_budget": 200.0,
        }, headers=test_user["auth_header"])
        assert response.status_code == 200
        assert response.json()["name"] == "Updated Name"
        assert response.json()["daily_budget"] == 200.0

    async def test_soft_delete_trip(self, client: AsyncClient, test_user):
        create_resp = await client.post("/trips", json={
            "name": "To Delete"
        }, headers=test_user["auth_header"])
        trip_id = create_resp.json()["id"]

        # Delete
        response = await client.delete(f"/trips/{trip_id}", headers=test_user["auth_header"])
        assert response.status_code == 204

        # Should no longer appear in list
        list_resp = await client.get("/trips", headers=test_user["auth_header"])
        trip_ids = [t["id"] for t in list_resp.json()["items"]]
        assert trip_id not in trip_ids

    async def test_pagination(self, client: AsyncClient, test_user):
        # Create 5 trips
        for i in range(5):
            await client.post("/trips", json={"name": f"Trip {i}"}, headers=test_user["auth_header"])

        # Get page 1 with page_size=2
        response = await client.get("/trips?page=1&page_size=2", headers=test_user["auth_header"])
        data = response.json()
        assert data["total"] == 5
        assert len(data["items"]) == 2
        assert data["page"] == 1

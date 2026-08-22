"""Tests for admin analytics endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
class TestAdminAccess:
    async def test_admin_overview_as_admin(self, client: AsyncClient, admin_user):
        response = await client.get(
            "/admin/analytics/overview",
            headers=admin_user["auth_header"],
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_users" in data
        assert "total_trips" in data

    async def test_admin_overview_as_user(self, client: AsyncClient, test_user):
        response = await client.get(
            "/admin/analytics/overview",
            headers=test_user["auth_header"],
        )
        assert response.status_code == 403

    async def test_admin_overview_no_auth(self, client: AsyncClient):
        response = await client.get("/admin/analytics/overview")
        assert response.status_code == 401

    async def test_admin_user_list(self, client: AsyncClient, admin_user):
        response = await client.get(
            "/admin/users",
            headers=admin_user["auth_header"],
        )
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data

    async def test_admin_role_update(self, client: AsyncClient, admin_user, test_user):
        response = await client.patch(
            f"/admin/users/{test_user['id']}/role",
            json={"role": "admin"},
            headers=admin_user["auth_header"],
        )
        assert response.status_code == 200
        assert response.json()["role"] == "admin"

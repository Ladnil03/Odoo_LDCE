"""Tests for auth endpoints — signup, login, refresh, profile."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
class TestSignup:
    async def test_signup_success(self, client: AsyncClient):
        response = await client.post("/auth/signup", json={
            "email": "new@example.com",
            "password": "securepass123",
            "name": "New User",
        })
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    async def test_signup_duplicate_email(self, client: AsyncClient, test_user):
        response = await client.post("/auth/signup", json={
            "email": test_user["email"],
            "password": "securepass123",
            "name": "Duplicate User",
        })
        assert response.status_code == 409

    async def test_signup_short_password(self, client: AsyncClient):
        response = await client.post("/auth/signup", json={
            "email": "short@example.com",
            "password": "short",
            "name": "Short Pass",
        })
        assert response.status_code == 422

    async def test_signup_invalid_email(self, client: AsyncClient):
        response = await client.post("/auth/signup", json={
            "email": "not-an-email",
            "password": "securepass123",
            "name": "Bad Email",
        })
        assert response.status_code == 422


@pytest.mark.asyncio
class TestLogin:
    async def test_login_success(self, client: AsyncClient, test_user):
        response = await client.post("/auth/login", json={
            "email": test_user["email"],
            "password": "testpass123",
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data

    async def test_login_wrong_password(self, client: AsyncClient, test_user):
        response = await client.post("/auth/login", json={
            "email": test_user["email"],
            "password": "wrongpassword",
        })
        assert response.status_code == 401

    async def test_login_nonexistent_email(self, client: AsyncClient):
        response = await client.post("/auth/login", json={
            "email": "nobody@example.com",
            "password": "password123",
        })
        assert response.status_code == 401


@pytest.mark.asyncio
class TestRefresh:
    async def test_refresh_success(self, client: AsyncClient, test_user):
        response = await client.post("/auth/refresh", json={
            "refresh_token": test_user["tokens"]["refresh_token"],
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data

    async def test_refresh_with_access_token_fails(self, client: AsyncClient, test_user):
        response = await client.post("/auth/refresh", json={
            "refresh_token": test_user["tokens"]["access_token"],
        })
        assert response.status_code == 401

    async def test_refresh_invalid_token(self, client: AsyncClient):
        response = await client.post("/auth/refresh", json={
            "refresh_token": "invalid.token.here",
        })
        assert response.status_code == 401


@pytest.mark.asyncio
class TestMe:
    async def test_get_me_success(self, client: AsyncClient, test_user):
        response = await client.get("/auth/me", headers=test_user["auth_header"])
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user["email"]
        assert data["name"] == "Test User"
        assert data["role"] == "user"

    async def test_get_me_no_auth(self, client: AsyncClient):
        response = await client.get("/auth/me")
        assert response.status_code == 401  # No bearer token

"""Pydantic schemas for the bootstrap endpoint."""

from pydantic import BaseModel


class BootstrapStatus(BaseModel):
    """Response describing whether the database is empty / partially seeded."""

    needs_bootstrap: bool
    cities: int
    activities: int
    users: int
    trips: int
    community_posts: int


class BootstrapResult(BaseModel):
    """Response describing the outcome of a bootstrap run."""

    ok: bool
    message: str
    cities_added: int
    activities_added: int
    users_added: int
    trips_added: int
    posts_added: int

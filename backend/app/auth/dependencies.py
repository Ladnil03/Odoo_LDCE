"""FastAPI dependencies for authentication and authorization."""

import uuid
from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import User
from app.auth.service import get_user_by_id
from app.core.database import get_db
from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.security import decode_token

security_scheme = HTTPBearer()


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """Extract and validate the current user from the JWT Bearer token.

    Raises UnauthorizedError if the token is invalid or the user doesn't exist.
    """
    payload = decode_token(credentials.credentials)
    if payload is None:
        raise UnauthorizedError("Invalid or expired token")

    if payload.get("type") != "access":
        raise UnauthorizedError("Invalid token type — expected access token")

    user_id_str = payload.get("sub")
    if user_id_str is None:
        raise UnauthorizedError("Token missing subject claim")

    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        raise UnauthorizedError("Invalid user ID in token")

    user = await get_user_by_id(db, user_id)
    if user is None:
        raise UnauthorizedError("User no longer exists")

    return user


async def require_admin(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Dependency that ensures the current user has admin role.

    Raises ForbiddenError if the user is not an admin.
    """
    if current_user.role != "admin":
        raise ForbiddenError("Admin access required")
    return current_user

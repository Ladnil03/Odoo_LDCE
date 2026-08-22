"""Custom exception classes and FastAPI exception handlers."""

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse


# ── Custom exceptions ──

class AppException(Exception):
    """Base exception for all application errors."""

    def __init__(self, detail: str, status_code: int = 400):
        self.detail = detail
        self.status_code = status_code
        super().__init__(detail)


class NotFoundError(AppException):
    """Resource not found."""

    def __init__(self, resource: str = "Resource", detail: str | None = None):
        super().__init__(
            detail=detail or f"{resource} not found",
            status_code=status.HTTP_404_NOT_FOUND,
        )


class ForbiddenError(AppException):
    """User does not have permission to perform this action."""

    def __init__(self, detail: str = "You do not have permission to perform this action"):
        super().__init__(detail=detail, status_code=status.HTTP_403_FORBIDDEN)


class ConflictError(AppException):
    """Resource already exists or state conflict."""

    def __init__(self, detail: str = "Resource already exists"):
        super().__init__(detail=detail, status_code=status.HTTP_409_CONFLICT)


class UnauthorizedError(AppException):
    """Authentication required or credentials invalid."""

    def __init__(self, detail: str = "Could not validate credentials"):
        super().__init__(detail=detail, status_code=status.HTTP_401_UNAUTHORIZED)


class BadRequestError(AppException):
    """Invalid request data."""

    def __init__(self, detail: str = "Invalid request"):
        super().__init__(detail=detail, status_code=status.HTTP_400_BAD_REQUEST)


# ── Exception handlers ──

def register_exception_handlers(app: FastAPI) -> None:
    """Register custom exception handlers on the FastAPI app."""

    @app.exception_handler(AppException)
    async def app_exception_handler(_request: Request, exc: AppException) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(_request: Request, exc: Exception) -> JSONResponse:
        # In production, log the exception and return a generic message
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "An unexpected error occurred"},
        )

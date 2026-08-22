"""FastAPI application entry point — middleware, routers, exception handlers."""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.core.config import settings
from app.core.exceptions import register_exception_handlers

# ── Rate limiter ──
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — startup and shutdown hooks."""
    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # Ensure all tables exist in Neon / DB
    try:
        from app.core.database import engine, Base
        import app.auth.models  # noqa: F401
        import app.catalog.models  # noqa: F401
        import app.trips.models  # noqa: F401
        import app.stops.models  # noqa: F401
        import app.itinerary.models  # noqa: F401
        import app.community.models  # noqa: F401

        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        print(f"[Lifespan] Error ensuring database tables: {e}")

    yield
    # Shutdown cleanup (if needed)


def create_app() -> FastAPI:
    """Factory function that builds and configures the FastAPI application."""
    app = FastAPI(
        title=settings.APP_NAME,
        description="Budget-accurate, relationally sound, shareable travel planner API",
        version="0.1.0",
        lifespan=lifespan,
    )

    # ── Rate limiting ──
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # ── CORS ──
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Custom exception handlers ──
    register_exception_handlers(app)

    # ── Static files (uploads) ──
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

    # ── Routers ──
    from app.auth.router import router as auth_router
    from app.trips.router import router as trips_router, public_router
    from app.stops.router import router as stops_router
    from app.catalog.router import router as catalog_router
    from app.itinerary.router import router as itinerary_router
    from app.budget.router import router as budget_router
    from app.admin.router import router as admin_router
    from app.community.router import router as community_router
    from app.bootstrap.router import router as bootstrap_router

    app.include_router(auth_router)
    app.include_router(trips_router)
    app.include_router(public_router)
    app.include_router(stops_router)
    app.include_router(catalog_router)
    app.include_router(itinerary_router)
    app.include_router(budget_router)
    app.include_router(admin_router)
    app.include_router(community_router)
    app.include_router(bootstrap_router)

    # ── Health check ──
    @app.get("/health", tags=["Health"])
    async def health_check():
        return {"status": "healthy", "app": settings.APP_NAME}

    return app


app = create_app()

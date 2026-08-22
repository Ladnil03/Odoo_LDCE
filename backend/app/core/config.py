"""Application configuration loaded from environment variables."""

from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Central configuration for the GlobeTrotter backend.

    All values are loaded from environment variables (or a .env file).
    """

    # ── Database ──
    DATABASE_URL: str = Field(
        default="sqlite+aiosqlite:///app.db",
        description="Neon DB async connection string (postgresql+asyncpg://...)",
    )

    # ── JWT ──
    SECRET_KEY: str = Field(
        default="dev-secret-key-change-in-production-1234567890",
        description="Secret key for signing JWT tokens",
    )
    ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30)
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7)

    # ── File uploads & Cloudinary ──
    UPLOAD_DIR: str = Field(default="./uploads")
    CLOUDINARY_CLOUD_NAME: str | None = Field(default=None)
    CLOUDINARY_API_KEY: str | None = Field(default=None)
    CLOUDINARY_API_SECRET: str | None = Field(default=None)
    CLOUDINARY_URL: str | None = Field(default=None)

    # ── CORS ──
    CORS_ORIGINS: str = Field(
        default="http://localhost:3000,http://localhost:5173",
        description="Comma-separated allowed origins",
    )

    # ── App ──
    APP_NAME: str = Field(default="GlobeTrotter")
    DEBUG: bool = Field(default=False)

    @property
    def async_database_url(self) -> str:
        """Ensure postgres connection string uses asyncpg driver."""
        raw_url = (self.DATABASE_URL or "").strip()
        if (raw_url.startswith('"') and raw_url.endswith('"')) or (
            raw_url.startswith("'") and raw_url.endswith("'")
        ):
            raw_url = raw_url[1:-1].strip()

        if not raw_url:
            return "sqlite+aiosqlite:///app.db"

        url = raw_url
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)

        if "postgresql+asyncpg://" in url:
            url = url.replace("sslmode=require", "ssl=require")
            url = url.replace("&channel_binding=require", "")
            url = url.replace("channel_binding=require&", "")
            url = url.replace("?channel_binding=require", "")
            url = url.replace("channel_binding=require", "")
            if url.endswith("?") or url.endswith("&"):
                url = url[:-1]
        return url

    @property
    def cors_origin_list(self) -> list[str]:
        """Parse comma-separated CORS origins into a list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


# Singleton – import this everywhere
settings = Settings()

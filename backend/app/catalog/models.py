"""City and Activity SQLAlchemy models with full-text search support."""

import uuid

from sqlalchemy import (
    Column,
    Computed,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import TSVECTOR
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class City(Base):
    """A travel destination city with searchable metadata."""

    __tablename__ = "cities"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    region: Mapped[str | None] = mapped_column(String(100), nullable=True)
    cost_index: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    popularity_score: Mapped[int] = mapped_column(Integer, nullable=False, default=50)
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lng: Mapped[float] = mapped_column(Float, nullable=False)

    # Full-text search vector — generated column (Postgres 12+)
    search_vector = Column(
        TSVECTOR,
        Computed("to_tsvector('english', name || ' ' || country || ' ' || coalesce(region, ''))", persisted=True),
    )

    # Relationships
    activities = relationship("Activity", back_populates="city", lazy="select")

    __table_args__ = (
        Index("idx_city_fts", "search_vector", postgresql_using="gin"),
    )

    def __repr__(self) -> str:
        return f"<City {self.name}, {self.country}>"


class Activity(Base):
    """A bookable or visitable activity within a city."""

    __tablename__ = "activities"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    city_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("cities.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # transport | stay | activity | food
    cost: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=60)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Full-text search vector
    search_vector = Column(
        TSVECTOR,
        Computed("to_tsvector('english', name || ' ' || coalesce(description, ''))", persisted=True),
    )

    # Relationships
    city = relationship("City", back_populates="activities")

    __table_args__ = (
        Index("idx_activity_fts", "search_vector", postgresql_using="gin"),
    )

    def __repr__(self) -> str:
        return f"<Activity {self.name!r} cost={self.cost} city={self.city_id}>"

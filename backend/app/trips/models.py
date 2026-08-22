"""Trip, TripShare, and TripCopy SQLAlchemy models."""

import uuid
from datetime import date, datetime

from sqlalchemy import ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Trip(Base):
    """A user's travel plan containing one or more stops."""

    __tablename__ = "trips"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    owner_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    start_date: Mapped[date | None] = mapped_column(nullable=True)
    end_date: Mapped[date | None] = mapped_column(nullable=True)
    cover_photo: Mapped[str | None] = mapped_column(String(500), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_public: Mapped[bool] = mapped_column(nullable=False, default=False)
    share_slug: Mapped[str | None] = mapped_column(
        String(21), unique=True, nullable=True, index=True
    )
    daily_budget: Mapped[float | None] = mapped_column(nullable=True)
    base_currency: Mapped[str] = mapped_column(
        String(3), nullable=False, default="USD"
    )
    deleted_at: Mapped[datetime | None] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        nullable=False, server_default=func.now()
    )

    # Relationships
    stops = relationship(
        "Stop",
        back_populates="trip",
        lazy="selectin",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    def __repr__(self) -> str:
        return f"<Trip {self.name!r} owner={self.owner_id}>"


class TripShare(Base):
    """Tracks sharing of a trip with other users or publicly."""

    __tablename__ = "trip_shares"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    trip_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True
    )
    shared_with_user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=True
    )
    permission: Mapped[str] = mapped_column(
        String(10), nullable=False, default="view"
    )  # "view" | "edit"
    created_at: Mapped[datetime] = mapped_column(
        nullable=False, server_default=func.now()
    )


class TripCopy(Base):
    """Audit log for trip copies (fork/clone)."""

    __tablename__ = "trip_copies"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    original_trip_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("trips.id", ondelete="SET NULL"), nullable=False
    )
    copied_trip_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("trips.id", ondelete="CASCADE"), nullable=False
    )
    copied_by: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    copied_at: Mapped[datetime] = mapped_column(
        nullable=False, server_default=func.now()
    )

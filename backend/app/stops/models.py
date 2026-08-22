"""Stop SQLAlchemy model."""

import uuid
from datetime import date

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Stop(Base):
    """A single stop (city visit) within a trip, ordered by order_index."""

    __tablename__ = "stops"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    trip_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True
    )
    city_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("cities.id", ondelete="RESTRICT"), nullable=False
    )
    order_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    arrival_date: Mapped[date | None] = mapped_column(nullable=True)
    departure_date: Mapped[date | None] = mapped_column(nullable=True)

    # Relationships
    trip = relationship("Trip", back_populates="stops")
    city = relationship("City", lazy="selectin")
    trip_activities = relationship(
        "TripActivity",
        back_populates="stop",
        lazy="selectin",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    def __repr__(self) -> str:
        return f"<Stop trip={self.trip_id} city={self.city_id} order={self.order_index}>"

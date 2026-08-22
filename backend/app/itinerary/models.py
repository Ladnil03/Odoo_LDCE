"""TripActivity SQLAlchemy model — links stops to activities with scheduling."""

import uuid
from datetime import date, time

from sqlalchemy import ForeignKey, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class TripActivity(Base):
    """An activity assigned to a stop within a trip's itinerary."""

    __tablename__ = "trip_activities"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    stop_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("stops.id", ondelete="CASCADE"), nullable=False, index=True
    )
    activity_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("activities.id", ondelete="RESTRICT"), nullable=False
    )
    scheduled_date: Mapped[date | None] = mapped_column(nullable=True)
    scheduled_time: Mapped[time | None] = mapped_column(nullable=True)
    cost_override: Mapped[float | None] = mapped_column(Float, nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Relationships
    stop = relationship("Stop", back_populates="trip_activities")
    activity = relationship("Activity", lazy="selectin")

    def __repr__(self) -> str:
        return f"<TripActivity stop={self.stop_id} activity={self.activity_id}>"

import enum
import uuid
from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.assessment_result import AssessmentResult
    from app.models.user import User


class AssessmentType(enum.StrEnum):
    TECHNICAL = "technical"
    SOFT = "soft"
    APTITUDE = "aptitude"
    COMPREHENSIVE = "comprehensive"


class AssessmentStatus(enum.StrEnum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class Assessment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "assessments"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    type: Mapped[AssessmentType] = mapped_column(
        Enum(AssessmentType, name="assessment_type"),
        nullable=False,
    )
    status: Mapped[AssessmentStatus] = mapped_column(
        Enum(AssessmentStatus, name="assessment_status"),
        default=AssessmentStatus.IN_PROGRESS,
        nullable=False,
    )
    taken_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )

    user: Mapped["User"] = relationship("User", back_populates="assessments")
    results: Mapped[list["AssessmentResult"]] = relationship(
        "AssessmentResult",
        back_populates="assessment",
        cascade="all, delete-orphan",
    )

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Float, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.assessment import Assessment
    from app.models.skill import Skill


class AssessmentResult(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "assessment_results"

    assessment_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("assessments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    skill_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("skills.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    score: Mapped[float] = mapped_column(Float, nullable=False)

    __table_args__ = (
        UniqueConstraint("assessment_id", "skill_id", name="uq_assessment_skill"),
    )

    assessment: Mapped["Assessment"] = relationship(
        "Assessment", back_populates="results"
    )
    skill: Mapped["Skill"] = relationship("Skill", back_populates="assessment_results")

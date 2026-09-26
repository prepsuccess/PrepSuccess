import enum
from typing import TYPE_CHECKING

from sqlalchemy import Enum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.assessment_result import AssessmentResult


class SkillCategory(enum.StrEnum):
    TECHNICAL = "technical"
    SOFT = "soft"
    APTITUDE = "aptitude"


class Skill(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "skills"

    name: Mapped[str] = mapped_column(
        String(100), unique=True, index=True, nullable=False
    )
    category: Mapped[SkillCategory] = mapped_column(
        Enum(SkillCategory, name="skill_category"),
        nullable=False,
        index=True,
    )
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)

    assessment_results: Mapped[list["AssessmentResult"]] = relationship(
        "AssessmentResult", back_populates="skill"
    )

import enum
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Enum, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.assessment import Assessment


class UserRole(enum.StrEnum):
    STUDENT = "student"
    MENTOR = "mentor"
    ADMIN = "admin"


class AuthProvider(enum.StrEnum):
    LOCAL = "local"
    GOOGLE = "google"


class Gender(enum.StrEnum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"


class User(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "users"

    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    mobile_no: Mapped[str | None] = mapped_column(String(20), nullable=True)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    gender: Mapped[Gender | None] = mapped_column(
        Enum(Gender, name="user_gender"),
        nullable=True,
    )
    student_year: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )  # 1, 2, 3, 4
    profile_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Auth Credentials & Provider
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    google_id: Mapped[str | None] = mapped_column(
        String(255), unique=True, index=True, nullable=True
    )
    auth_provider: Mapped[AuthProvider] = mapped_column(
        Enum(AuthProvider, name="auth_provider"),
        default=AuthProvider.LOCAL,
        nullable=False,
    )

    # Status & Roles (Default: STUDENT)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role"),
        default=UserRole.STUDENT,
        nullable=False,
    )
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_profile_completed: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )

    # Relationships
    assessments: Mapped[list["Assessment"]] = relationship(
        "Assessment", back_populates="user", cascade="all, delete-orphan"
    )

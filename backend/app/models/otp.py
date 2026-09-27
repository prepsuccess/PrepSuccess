import enum
from datetime import UTC, datetime

from sqlalchemy import Boolean, DateTime, Enum, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class OTPPurpose(enum.StrEnum):
    SIGNUP = "signup"
    PASSWORD_RESET = "password_reset"
    LOGIN = "login"


class EmailOTP(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "email_otps"

    email: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    otp_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    purpose: Mapped[OTPPurpose] = mapped_column(
        Enum(OTPPurpose, name="otp_purpose"),
        default=OTPPurpose.SIGNUP,
        nullable=False,
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )
    is_used: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    @property
    def is_expired(self) -> bool:
        return datetime.now(UTC) > self.expires_at

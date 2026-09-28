import hashlib
import secrets
from datetime import UTC, datetime, timedelta
from typing import Any

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings


def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt."""
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against the stored bcrypt hash."""
    pwd_bytes = plain_password.encode("utf-8")
    hash_bytes = hashed_password.encode("utf-8")
    return bcrypt.checkpw(pwd_bytes, hash_bytes)


# 2. Cryptographically Secure OTP Utilities
def generate_otp() -> str:
    """Generate a random 6-digit numeric OTP."""
    return f"{secrets.randbelow(900000) + 100000}"


def hash_otp(otp: str) -> str:
    """Hash an OTP code with SHA-256 for secure DB storage."""
    return hashlib.sha256(f"{otp}:{settings.JWT_SECRET_KEY}".encode()).hexdigest()


def verify_otp(plain_otp: str, hashed_otp: str) -> bool:
    """Verify if the user-supplied OTP matches the stored hash."""
    return hash_otp(plain_otp) == hashed_otp


# 3. JWT Token Generation & Verification
def create_access_token(
    subject: str | Any,
    role: str = "student",
    expires_delta: timedelta | None = None,
) -> str:
    """Create a short-lived JWT Access Token."""
    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode = {
        "sub": str(subject),
        "role": role,
        "type": "access",
        "exp": expire,
        "iat": datetime.now(UTC),
    }
    return jwt.encode(
        to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )


def create_refresh_token(
    subject: str | Any,
    expires_delta: timedelta | None = None,
) -> str:
    """Create a long-lived JWT Refresh Token."""
    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    to_encode = {
        "sub": str(subject),
        "type": "refresh",
        "exp": expire,
        "iat": datetime.now(UTC),
    }
    return jwt.encode(
        to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )


def decode_token(token: str) -> dict[str, Any] | None:
    """Decode and validate a JWT Token."""
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except JWTError:
        return None

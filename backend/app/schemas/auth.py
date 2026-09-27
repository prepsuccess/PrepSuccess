import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.user import AuthProvider, Gender, UserRole


# 1. Send OTP Schemas
class SendOTPRequest(BaseModel):
    email: EmailStr


class SendOTPResponse(BaseModel):
    success: bool = True
    message: str = "Verification OTP sent successfully to your email."
    email: str


# 2. User Registration Schema
class UserRegisterRequest(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str | None = Field(None, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    mobile_no: str | None = Field(None, max_length=20)
    age: int | None = Field(None, ge=15, le=100)
    gender: Gender | None = None
    student_year: int | None = Field(None, ge=1, le=5)
    profile_image_url: str | None = None
    otp: str = Field(..., min_length=6, max_length=6)


# 3. User Login Schema
class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


# 4. User Response Schema
class UserResponse(BaseModel):
    id: uuid.UUID
    first_name: str
    last_name: str | None = None
    email: str
    mobile_no: str | None = None
    age: int | None = None
    gender: str | None = None
    student_year: int | None = None
    profile_image_url: str | None = None
    role: UserRole
    auth_provider: AuthProvider
    is_verified: bool
    is_profile_completed: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# 5. Auth Token Response
class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

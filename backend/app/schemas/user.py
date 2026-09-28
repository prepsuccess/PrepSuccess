from pydantic import BaseModel, Field

from app.models.user import Gender


class UserUpdateRequest(BaseModel):
    """Schema for updating user profile attributes."""

    first_name: str | None = Field(None, min_length=1, max_length=100)
    last_name: str | None = Field(None, max_length=100)
    mobile_no: str | None = Field(None, max_length=20)
    age: int | None = Field(None, ge=15, le=100)
    gender: Gender | None = None
    student_year: int | None = Field(None, ge=1, le=5)
    profile_image_url: str | None = None
    is_profile_completed: bool | None = None

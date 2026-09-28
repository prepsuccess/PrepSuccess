from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    generate_otp,
    hash_otp,
    hash_password,
    verify_otp,
    verify_password,
)
from app.db.session import get_db
from app.models.otp import EmailOTP, OTPPurpose
from app.models.user import AuthProvider, User, UserRole
from app.schemas.auth import (
    SendOTPRequest,
    SendOTPResponse,
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from app.services.email_service import send_otp_email

router = APIRouter()


# 1. Send OTP Endpoint
@router.post(
    "/send-otp",
    response_model=SendOTPResponse,
    status_code=status.HTTP_200_OK,
    summary="Send Email Verification OTP",
)
async def send_verification_otp(
    payload: SendOTPRequest,
    background_tasks: BackgroundTasks,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    email = payload.email.strip().lower()

    # Check if user is already registered
    existing_user_stmt = select(User).where(User.email == email)
    existing_user = (await db.execute(existing_user_stmt)).scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists. Please log in.",
        )

    # Rate limiting: Check if an OTP was sent in the last 60 seconds
    recent_otp_stmt = (
        select(EmailOTP)
        .where(EmailOTP.email == email)
        .order_by(EmailOTP.created_at.desc())
        .limit(1)
    )
    recent_otp = (await db.execute(recent_otp_stmt)).scalar_one_or_none()
    if recent_otp and (datetime.now(UTC) - recent_otp.created_at).total_seconds() < 60:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Please wait 60 seconds before requesting another OTP.",
        )

    # Generate 6-digit OTP & Store Hash
    raw_otp = generate_otp()
    otp_record = EmailOTP(
        email=email,
        otp_hash=hash_otp(raw_otp),
        purpose=OTPPurpose.SIGNUP,
        expires_at=datetime.now(UTC) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES),
    )
    db.add(otp_record)
    await db.commit()

    # Dispatch email in background
    background_tasks.add_task(send_otp_email, to_email=email, otp=raw_otp)

    return SendOTPResponse(
        success=True,
        message=f"Verification OTP sent to {email}.",
        email=email,
    )


# 2. Register Endpoint
@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register New User with OTP Verification",
)
async def register_user(
    payload: UserRegisterRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    email = payload.email.strip().lower()

    # Check existing user
    existing_user_stmt = select(User).where(User.email == email)
    existing_user = (await db.execute(existing_user_stmt)).scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered. Please log in.",
        )

    # Verify OTP
    otp_stmt = (
        select(EmailOTP)
        .where(
            EmailOTP.email == email,
            EmailOTP.purpose == OTPPurpose.SIGNUP,
            EmailOTP.is_used.is_(False),
            EmailOTP.expires_at > datetime.now(UTC),
        )
        .order_by(EmailOTP.created_at.desc())
        .limit(1)
    )
    otp_record = (await db.execute(otp_stmt)).scalar_one_or_none()

    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP code. Please request a new OTP.",
        )

    if otp_record.attempts >= 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Too many failed OTP attempts. Please request a new OTP.",
        )

    if not verify_otp(payload.otp, otp_record.otp_hash):
        otp_record.attempts += 1
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect OTP code. Please try again.",
        )

    # Mark OTP as used
    otp_record.is_used = True

    # Create new User
    new_user = User(
        first_name=payload.first_name.strip(),
        last_name=payload.last_name.strip() if payload.last_name else None,
        email=email,
        password_hash=hash_password(payload.password),
        mobile_no=payload.mobile_no,
        age=payload.age,
        gender=payload.gender,
        student_year=payload.student_year,
        profile_image_url=payload.profile_image_url,
        role=UserRole.STUDENT,
        auth_provider=AuthProvider.LOCAL,
        is_verified=True,
        is_profile_completed=True,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Issue Tokens
    access_token = create_access_token(subject=new_user.id, role=new_user.role.value)
    refresh_token = create_refresh_token(subject=new_user.id)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user),
    )


# 3. Login Endpoint
@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Login with Email and Password",
)
async def login_user(
    payload: UserLoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    email = payload.email.strip().lower()

    # Query User
    user_stmt = select(User).where(User.email == email)
    user = (await db.execute(user_stmt)).scalar_one_or_none()

    # Check password
    if (
        not user
        or not user.password_hash
        or not verify_password(payload.password, user.password_hash)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact support.",
        )

    # Issue Tokens
    access_token = create_access_token(subject=user.id, role=user.role.value)
    refresh_token = create_refresh_token(subject=user.id)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


# 4. Get Current User Profile (/me)
@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Current Logged-in User Profile",
)
async def get_me(current_user: Annotated[User, Depends(get_current_user)]):
    return UserResponse.model_validate(current_user)

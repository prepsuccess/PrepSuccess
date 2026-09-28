import pytest
from httpx import AsyncClient

from app.core.security import hash_otp
from app.models.otp import EmailOTP, OTPPurpose


@pytest.mark.asyncio
async def test_send_otp_flow(async_client: AsyncClient):
    """Test requesting verification OTP for a new email."""
    response = await async_client.post(
        "/api/v1/auth/send-otp",
        json={"email": "student@example.com"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["email"] == "student@example.com"
    assert "Verification OTP sent" in data["message"]


@pytest.mark.asyncio
async def test_register_and_login_flow(async_client: AsyncClient):
    """Test full registration with OTP verification, login, and /me profile."""
    email = "ayush.student@example.com"

    # 1. Request OTP
    otp_resp = await async_client.post(
        "/api/v1/auth/send-otp",
        json={"email": email},
    )
    assert otp_resp.status_code == 200

    # In our test environment, we query the test database or mock to get the OTP
    # For testing, we can inject a known OTP record directly or use registration
    from datetime import UTC, datetime, timedelta

    from tests.conftest import TestingSessionLocal

    async with TestingSessionLocal() as session:
        known_otp = "123456"
        otp_rec = EmailOTP(
            email=email,
            otp_hash=hash_otp(known_otp),
            purpose=OTPPurpose.SIGNUP,
            expires_at=datetime.now(UTC) + timedelta(minutes=10),
        )
        session.add(otp_rec)
        await session.commit()

    # 2. Register with Valid OTP
    register_payload = {
        "first_name": "Ayush",
        "last_name": "Kumar",
        "email": email,
        "password": "SecurePassword123!",
        "mobile_no": "9876543210",
        "age": 21,
        "gender": "male",
        "student_year": 3,
        "otp": "123456",
    }
    reg_resp = await async_client.post(
        "/api/v1/auth/register",
        json=register_payload,
    )
    assert reg_resp.status_code == 201
    reg_data = reg_resp.json()
    assert "access_token" in reg_data
    assert "refresh_token" in reg_data
    assert reg_data["user"]["email"] == email
    assert reg_data["user"]["first_name"] == "Ayush"
    assert reg_data["user"]["is_verified"] is True

    access_token = reg_data["access_token"]

    # 3. Access Protected /me Endpoint
    me_resp = await async_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["email"] == email
    assert me_data["role"] == "student"

    # 4. Login with Registered Credentials
    login_resp = await async_client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "SecurePassword123!"},
    )
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    assert "access_token" in login_data

    # 5. Login with Wrong Password (Must Fail)
    wrong_login_resp = await async_client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "WrongPassword999"},
    )
    assert wrong_login_resp.status_code == 401
    assert "Invalid email or password" in wrong_login_resp.json()["detail"]


@pytest.mark.asyncio
async def test_register_invalid_otp_rejected(async_client: AsyncClient):
    """Test that registration with wrong OTP code is rejected."""
    payload = {
        "first_name": "Test",
        "email": "invalid.otp@example.com",
        "password": "Password123!",
        "otp": "000000",
    }
    resp = await async_client.post("/api/v1/auth/register", json=payload)
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_protected_route_without_token(async_client: AsyncClient):
    """Test that accessing /me without token returns 401 Unauthorized."""
    resp = await async_client.get("/api/v1/auth/me")
    assert resp.status_code == 401

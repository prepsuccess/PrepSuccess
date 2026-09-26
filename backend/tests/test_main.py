from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "Welcome to" in data["message"]
    assert "timestamp" in data


def test_liveness_probe():
    response = client.get("/health/live")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "alive"
    assert "timestamp" in data


def test_readiness_probe():
    response = client.get("/health/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert "timestamp" in data


def test_correlation_id_and_timing_headers():
    response = client.get("/")
    assert "x-request-id" in response.headers
    assert "x-process-time" in response.headers

    # Custom correlation ID propagation
    custom_id = "test-custom-request-id-123"
    custom_resp = client.get("/", headers={"X-Request-ID": custom_id})
    assert custom_resp.headers["x-request-id"] == custom_id

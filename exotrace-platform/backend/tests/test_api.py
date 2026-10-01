from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_endpoint_reports_service_state() -> None:
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json()["status"] == "online"


def test_mission_resources_are_marked_as_demo_data() -> None:
    response = client.get("/api/v1/missions/SAT-X01/overview")

    assert response.status_code == 200
    body = response.json()
    assert body["metadata"]["data_mode"] == "DEMO DATA"
    assert "not a validated" in body["metadata"]["disclaimer"]


def test_unknown_mission_is_not_served_from_demo_repository() -> None:
    response = client.get("/api/v1/missions/UNKNOWN/overview")

    assert response.status_code == 404


def test_hypotheses_cannot_be_marked_validated() -> None:
    response = client.get("/api/v1/missions/SAT-X01/hypotheses")

    assert response.status_code == 200
    assert all(item["validated"] is False for item in response.json()["hypotheses"])
    assert all(0 <= item["illustrative_score"] <= 1 for item in response.json()["hypotheses"])
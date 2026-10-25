"""API-level tests (HTTP layer) — no live model calls."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert "model" in r.json()


def test_ingredients_list():
    r = client.get("/api/ingredients")
    assert r.status_code == 200
    assert len(r.json()) >= 10


def test_ingredient_detail_404():
    r = client.get("/api/ingredients/does-not-exist")
    assert r.status_code == 404


def test_analyze_empty_candidate_is_more_information_needed():
    r = client.post(
        "/api/analyze",
        json={
            "candidate": {"id": "c", "name": "X", "brand": "", "category": "other", "ingredients": []},
            "existing_products": [],
            "morning": [],
            "evening": [],
        },
    )
    assert r.status_code == 200
    assert r.json()["recommendation"] == "more_information_needed"


def test_scan_rejects_non_image():
    r = client.post("/api/scan", files={"file": ("x.txt", b"not an image", "text/plain")})
    assert r.status_code == 400

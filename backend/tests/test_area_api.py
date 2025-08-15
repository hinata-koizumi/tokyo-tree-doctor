import base64
from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app


test_client = TestClient(app)


def _load_sample_image_b64() -> str:
    img_path = (
        Path(__file__).resolve().parents[2] / "ml" / "assets" / "images" / "test_image.jpg"
    )
    with img_path.open("rb") as f:
        return base64.b64encode(f.read()).decode("ascii")


def test_area_analysis_endpoint_success():
    payload = {
        "image_b64": _load_sample_image_b64(),
        "meta": {
            "gsd_m_per_px": 0.05,  # dummy 5 cm/px
            "yaw_deg": 0.0,
            "tile_side_m": 10.0,
        },
    }

    resp = test_client.post("/api/v1/analysis/analyze_area", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "tiles" in data
    assert isinstance(data["tiles"], list)
    # Each tile must contain expected keys
    if data["tiles"]:
        tile = data["tiles"][0]
        assert set(tile.keys()).issuperset(
            {"polygon", "veg_ratio", "class_label"},
        )


def test_area_analysis_endpoint_validation_error():
    # Missing image_b64
    payload = {
        "meta": {"gsd_m_per_px": 0.1, "yaw_deg": 0.0},
    }
    resp = test_client.post("/api/v1/analysis/analyze_area", json=payload)
    assert resp.status_code == 422

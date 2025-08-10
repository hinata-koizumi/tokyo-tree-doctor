from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


def test_analyze_endpoint_success():
    """分析APIが正常なレスポンスを返すかテストする"""
    response = client.post(
        "/api/v1/analysis/analyze",
        json={
            "tree_id": "test_tree_001",
            "latitude": 35.681236,
            "longitude": 139.767125,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["tree_id"] == "test_tree_001"
    assert "risk_score" in data
    assert "cause_analysis" in data
    assert "countermeasure" in data


def test_analyze_endpoint_validation_error():
    """不正なリクエストでバリデーションエラーが発生するかテストする"""
    response = client.post(
        "/api/v1/analysis/analyze",
        json={"tree_id": "test_tree_002"},  # 必須フィールドの緯度経度が欠けている
    )
    assert response.status_code == 422  # Unprocessable Entity


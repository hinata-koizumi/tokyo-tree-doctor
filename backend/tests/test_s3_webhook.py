from __future__ import annotations

import json
from contextlib import contextmanager
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.base import Base
from app.models.analysis import AnalysisJob
import app.services.ingest_service as ingest_service


@contextmanager
def override_db():
    import tempfile, os
    tmp = tempfile.NamedTemporaryFile(suffix='.db', delete=False)
    url = f"sqlite:///{tmp.name}"
    engine = create_engine(url, connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    Base.metadata.create_all(bind=engine)

    # Monkeypatch global SessionLocal used by services
    import app.db.config as cfg  # noqa: E402

    original_cfg_session = cfg.SessionLocal
    original_ingest_session = ingest_service.SessionLocal  # noqa: WPS110

    cfg.SessionLocal = TestingSessionLocal
    ingest_service.SessionLocal = TestingSessionLocal  # type: ignore[assignment]

    try:
        yield TestingSessionLocal()
    finally:
        cfg.SessionLocal = original_cfg_session
        ingest_service.SessionLocal = original_ingest_session  # restore
        Base.metadata.drop_all(bind=engine)
        engine.dispose()
        tmp.close()
        os.unlink(tmp.name)


def _sample_s3_event(bucket: str, key: str):
    return {
        "Records": [
            {
                "s3": {
                    "bucket": {"name": bucket},
                    "object": {"key": key},
                }
            }
        ]
    }


def test_s3_webhook_creates_job():
    with override_db() as db:
        client = TestClient(app)
        payload = _sample_s3_event("test-bucket", "images/test.jpg")
        resp = client.post("/api/v1/analysis/s3/webhook", json=payload)
        assert resp.status_code == 204

        # verify job created
        jobs = db.query(AnalysisJob).all()
        assert len(jobs) == 1
        assert jobs[0].image_url == "https://test-bucket.s3.amazonaws.com/images/test.jpg"

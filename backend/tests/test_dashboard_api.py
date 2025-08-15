import os
from contextlib import contextmanager

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.base import Base
from app.models.analysis import AreaTile


@contextmanager
def override_db():
    import tempfile, os
    tmp = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
    url = f"sqlite:///{tmp.name}"
    engine = create_engine(url, connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

    # Create tables in this new shared-memory DB
    Base.metadata.create_all(bind=engine)

    # Patch SessionLocal used across application
    import app.db.config as cfg  # noqa: E402
    original_session_local = cfg.SessionLocal
    cfg.SessionLocal = TestingSessionLocal

    # Patch aggregate_service.SessionLocal
    import importlib, app.services.aggregate_service as agg  # noqa: E402
    agg = importlib.reload(agg)
    agg.SessionLocal = TestingSessionLocal  # type: ignore[assignment]
    # No need to recreate tables again; already created with same engine
    try:
        yield TestingSessionLocal()
    finally:
        cfg.SessionLocal = original_session_local
        Base.metadata.drop_all(bind=engine)
        engine.dispose()
        tmp.close()
        os.unlink(tmp.name)


def test_dashboard_summary():
    with override_db() as db:
        # insert tiles
        db.add_all([
            AreaTile(class_label="危険"),
            AreaTile(class_label="危険"),
            AreaTile(class_label="要注意"),
            AreaTile(class_label="健康"),
        ])
        db.commit()

        client = TestClient(app)
        resp = client.get("/api/v1/dashboard/summary")
        assert resp.status_code == 200
        data = resp.json()
        assert data == {"danger": 2, "warning": 1, "safe": 1, "total": 4}

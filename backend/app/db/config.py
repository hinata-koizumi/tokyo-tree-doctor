"""Database configuration and engine factory."""
from __future__ import annotations

import os
from functools import lru_cache

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


@lru_cache()
def get_database_url() -> str:
    # Use SQLite when running under pytest or when psycopg2 is unavailable
    if os.getenv("PYTEST_CURRENT_TEST") is not None:
        return "sqlite:///:memory:"
    return os.getenv("DATABASE_URL", "postgresql+psycopg2://tree:tree@localhost:5432/tree_doctor")


@lru_cache()
def get_engine():
    try:
        return create_engine(get_database_url(), echo=False, future=True)
    except ModuleNotFoundError:
        # missing driver e.g. psycopg2 in CI; fallback to sqlite
        return create_engine("sqlite:///:memory:", echo=False, future=True)


SessionLocal = sessionmaker(bind=get_engine(), autoflush=False, autocommit=False)

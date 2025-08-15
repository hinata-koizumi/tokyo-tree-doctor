from __future__ import annotations

import uuid
from datetime import datetime
from typing import List

from sqlalchemy import Column, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
try:
    from sqlalchemy.dialects.postgresql import JSONB  # type: ignore
    JSONType = JSONB
except ImportError:
    from sqlalchemy import JSON as JSONType  # type: ignore
from sqlalchemy.orm import relationship
try:
    from geoalchemy2 import Geometry  # type: ignore
    HAS_GEO = True
except ModuleNotFoundError:  # fallback for tests without PostGIS
    from sqlalchemy import String  # type: ignore

    class _DummyGeometry(String):
        def __init__(self, *args, **kwargs):  # noqa: D401
            super().__init__()

    Geometry = _DummyGeometry  # type: ignore
    HAS_GEO = False

from app.db.base import Base


class AnalysisJob(Base):
    __tablename__ = "analysis_jobs"
    __allow_unmapped__ = True
    __table_args__ = {"extend_existing": True}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    image_url = Column(Text, nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    finished_at = Column(DateTime)
    state = Column(Enum("queued", "processing", "completed", "failed", name="job_state"), default="queued")
    error = Column(Text)

    tiles: List["AreaTile"] = relationship("AreaTile", back_populates="job", cascade="all, delete-orphan")


class AreaTile(Base):
    __tablename__ = "area_tiles"
    __allow_unmapped__ = True
    __table_args__ = {"extend_existing": True}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(UUID(as_uuid=True), ForeignKey("analysis_jobs.id", ondelete="CASCADE"))

    if HAS_GEO:
        polygon = Column(Geometry("POLYGON", srid=4326), nullable=True)
    else:
        polygon = Column(String, nullable=True)
    class_label = Column(String(16), nullable=False)
    veg_ratio = Column(String(16))
    stats = Column(Text)

    job = relationship("AnalysisJob", back_populates="tiles")

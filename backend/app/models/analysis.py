from __future__ import annotations

import os
import uuid
from datetime import datetime
from typing import List

from sqlalchemy import Column, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID

# JSON type compatibility (PostgreSQL vs SQLite)
try:
    from sqlalchemy.dialects.postgresql import JSONB  # type: ignore

    JSONType = JSONB
except ImportError:  # SQLite fallback
    from sqlalchemy import JSON as JSONType  # type: ignore

from sqlalchemy.orm import relationship

# Optional spatial column support (PostGIS only)
try:
    from geoalchemy2 import Geometry  # type: ignore

    _geo_available = True
except ModuleNotFoundError:
    _geo_available = False

# Enable geometry column only when explicitly requested (e.g., production PostGIS)
USE_GEO = _geo_available and os.getenv("ENABLE_POSTGIS", "0") == "1"

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

    if USE_GEO:
        polygon = Column(Geometry("POLYGON", srid=4326), nullable=True)
    else:
        polygon = Column(String, nullable=True)
    class_label = Column(String(16), nullable=False)
    veg_ratio = Column(String(16))
    stats = Column(Text)

    job = relationship("AnalysisJob", back_populates="tiles")

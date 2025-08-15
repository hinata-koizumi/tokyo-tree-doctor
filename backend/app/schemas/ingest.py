"""Schemas for asynchronous image ingest & processing jobs."""
from __future__ import annotations

import uuid
from typing import Optional

from pydantic import BaseModel, Field

from .area import ImageMeta, AreaAnalysisOutput


class IngestRequest(BaseModel):
    """Webhook style request to submit an image for analysis."""

    image_url: str = Field(..., description="Publicly reachable URL of the image (JPEG/PNG)")
    meta: ImageMeta = Field(..., description="Image metadata required for analysis")


class IngestResponse(BaseModel):
    job_id: str = Field(..., description="Assigned job identifier")
    status_endpoint: str

    @classmethod
    def create(cls, job_id: uuid.UUID) -> "IngestResponse":
        return cls(
            job_id=str(job_id),
            status_endpoint=f"/api/v1/analysis/status/{job_id}",
        )


class JobStatus(BaseModel):
    job_id: str
    state: str = Field(..., description="processing|completed|failed")
    result: Optional[AreaAnalysisOutput] = None
    error: Optional[str] = None

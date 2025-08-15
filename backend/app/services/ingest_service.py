"""Asynchronous ingestion & processing service (in-process PoC)."""
from __future__ import annotations

import base64
import uuid
from pathlib import Path
from typing import Dict

import requests
import numpy as np
import cv2

try:
    from rq import Queue  # type: ignore
    from redis import Redis  # type: ignore
    import os
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    redis_conn = Redis.from_url(redis_url)
    queue: Queue | None = Queue("analysis", connection=redis_conn)
except ModuleNotFoundError:  # fallback for test env
    Queue = None  # type: ignore
    queue = None

from app.schemas.ingest import IngestRequest, JobStatus
from app.db.config import SessionLocal
from app.models.analysis import AnalysisJob
if queue is not None:
    from app.jobs.tasks import analyze_job  # noqa: WPS433


def _download_image(url: str) -> np.ndarray:  # noqa: WPS231
    """Download image from URL into OpenCV BGR array."""

    resp = requests.get(url, timeout=15)
    resp.raise_for_status()
    data = np.frombuffer(resp.content, dtype=np.uint8)
    img = cv2.imdecode(data, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Failed to decode image from URL")
    return img


def submit_job(ingest_req: IngestRequest):
    session = SessionLocal()
    job = AnalysisJob(image_url=ingest_req.image_url, state="queued")
    session.add(job)
    session.commit()
    # enqueue if RQ available
    if queue is not None:
        try:
            queue.enqueue(analyze_job, str(job.id))
        except Exception:  # noqa: BLE001
            job.state = "failed"
            job.error = "queue error"
            session.commit()
    job_id = job.id
    session.close()
    return job_id


def get_job_status(job_id: str) -> JobStatus:
    session = SessionLocal()
    job = session.get(AnalysisJob, job_id)
    if not job:
        session.close()
        return None  # type: ignore[return-value]
    result = JobStatus(job_id=str(job.id), state=job.state, error=job.error)
    session.close()
    return result

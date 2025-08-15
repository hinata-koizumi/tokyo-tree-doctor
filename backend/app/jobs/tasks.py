from __future__ import annotations

import base64
from datetime import datetime
from typing import List

import requests
import numpy as np
import cv2
from redis import Redis
from sqlalchemy.orm import Session

from app.db.config import SessionLocal
from app.models.analysis import AnalysisJob, AreaTile
from app.schemas.area import AreaAnalysisInput
from app.services.ml_service import get_area_analysis


redis_conn = Redis.from_url("redis://localhost:6379/0")


def _download_image(url: str) -> np.ndarray:
    resp = requests.get(url, timeout=20)
    resp.raise_for_status()
    data = np.frombuffer(resp.content, dtype=np.uint8)
    img = cv2.imdecode(data, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("decode failed")
    return img


def analyze_job(job_uuid: str):  # noqa: WPS231
    """RQ task: run analysis and store tiles."""

    session: Session = SessionLocal()
    try:
        job: AnalysisJob = session.query(AnalysisJob).get(job_uuid)
        if not job:
            return
        job.state = "processing"
        session.commit()

        img_bgr = _download_image(job.image_url)
        img_b64 = base64.b64encode(cv2.imencode(".jpg", img_bgr)[1]).decode()
        meta = {
            "gsd_m_per_px": 0.05,
            "yaw_deg": 0.0,
            "tile_side_m": 20.0,
        }
        area_input = AreaAnalysisInput(image_b64=img_b64, meta=meta)  # type: ignore[arg-type]
        import asyncio
        result = asyncio.run(get_area_analysis(area_input))  # execute async function

        tiles: List[AreaTile] = []
        for t in result.tiles:
            import json
            tile = AreaTile(
                job_id=job.id,
                class_label=t.class_label,
                veg_ratio=str(t.veg_ratio),
                polygon='POLYGON EMPTY',
                stats=json.dumps(t.model_dump()),
            )
            tiles.append(tile)
        session.add_all(tiles)
        job.state = "completed"
        job.finished_at = datetime.utcnow()
        session.commit()
    except Exception as exc:  # noqa: BLE001
        job.state = "failed"
        job.error = str(exc)
        session.commit()
        raise
    finally:
        session.close()

from fastapi import APIRouter, BackgroundTasks, HTTPException
from fastapi import Request, Response

from app.schemas.ingest import IngestRequest, IngestResponse, JobStatus
from app.services import ingest_service

router = APIRouter()


@router.post("/submit", response_model=IngestResponse)
async def submit_image(ingest_req: IngestRequest):
    job_uuid = ingest_service.submit_job(ingest_req)
    return IngestResponse.create(job_uuid)


@router.get("/status/{job_id}", response_model=JobStatus)
async def job_status(job_id: str):
    status = ingest_service.get_job_status(job_id)
    if not status:
        raise HTTPException(status_code=404, detail="Job not found")
    return status


# --- S3 Event Webhook -------------------------------------------------------

from app.schemas.area import ImageMeta  # noqa: E402  # circular safe here


DEFAULT_META = ImageMeta(
    gsd_m_per_px=0.05,
    yaw_deg=0.0,
    center_lat=0.0,
    center_lon=0.0,
    tile_side_m=20.0,
)


@router.post("/s3/webhook", status_code=204)
async def s3_event_webhook(request: Request):  # noqa: WPS231
    """Receive AWS S3 event notification and enqueue analysis jobs.

    S3 can be configured to send event notifications to HTTPS endpoints via
    Amazon SNS subscription or EventBridge. The payload conforms to the
    AWS documentation: https://docs.aws.amazon.com/AmazonS3/latest/userguide/notification-content-structure.html
    """

    payload = await request.json()
    records = payload.get("Records", [])
    for rec in records:
        try:
            bucket = rec["s3"]["bucket"]["name"]
            key = rec["s3"]["object"]["key"]
        except KeyError:  # noqa: WPS110
            continue  # skip malformed record

        # S3 object key may be URL-encoded in event; decode plus-specific spaces
        from urllib.parse import unquote_plus  # local import to avoid global cost

        key = unquote_plus(key)
        image_url = f"https://{bucket}.s3.amazonaws.com/{key}"

        ingest_service.submit_job(
            IngestRequest(
                image_url=image_url,
                meta=DEFAULT_META,
            ),
        )

    return Response(status_code=204)

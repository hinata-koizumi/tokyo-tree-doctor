from fastapi import APIRouter
from app.schemas.dashboard import SummaryKPI
from app.services.aggregate_service import get_summary_kpi

router = APIRouter()


@router.get("/summary", response_model=SummaryKPI)
async def summary_kpi():
    return get_summary_kpi()

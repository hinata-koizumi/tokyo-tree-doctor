from fastapi import APIRouter, HTTPException
from app.schemas.area import AreaAnalysisInput, AreaAnalysisOutput
from app.services import ml_service

router = APIRouter()


@router.post("/analyze_area", response_model=AreaAnalysisOutput)
async def analyze_area(input_data: AreaAnalysisInput):
    """Endpoint: analyze drone image and return per-tile results."""

    try:
        result = await ml_service.get_area_analysis(input_data)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return result

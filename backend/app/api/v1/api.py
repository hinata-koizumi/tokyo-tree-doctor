from fastapi import APIRouter
from .endpoints import area_analysis, ingest, dashboard


api_router = APIRouter()
api_router.include_router(area_analysis.router, prefix="/analysis", tags=["analysis"])
api_router.include_router(ingest.router, prefix="/analysis", tags=["analysis"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])


"""Area (tile-based) analysis schemas."""
from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class ImageMeta(BaseModel):
    """Metadata about the captured image required for analysis."""

    gsd_m_per_px: float = Field(..., description="Ground sample distance [m/px]")
    yaw_deg: float = Field(0.0, description="Yaw angle clockwise degrees (0 = image +X east)")
    tile_side_m: float = Field(20.0, description="Tile side length in metres")


class AreaAnalysisInput(BaseModel):
    """Request model for area analysis."""

    image_b64: str = Field(..., description="B64‐encoded image (JPEG/PNG)")
    meta: ImageMeta


class TileAnalysis(BaseModel):
    """Per‐tile analysis results returned to the client."""

    polygon: List[List[int]] = Field(..., description="4×2 list of integer pixel coordinates [[x,y],...] in image space")
    veg_ratio: float
    n_mask: int
    n_veg: int
    vari_median: Optional[float]
    vari_mean: Optional[float]
    vari_std: Optional[float]
    vari_min: Optional[float]
    vari_max: Optional[float]
    class_label: str = Field(..., description="健康/要注意/危険/N/A")


class AreaAnalysisOutput(BaseModel):
    """Full response model: list of tile analyses."""

    tiles: List[TileAnalysis]

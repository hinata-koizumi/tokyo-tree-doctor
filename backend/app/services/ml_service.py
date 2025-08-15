
# risk score support removed; focus on area analysis
from ml.analyzer import analyze_image_tiles, ImageMeta as AnalyzerMeta  # noqa: E402
from app.schemas.area import AreaAnalysisInput, AreaAnalysisOutput, TileAnalysis  # noqa: E402
import base64  # noqa: E402
import numpy as np  # noqa: E402
import cv2  # noqa: E402


async def get_area_analysis(area_input: AreaAnalysisInput) -> AreaAnalysisOutput:  # noqa: D401
    """Run tile-based area analysis and return tiles list."""

    # --- Decode image ---
    img_bytes = base64.b64decode(area_input.image_b64)
    img_np = np.frombuffer(img_bytes, dtype=np.uint8)
    img_bgr = cv2.imdecode(img_np, cv2.IMREAD_COLOR)
    if img_bgr is None:
        raise ValueError("Failed to decode input image")

    meta_in = area_input.meta
    analyzer_meta = AnalyzerMeta(
        gsd_m_per_px=meta_in.gsd_m_per_px,
        yaw_deg=meta_in.yaw_deg,
    )

    tile_results = analyze_image_tiles(
        img_bgr,
        analyzer_meta,
        tile_side_m=meta_in.tile_side_m,
    )

    tiles_out = [
        TileAnalysis(
            polygon=res.poly_px.tolist(),
            veg_ratio=res.veg_ratio,
            n_mask=res.n_mask,
            n_veg=res.n_veg,
            vari_median=res.vari_median,
            vari_mean=res.vari_mean,
            vari_std=res.vari_std,
            vari_min=res.vari_min,
            vari_max=res.vari_max,
            class_label=res.class_label,
        )
        for res in tile_results
    ]

    return AreaAnalysisOutput(tiles=tiles_out)


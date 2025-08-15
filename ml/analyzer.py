"""ml.analyzer
---------------------------------
Reusable functions for tile-based vegetation analysis & risk classification.
Derived from the exploratory notebook (`tests/EDA/detect_RGB_from_images.ipynb`).
The implementation purposefully keeps external deps minimal (numpy & opencv).
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Tuple, Dict

import math

import cv2
import numpy as np

# Threshold / config constants are centralised in ml.config.config
from .config.config import (  # noqa: WPS437
    VARI_HEALTHY_MIN,
    VARI_WARN_MIN,
    VARI_WARN_SPLIT,
    MIN_VEG_RATIO_VALID,
    MIN_VEG_PIXELS_ABS,
    MIN_VEG_PIXELS_REL,
)

__all__ = [
    "ImageMeta",
    "TileResult",
    "analyze_image_tiles",
]


@dataclass
class ImageMeta:
    """Metadata necessary for geo-aware tiling.

    Currently used items are minimal. Extra fields (lat/lon, yaw, etc.) can be
    added later without breaking callers.
    """

    gsd_m_per_px: float  # ground sample distance (metre / pixel)
    yaw_deg: float = 0.0  # clockwise, image X axis → East when 0


@dataclass
class TileResult:
    """Result per tile returned by :func:`analyze_image_tiles`."""

    poly_px: np.ndarray  # (4,2) int32 corner coordinates in image space (x, y)
    veg_ratio: float
    n_mask: int
    n_veg: int
    vari_median: float | None
    vari_mean: float | None
    vari_std: float | None
    vari_min: float | None
    vari_max: float | None
    class_label: str  # "健康" / "要注意" / "危険" / "N/A"

    def as_dict(self) -> Dict[str, object]:
        """Helper to JSON-serialise the result."""

        return {
            "polygon": self.poly_px.tolist(),
            "veg_ratio": self.veg_ratio,
            "n_mask": self.n_mask,
            "n_veg": self.n_veg,
            "vari_median": self.vari_median,
            "vari_mean": self.vari_mean,
            "vari_std": self.vari_std,
            "vari_min": self.vari_min,
            "vari_max": self.vari_max,
            "class": self.class_label,
        }


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _srgb_to_linear(x: np.ndarray) -> np.ndarray:
    """Convert sRGB (0-1 float) -> linear RGB."""

    a = 0.055
    return np.where(x <= 0.04045, x / 12.92, ((x + a) / (1 + a)) ** 2.4)


def _compute_vari(linear_rgb: np.ndarray) -> np.ndarray:
    """Compute Visible Atmospherically Resistant Index (VARI).

    VARI  = (G - R) / (G + R - B)
    """

    R, G, B = (
        linear_rgb[..., 0],
        linear_rgb[..., 1],
        linear_rgb[..., 2],
    )
    denom = G + R - B
    return np.clip((G - R) / np.maximum(denom, 1e-6), -2.0, 2.0)


def _vegetation_mask(linear_rgb: np.ndarray, vari: np.ndarray) -> np.ndarray:  # noqa: WPS231
    """Create a boolean vegetation mask (heuristic).

    Combines VARI and ExG thresholds similarly to the original notebook. HSV &
    LAB tests are omitted for performance – they can be re-added if needed.
    """

    cond_var = vari > 0.02

    # Excess Green (ExG) based test – works reasonably well across lighting.
    sum_rgb = (
        linear_rgb[..., 0]
        + linear_rgb[..., 1]
        + linear_rgb[..., 2]
        + 1e-6
    )
    r = linear_rgb[..., 0] / sum_rgb
    g = linear_rgb[..., 1] / sum_rgb
    b = linear_rgb[..., 2] / sum_rgb
    exg = 2 * g - r - b
    cond_exg = exg > 0.03

    return cond_var | cond_exg


# ---------------------------------------------------------------------------
# Public main API
# ---------------------------------------------------------------------------


def analyze_image_tiles(
    img_bgr: np.ndarray,
    meta: ImageMeta,
    tile_side_m: float = 20.0,
) -> List[TileResult]:  # noqa: WPS231
    """Analyze image in fixed-size square tiles.

    Parameters
    ----------
    img_bgr
        OpenCV BGR image (uint8).
    meta
        Ground sample distance (metre/pixel) and yaw.
    tile_side_m
        Tile side length in metre (default 20 m).

    Returns
    -------
    List[TileResult]
        List length ≈ (image_area / tile_area). Order is row-major.
    """

    if img_bgr.ndim != 3 or img_bgr.shape[2] != 3:
        raise ValueError("Expected BGR colour image with shape (H,W,3)")

    # Convert colour spaces up front
    arr = img_bgr.astype(np.float32) / 255.0
    lin = _srgb_to_linear(arr)
    vari = _compute_vari(lin)
    veg = _vegetation_mask(lin, vari)

    H, W = img_bgr.shape[:2]

    # Yaw != 0 currently unsupported (would require rotated tiles)
    if abs(meta.yaw_deg) > 1e-2:
        raise NotImplementedError("Rotated tiling not yet supported")

    tile_px = max(1, int(round(tile_side_m / meta.gsd_m_per_px)))
    results: List[TileResult] = []

    # Iterate over tiles row-major
    for y0 in range(0, H, tile_px):
        y1 = min(H, y0 + tile_px)
        if y1 - y0 < 4:  # ignore slivers
            continue
        for x0 in range(0, W, tile_px):
            x1 = min(W, x0 + tile_px)
            if x1 - x0 < 4:
                continue

            # Build bounding mask
            tile_mask = np.ones((y1 - y0, x1 - x0), dtype=bool)
            veg_roi = veg[y0:y1, x0:x1]
            vari_roi = vari[y0:y1, x0:x1]

            sel_mask = tile_mask & veg_roi
            n_mask = int(tile_mask.sum())
            n_veg = int(sel_mask.sum())
            veg_ratio = (n_veg / n_mask) if n_mask else 0.0
            min_count = max(
                MIN_VEG_PIXELS_ABS,
                int(MIN_VEG_PIXELS_REL * n_mask),
            )

            valid = (n_veg >= min_count) and (
                veg_ratio >= MIN_VEG_RATIO_VALID
            )

            if not valid:
                vari_median = vari_mean = vari_std = vari_min = vari_max = None
                class_label = "N/A"
            else:
                vari_sel = vari_roi[sel_mask]
                vari_median = float(np.nanmedian(vari_sel))
                vari_mean = float(np.nanmean(vari_sel))
                vari_std = float(np.nanstd(vari_sel, ddof=0))
                vari_min = float(np.nanmin(vari_sel))
                vari_max = float(np.nanmax(vari_sel))

                v = vari_median
                if v >= VARI_HEALTHY_MIN:
                    class_label = "健康"
                elif v < VARI_WARN_MIN:
                    class_label = "危険"
                elif v < VARI_WARN_SPLIT:
                    class_label = "危険"
                else:
                    class_label = "要注意"

            poly = np.array(
                [
                    [x0, y0],
                    [x1 - 1, y0],
                    [x1 - 1, y1 - 1],
                    [x0, y1 - 1],
                ],
                dtype=np.int32,
            )

            results.append(
                TileResult(
                    poly_px=poly,
                    veg_ratio=float(veg_ratio),
                    n_mask=n_mask,
                    n_veg=n_veg,
                    vari_median=vari_median,
                    vari_mean=vari_mean,
                    vari_std=vari_std,
                    vari_min=vari_min,
                    vari_max=vari_max,
                    class_label=class_label,
                ),
            )

    return results

"""
VARI分析システム

ドローン画像からVARI値を計算し、木の健康状態を判定するモジュール
tokyo-tree-doctorの実装を基に作成
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Dict, Optional
import logging

import cv2
import numpy as np

from .config import (
    VARI_HEALTHY_MIN,
    VARI_WARN_MIN,
    VARI_WARN_SPLIT,
    MIN_VEG_RATIO_VALID,
    MIN_VEG_PIXELS_ABS,
    MIN_VEG_PIXELS_REL,
)

logger = logging.getLogger(__name__)

__all__ = [
    "ImageMeta",
    "TileResult",
    "VARIAnalyzer",
    "analyze_image_tiles",
]


@dataclass
class ImageMeta:
    """画像メタデータ（地理情報対応）
    
    現在は最小限の項目。後で緯度・経度・ヨー角などを追加可能
    """
    gsd_m_per_px: float  # 地上サンプル距離（メートル/ピクセル）
    yaw_deg: float = 0.0  # 時計回り、画像X軸→東方向が0度


@dataclass
class TileResult:
    """タイル分析結果"""
    poly_px: np.ndarray  # (4,2) int32 画像座標系での角座標 (x, y)
    veg_ratio: float  # 植生比率
    n_mask: int  # マスク内の総画素数
    n_veg: int  # 植生画素数
    vari_median: Optional[float]  # VARI中央値
    vari_mean: Optional[float]  # VARI平均値
    vari_std: Optional[float]  # VARI標準偏差
    vari_min: Optional[float]  # VARI最小値
    vari_max: Optional[float]  # VARI最大値
    class_label: str  # "健康" / "要注意" / "危険" / "N/A"

    def as_dict(self) -> Dict[str, object]:
        """JSONシリアライズ用の辞書に変換"""
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


class VARIAnalyzer:
    """VARI分析クラス"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def analyze_image(self, 
                     img_bgr: np.ndarray, 
                     meta: ImageMeta, 
                     tile_side_m: float = 20.0) -> List[TileResult]:
        """
        画像を固定サイズのタイルに分割して分析
        
        Args:
            img_bgr: OpenCV BGR画像 (uint8)
            meta: 地上サンプル距離とヨー角
            tile_side_m: タイルの辺長（メートル、デフォルト20m）
            
        Returns:
            TileResultのリスト（タイル数分）
        """
        return analyze_image_tiles(img_bgr, meta, tile_side_m)


# ---------------------------------------------------------------------------
# 内部ヘルパー関数
# ---------------------------------------------------------------------------


def _srgb_to_linear(x: np.ndarray) -> np.ndarray:
    """sRGB (0-1 float) → linear RGB に変換"""
    a = 0.055
    return np.where(x <= 0.04045, x / 12.92, ((x + a) / (1 + a)) ** 2.4)


def _compute_vari(linear_rgb: np.ndarray) -> np.ndarray:
    """Visible Atmospherically Resistant Index (VARI) を計算
    
    VARI = (G - R) / (G + R - B)
    """
    R, G, B = (
        linear_rgb[..., 0],
        linear_rgb[..., 1],
        linear_rgb[..., 2],
    )
    denom = G + R - B
    return np.clip((G - R) / np.maximum(denom, 1e-6), -2.0, 2.0)


def _vegetation_mask(linear_rgb: np.ndarray, vari: np.ndarray) -> np.ndarray:
    """植生マスクを作成（ヒューリスティック）
    
    VARIとExG閾値を組み合わせて植生を検出。
    パフォーマンスのためHSV & LABテストは省略
    """
    cond_var = vari > 0.02

    # Excess Green (ExG) ベースのテスト - 照明条件に比較的強い
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
# 公開API
# ---------------------------------------------------------------------------


def analyze_image_tiles(
    img_bgr: np.ndarray,
    meta: ImageMeta,
    tile_side_m: float = 20.0,
) -> List[TileResult]:
    """画像を固定サイズのタイルに分割して分析
    
    Parameters
    ----------
    img_bgr
        OpenCV BGR画像 (uint8)
    meta
        地上サンプル距離（メートル/ピクセル）とヨー角
    tile_side_m
        タイルの辺長（メートル、デフォルト20m）
        
    Returns
    -------
    List[TileResult]
        タイル数分の結果リスト。行優先順序
    """
    if img_bgr.ndim != 3 or img_bgr.shape[2] != 3:
        raise ValueError("BGRカラー画像 (H,W,3) が必要です")

    # 色空間変換を先に実行
    arr = img_bgr.astype(np.float32) / 255.0
    lin = _srgb_to_linear(arr)
    vari = _compute_vari(lin)
    veg = _vegetation_mask(lin, vari)

    H, W = img_bgr.shape[:2]

    # ヨー角 != 0 は現在未サポート（回転タイルが必要）
    if abs(meta.yaw_deg) > 1e-2:
        raise NotImplementedError("回転タイルはまだサポートされていません")

    tile_px = max(1, int(round(tile_side_m / meta.gsd_m_per_px)))
    results: List[TileResult] = []

    # 行優先でタイルを反復
    for y0 in range(0, H, tile_px):
        y1 = min(H, y0 + tile_px)
        if y1 - y0 < 4:  # 細いスライバーは無視
            continue
        for x0 in range(0, W, tile_px):
            x1 = min(W, x0 + tile_px)
            if x1 - x0 < 4:
                continue

            # 境界マスクを構築
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

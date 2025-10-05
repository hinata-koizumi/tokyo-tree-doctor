"""
画像前処理システム

ドローン画像の自動受信、画像正規化・品質チェック、RGB値の正確な抽出を行うモジュール
"""

import os
import tempfile
import logging
from typing import Optional, Tuple, Dict, Any
from datetime import datetime

import cv2
import numpy as np
from PIL import Image, ImageEnhance

from .config import (
    IMAGE_MAX_SIZE,
    SUPPORTED_FORMATS,
    DEFAULT_GSD_M_PER_PX
)
from .quality_checker import ImageQualityChecker

logger = logging.getLogger(__name__)


class ImageProcessor:
    """画像前処理クラス"""
    
    def __init__(self):
        self.quality_checker = ImageQualityChecker()
        self.logger = logging.getLogger(__name__)
    
    def process_drone_image(self, 
                           image_path: str,
                           drone_metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        ドローン画像の前処理を実行
        
        Args:
            image_path: 画像ファイルパス
            drone_metadata: ドローンからのメタデータ
            
        Returns:
            処理結果の辞書
        """
        try:
            # 1. 画像読み込み
            self.logger.info(f"画像読み込み開始: {image_path}")
            img_bgr = self._load_image(image_path)
            
            # 2. 品質チェック
            self.logger.info("画像品質チェック開始")
            quality_result = self.quality_checker.check_image_quality(img_bgr)
            
            if not quality_result['is_valid']:
                return {
                    'success': False,
                    'error': f"画像品質チェック失敗: {quality_result['issues']}"
                }
            
            # 3. 画像正規化
            self.logger.info("画像正規化開始")
            normalized_img = self._normalize_image(img_bgr)
            
            # 4. RGB値抽出
            self.logger.info("RGB値抽出開始")
            rgb_stats = self._extract_rgb_statistics(normalized_img)
            
            # 5. 処理済み画像保存
            processed_path = self._save_processed_image(normalized_img, image_path)
            
            return {
                'success': True,
                'original_image': image_path,
                'processed_image': processed_path,
                'image_size': img_bgr.shape,
                'quality_check': quality_result,
                'rgb_statistics': rgb_stats,
                'processing_timestamp': datetime.now().isoformat(),
                'drone_metadata': drone_metadata
            }
            
        except Exception as e:
            self.logger.error(f"画像処理エラー: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _load_image(self, image_path: str) -> np.ndarray:
        """画像を読み込み"""
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"画像ファイルが見つかりません: {image_path}")
        
        # OpenCVで読み込み
        img_bgr = cv2.imread(image_path)
        if img_bgr is None:
            raise ValueError(f"画像の読み込みに失敗しました: {image_path}")
        
        return img_bgr
    
    def _normalize_image(self, img_bgr: np.ndarray) -> np.ndarray:
        """画像正規化"""
        # BGR → RGB 変換
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        
        # コントラスト正規化
        lab = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)
        
        # Lチャンネルのヒストグラム平坦化
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        l = clahe.apply(l)
        
        # 再結合
        lab = cv2.merge([l, a, b])
        normalized_rgb = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
        
        return normalized_rgb
    
    def _extract_rgb_statistics(self, img_rgb: np.ndarray) -> Dict[str, float]:
        """RGB値の統計情報を抽出"""
        r, g, b = cv2.split(img_rgb)
        
        stats = {
            'r_mean': float(np.mean(r)),
            'r_std': float(np.std(r)),
            'r_min': float(np.min(r)),
            'r_max': float(np.max(r)),
            'g_mean': float(np.mean(g)),
            'g_std': float(np.std(g)),
            'g_min': float(np.min(g)),
            'g_max': float(np.max(g)),
            'b_mean': float(np.mean(b)),
            'b_std': float(np.std(b)),
            'b_min': float(np.min(b)),
            'b_max': float(np.max(b)),
        }
        
        return stats
    
    def _save_processed_image(self, img_rgb: np.ndarray, original_path: str) -> str:
        """処理済み画像を保存"""
        # 保存先ディレクトリ作成
        processed_dir = "data/processed"
        os.makedirs(processed_dir, exist_ok=True)
        
        # ファイル名生成
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        base_name = os.path.splitext(os.path.basename(original_path))[0]
        processed_filename = f"{base_name}_processed_{timestamp}.jpg"
        processed_path = os.path.join(processed_dir, processed_filename)
        
        # RGB → BGR 変換して保存
        img_bgr = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)
        cv2.imwrite(processed_path, img_bgr)
        
        self.logger.info(f"処理済み画像保存: {processed_path}")
        return processed_path

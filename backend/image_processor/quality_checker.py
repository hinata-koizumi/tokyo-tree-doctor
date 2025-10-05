"""
画像品質チェックシステム

ドローン画像の品質を評価し、分析に適しているかを判定するモジュール
"""

import logging
from typing import Dict, List, Any
import numpy as np
import cv2

logger = logging.getLogger(__name__)


class ImageQualityChecker:
    """画像品質チェッククラス"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # 品質チェックの閾値
        self.min_resolution = (512, 512)  # 最小解像度
        self.max_blur_threshold = 100.0  # ブラー検出閾値
        self.min_brightness = 30.0  # 最小明度
        self.max_brightness = 220.0  # 最大明度
        self.min_contrast = 20.0  # 最小コントラスト
    
    def check_image_quality(self, img_bgr: np.ndarray) -> Dict[str, Any]:
        """
        画像品質をチェック
        
        Args:
            img_bgr: OpenCV BGR画像
            
        Returns:
            品質チェック結果の辞書
        """
        issues = []
        checks = {}
        
        # 1. 解像度チェック
        resolution_check = self._check_resolution(img_bgr)
        checks['resolution'] = resolution_check
        if not resolution_check['passed']:
            issues.append(f"解像度不足: {resolution_check['message']}")
        
        # 2. ブラー（ぼかし）チェック
        blur_check = self._check_blur(img_bgr)
        checks['blur'] = blur_check
        if not blur_check['passed']:
            issues.append(f"画像がぼやけています: {blur_check['message']}")
        
        # 3. 明度チェック
        brightness_check = self._check_brightness(img_bgr)
        checks['brightness'] = brightness_check
        if not brightness_check['passed']:
            issues.append(f"明度の問題: {brightness_check['message']}")
        
        # 4. コントラストチェック
        contrast_check = self._check_contrast(img_bgr)
        checks['contrast'] = contrast_check
        if not contrast_check['passed']:
            issues.append(f"コントラスト不足: {contrast_check['message']}")
        
        # 5. ノイズチェック
        noise_check = self._check_noise(img_bgr)
        checks['noise'] = noise_check
        if not noise_check['passed']:
            issues.append(f"ノイズ過多: {noise_check['message']}")
        
        # 6. 色バランスチェック
        color_check = self._check_color_balance(img_bgr)
        checks['color_balance'] = color_check
        if not color_check['passed']:
            issues.append(f"色バランスの問題: {color_check['message']}")
        
        # 総合判定
        is_valid = len(issues) == 0
        
        return {
            'is_valid': is_valid,
            'issues': issues,
            'checks': checks,
            'overall_score': self._calculate_overall_score(checks)
        }
    
    def _check_resolution(self, img_bgr: np.ndarray) -> Dict[str, Any]:
        """解像度チェック"""
        height, width = img_bgr.shape[:2]
        min_width, min_height = self.min_resolution
        
        passed = width >= min_width and height >= min_height
        
        return {
            'passed': passed,
            'width': width,
            'height': height,
            'min_required': self.min_resolution,
            'message': f"現在: {width}x{height}, 必要: {min_width}x{min_height}"
        }
    
    def _check_blur(self, img_bgr: np.ndarray) -> Dict[str, Any]:
        """ブラー（ぼかし）チェック"""
        # グレースケール変換
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        
        # Laplacian分散によるブラー検出
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        passed = laplacian_var > self.max_blur_threshold
        
        return {
            'passed': passed,
            'laplacian_variance': float(laplacian_var),
            'threshold': self.max_blur_threshold,
            'message': f"Laplacian分散: {laplacian_var:.2f} (閾値: {self.max_blur_threshold})"
        }
    
    def _check_brightness(self, img_bgr: np.ndarray) -> Dict[str, Any]:
        """明度チェック"""
        # HSV色空間で明度を取得
        hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
        v_channel = hsv[:, :, 2]
        
        mean_brightness = np.mean(v_channel)
        
        passed = self.min_brightness <= mean_brightness <= self.max_brightness
        
        return {
            'passed': passed,
            'mean_brightness': float(mean_brightness),
            'min_threshold': self.min_brightness,
            'max_threshold': self.max_brightness,
            'message': f"平均明度: {mean_brightness:.2f} (範囲: {self.min_brightness}-{self.max_brightness})"
        }
    
    def _check_contrast(self, img_bgr: np.ndarray) -> Dict[str, Any]:
        """コントラストチェック"""
        # グレースケール変換
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        
        # 標準偏差によるコントラスト測定
        contrast = np.std(gray)
        
        passed = contrast >= self.min_contrast
        
        return {
            'passed': passed,
            'contrast': float(contrast),
            'threshold': self.min_contrast,
            'message': f"コントラスト: {contrast:.2f} (閾値: {self.min_contrast})"
        }
    
    def _check_noise(self, img_bgr: np.ndarray) -> Dict[str, Any]:
        """ノイズチェック"""
        # グレースケール変換
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        
        # 高周波成分によるノイズ推定
        kernel = np.array([[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]])
        high_freq = cv2.filter2D(gray, -1, kernel)
        noise_level = np.std(high_freq)
        
        # ノイズレベルが高すぎる場合は問題
        max_noise_threshold = 15.0
        passed = noise_level <= max_noise_threshold
        
        return {
            'passed': passed,
            'noise_level': float(noise_level),
            'threshold': max_noise_threshold,
            'message': f"ノイズレベル: {noise_level:.2f} (閾値: {max_noise_threshold})"
        }
    
    def _check_color_balance(self, img_bgr: np.ndarray) -> Dict[str, Any]:
        """色バランスチェック"""
        b, g, r = cv2.split(img_bgr)
        
        # 各チャンネルの平均値を計算
        b_mean = np.mean(b)
        g_mean = np.mean(g)
        r_mean = np.mean(r)
        
        # 色バランスの偏りをチェック
        total_mean = (b_mean + g_mean + r_mean) / 3
        b_ratio = b_mean / total_mean if total_mean > 0 else 1.0
        g_ratio = g_mean / total_mean if total_mean > 0 else 1.0
        r_ratio = r_mean / total_mean if total_mean > 0 else 1.0
        
        # 各チャンネルが0.5-2.0の範囲内にあるかチェック
        ratios = [b_ratio, g_ratio, r_ratio]
        passed = all(0.5 <= ratio <= 2.0 for ratio in ratios)
        
        return {
            'passed': passed,
            'b_ratio': float(b_ratio),
            'g_ratio': float(g_ratio),
            'r_ratio': float(r_ratio),
            'message': f"B:G:R比率 = {b_ratio:.2f}:{g_ratio:.2f}:{r_ratio:.2f}"
        }
    
    def _calculate_overall_score(self, checks: Dict[str, Any]) -> float:
        """総合品質スコアを計算"""
        passed_checks = sum(1 for check in checks.values() if check['passed'])
        total_checks = len(checks)
        
        return (passed_checks / total_checks) * 100.0 if total_checks > 0 else 0.0

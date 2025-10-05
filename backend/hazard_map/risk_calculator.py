"""
リスクスコア算出アルゴリズム

気象スコアと林分スコアから総合リスクスコアを算出する
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
import json
from dataclasses import dataclass

from .weather_data import WeatherDataProcessor
from .forest_data import ForestDataProcessor


@dataclass
class RiskScore:
    """リスクスコアデータクラス"""
    weather_score: float
    forest_score: int
    total_risk_score: float
    risk_level: str
    details: Dict


class RiskCalculator:
    """リスクスコア算出クラス"""
    
    def __init__(self):
        self.weather_processor = WeatherDataProcessor()
        self.forest_processor = ForestDataProcessor()
        
        # リスクレベルの定義
        self.risk_levels = {
            (1.0, 1.5): "最低リスク",
            (1.5, 2.5): "低リスク", 
            (2.5, 3.5): "中リスク",
            (3.5, 4.5): "高リスク",
            (4.5, 5.0): "最高リスク"
        }
    
    def calculate_total_risk_score(self, weather_score: float, forest_score: int) -> float:
        """
        総合リスクスコアを算出
        
        Args:
            weather_score: 気象スコア（1-5）
            forest_score: 林分スコア（1-5）
            
        Returns:
            総合リスクスコア（1-5）
        """
        # リスクスコア = (0.5 × 気象スコア) + (0.5 × 林分スコア)
        total_score = 0.5 * weather_score + 0.5 * forest_score
        
        return total_score
    
    def get_risk_level(self, total_score: float) -> str:
        """
        リスクレベルを判定
        
        Args:
            total_score: 総合リスクスコア
            
        Returns:
            リスクレベル
        """
        for (min_score, max_score), level in self.risk_levels.items():
            if min_score <= total_score < max_score:
                return level
        
        # 最高値の場合は最高リスク
        if total_score >= 5.0:
            return "最高リスク"
        
        return "最低リスク"
    
    def calculate_hazard_map(self, 
                           station_id: str, 
                           year: int, 
                           forest_data: pd.DataFrame) -> RiskScore:
        """
        ハザードマップ用のリスクスコアを算出
        
        Args:
            station_id: 気象観測所ID
            year: 対象年
            forest_data: 林分データ
            
        Returns:
            リスクスコア
        """
        # 気象分析
        weather_analysis = self.weather_processor.get_weather_analysis(station_id, year)
        weather_score = weather_analysis['weather_score']
        
        # 林分分析
        forest_analysis = self.forest_processor.get_forest_analysis(forest_data)
        forest_score = forest_analysis['forest_score']
        
        # 総合リスクスコア算出
        total_risk_score = self.calculate_total_risk_score(weather_score, forest_score)
        
        # リスクレベル判定
        risk_level = self.get_risk_level(total_risk_score)
        
        # 詳細情報
        details = {
            'weather_analysis': weather_analysis,
            'forest_analysis': forest_analysis,
            'calculation_method': 'weighted_average',
            'weights': {
                'weather_score': 0.5,
                'forest_score': 0.5
            }
        }
        
        return RiskScore(
            weather_score=weather_score,
            forest_score=forest_score,
            total_risk_score=total_risk_score,
            risk_level=risk_level,
            details=details
        )
    
    def calculate_regional_hazard_map(self, 
                                    region_data: List[Dict]) -> pd.DataFrame:
        """
        地域全体のハザードマップを生成
        
        Args:
            region_data: 地域データのリスト
                [
                    {
                        'region_id': str,
                        'station_id': str,
                        'year': int,
                        'forest_data': pd.DataFrame,
                        'coordinates': (lat, lon)
                    }
                ]
            
        Returns:
            地域ハザードマップのDataFrame
        """
        results = []
        
        for region in region_data:
            risk_score = self.calculate_hazard_map(
                region['station_id'],
                region['year'],
                region['forest_data']
            )
            
            result = {
                'region_id': region['region_id'],
                'station_id': region['station_id'],
                'year': region['year'],
                'coordinates': region['coordinates'],
                'weather_score': risk_score.weather_score,
                'forest_score': risk_score.forest_score,
                'total_risk_score': risk_score.total_risk_score,
                'risk_level': risk_score.risk_level,
                'details': risk_score.details
            }
            
            results.append(result)
        
        return pd.DataFrame(results)
    
    def get_risk_recommendations(self, risk_score: RiskScore) -> List[str]:
        """
        リスクレベルに応じた推奨事項を取得
        
        Args:
            risk_score: リスクスコア
            
        Returns:
            推奨事項のリスト
        """
        recommendations = []
        
        if risk_score.risk_level == "最高リスク":
            recommendations.extend([
                "緊急の対策が必要です",
                "専門家による詳細調査を実施してください",
                "予防的伐採の検討",
                "定期的な監視体制の構築"
            ])
        elif risk_score.risk_level == "高リスク":
            recommendations.extend([
                "積極的な対策が必要です",
                "定期的な健康診断の実施",
                "予防的処置の検討",
                "監視頻度の向上"
            ])
        elif risk_score.risk_level == "中リスク":
            recommendations.extend([
                "注意深い監視が必要です",
                "定期的な調査の実施",
                "予防的対策の検討"
            ])
        elif risk_score.risk_level == "低リスク":
            recommendations.extend([
                "定期的な監視を継続",
                "予防的対策の維持"
            ])
        else:  # 最低リスク
            recommendations.extend([
                "通常の管理を継続",
                "年1回の定期調査"
            ])
        
        return recommendations
    
    def export_hazard_map(self, 
                         hazard_map_data: pd.DataFrame, 
                         output_path: str) -> None:
        """
        ハザードマップをファイルに出力
        
        Args:
            hazard_map_data: ハザードマップデータ
            output_path: 出力ファイルパス
        """
        # JSON形式で出力（数値型を適切に変換）
        json_data = hazard_map_data.to_dict('records')
        
        # numpy型をPython型に変換
        def convert_numpy_types(obj):
            if isinstance(obj, dict):
                return {k: convert_numpy_types(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_numpy_types(item) for item in obj]
            elif hasattr(obj, 'item'):  # numpy型の場合
                return obj.item()
            else:
                return obj
        
        json_data = convert_numpy_types(json_data)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, ensure_ascii=False, indent=2)
        
        print(f"ハザードマップを {output_path} に出力しました")


if __name__ == "__main__":
    # テスト実行
    calculator = RiskCalculator()
    
    # サンプルデータでテスト
    forest_processor = ForestDataProcessor()
    forest_data = forest_processor.load_forest_data("sample_forest_data.csv")
    
    risk_score = calculator.calculate_hazard_map("47646", 2023, forest_data)
    
    print("リスクスコア算出結果:")
    print(f"気象スコア: {risk_score.weather_score}")
    print(f"林分スコア: {risk_score.forest_score}")
    print(f"総合リスクスコア: {risk_score.total_risk_score}")
    print(f"リスクレベル: {risk_score.risk_level}")
    
    recommendations = calculator.get_risk_recommendations(risk_score)
    print("\n推奨事項:")
    for rec in recommendations:
        print(f"- {rec}")

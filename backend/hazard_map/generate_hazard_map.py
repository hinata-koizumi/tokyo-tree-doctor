"""
ハザードマップ生成メインスクリプト

気象データと林分データからハザードマップを生成する
"""

import sys
import os
import json
import pandas as pd
from datetime import datetime
from typing import Dict, List

# プロジェクトルートをパスに追加
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from backend.hazard_map.risk_calculator import RiskCalculator
from backend.hazard_map.forest_data import ForestDataProcessor


def main():
    """メイン処理"""
    print("Tree Doctor - ハザードマップ生成開始")
    print("=" * 50)
    
    # 初期化
    calculator = RiskCalculator()
    forest_processor = ForestDataProcessor()
    
    # 設定
    station_id = "47646"  # 東京
    year = 2023
    
    print(f"対象地域: {station_id}")
    print(f"対象年: {year}")
    print()
    
    try:
        # 1. 林分データの読み込み
        print("1. 林分データの読み込み中...")
        forest_data = forest_processor.load_forest_data("sample_forest_data.csv")
        print(f"   読み込み完了: {len(forest_data)}本の木")
        
        # 2. リスクスコアの算出
        print("2. リスクスコアの算出中...")
        risk_score = calculator.calculate_hazard_map(station_id, year, forest_data)
        
        # 3. 結果の表示
        print("3. 分析結果:")
        print(f"   気象スコア: {risk_score.weather_score:.2f}")
        print(f"   林分スコア: {risk_score.forest_score}")
        print(f"   総合リスクスコア: {risk_score.total_risk_score:.2f}")
        print(f"   リスクレベル: {risk_score.risk_level}")
        
        # 4. 推奨事項の表示
        print("\n4. 推奨事項:")
        recommendations = calculator.get_risk_recommendations(risk_score)
        for i, rec in enumerate(recommendations, 1):
            print(f"   {i}. {rec}")
        
        # 5. 詳細情報の保存
        print("\n5. 詳細情報の保存中...")
        output_dir = "data/analysis_results"
        os.makedirs(output_dir, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = f"{output_dir}/hazard_map_{station_id}_{year}_{timestamp}.json"
        
        # numpy型をPython型に変換する関数
        def convert_numpy_types(obj):
            if isinstance(obj, dict):
                return {k: convert_numpy_types(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_numpy_types(item) for item in obj]
            elif hasattr(obj, 'item'):  # numpy型の場合
                return obj.item()
            else:
                return obj
        
        # 結果をJSON形式で保存
        result_data = {
            'metadata': {
                'station_id': station_id,
                'year': year,
                'generated_at': datetime.now().isoformat(),
                'version': '1.0'
            },
            'risk_score': {
                'weather_score': float(risk_score.weather_score),
                'forest_score': int(risk_score.forest_score),
                'total_risk_score': float(risk_score.total_risk_score),
                'risk_level': risk_score.risk_level
            },
            'recommendations': recommendations,
            'details': convert_numpy_types(risk_score.details)
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result_data, f, ensure_ascii=False, indent=2)
        
        print(f"   保存完了: {output_file}")
        
        # 6. 地域ハザードマップの生成（サンプル）
        print("\n6. 地域ハザードマップの生成中...")
        region_data = [
            {
                'region_id': 'tokyo_central',
                'station_id': '47646',
                'year': 2023,
                'forest_data': forest_data,
                'coordinates': (35.6762, 139.6503)
            },
            {
                'region_id': 'tokyo_west',
                'station_id': '47646',
                'year': 2023,
                'forest_data': forest_data.sample(frac=0.8),  # 80%のサンプル
                'coordinates': (35.6895, 139.6917)
            }
        ]
        
        regional_hazard_map = calculator.calculate_regional_hazard_map(region_data)
        
        # 地域ハザードマップの保存
        regional_output_file = f"{output_dir}/regional_hazard_map_{year}_{timestamp}.json"
        calculator.export_hazard_map(regional_hazard_map, regional_output_file)
        
        print("=" * 50)
        print("ハザードマップ生成完了！")
        
        return True
        
    except Exception as e:
        print(f"エラーが発生しました: {e}")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

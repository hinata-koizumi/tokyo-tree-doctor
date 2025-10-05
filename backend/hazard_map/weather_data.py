"""
気象データ取得・処理モジュール

気象庁のオープンデータから気象データを取得し、
夏の繁殖スコアと冬の越冬スコアを算出する
"""

import pandas as pd
import numpy as np
from typing import Dict, Tuple, Optional
import requests
import json
from datetime import datetime, timedelta


class WeatherDataProcessor:
    """気象データ処理クラス"""
    
    def __init__(self):
        self.development_threshold = 11.5  # 発育零点（℃）
        self.generation_threshold = 1174.7  # 一世代完了に必要な有効積算温量（℃日）
    
    def fetch_weather_data(self, station_id: str, start_date: str, end_date: str) -> pd.DataFrame:
        """
        気象庁のオープンデータから気象データを取得
        
        Args:
            station_id: 気象観測所ID
            start_date: 開始日（YYYY-MM-DD）
            end_date: 終了日（YYYY-MM-DD）
            
        Returns:
            気象データのDataFrame
        """
        # 気象庁のオープンデータAPIエンドポイント
        base_url = "https://www.data.jma.go.jp/obd/stats/etrn/view/daily_s1.php"
        
        # 実際の実装では、気象庁のAPIまたはCSVファイルからデータを取得
        # ここではサンプルデータを生成
        date_range = pd.date_range(start=start_date, end=end_date, freq='D')
        
        # サンプルデータ生成（実際の実装では削除）
        np.random.seed(42)
        sample_data = {
            'date': date_range,
            'temperature': np.random.normal(15, 10, len(date_range)),  # 平均15℃、標準偏差10℃
            'precipitation': np.random.exponential(5, len(date_range)),  # 平均5mm
            'humidity': np.random.uniform(40, 90, len(date_range))  # 40-90%
        }
        
        return pd.DataFrame(sample_data)
    
    def calculate_effective_accumulated_temperature(self, weather_data: pd.DataFrame) -> float:
        """
        有効積算温度を計算
        
        Args:
            weather_data: 気象データのDataFrame
            
        Returns:
            有効積算温度（℃日）
        """
        # 発育零点以上の温度のみを考慮
        effective_temps = weather_data['temperature'].apply(
            lambda x: max(0, x - self.development_threshold)
        )
        
        # 積算温度を計算
        accumulated_temp = effective_temps.sum()
        
        return accumulated_temp
    
    def calculate_summer_breeding_score(self, weather_data: pd.DataFrame) -> int:
        """
        夏の繁殖スコアを算出
        
        Args:
            weather_data: 気象データのDataFrame
            
        Returns:
            繁殖スコア（1-5）
        """
        accumulated_temp = self.calculate_effective_accumulated_temperature(weather_data)
        
        # スコア判定
        if accumulated_temp > 1300:
            return 5  # 最高リスク
        elif accumulated_temp >= 1175:
            return 4  # 高リスク
        elif accumulated_temp >= 1000:
            return 3  # 中リスク
        elif accumulated_temp >= 800:
            return 2  # 低リスク
        else:
            return 1  # 最低リスク
    
    def calculate_winter_overwintering_score(self, weather_data: pd.DataFrame) -> int:
        """
        冬の越冬スコアを算出
        
        Args:
            weather_data: 気象データのDataFrame
            
        Returns:
            越冬スコア（1-5）
        """
        # 0℃以下の日数をカウント
        cold_days = (weather_data['temperature'] <= 0).sum()
        
        # スコア判定
        if cold_days < 30:
            return 5  # 最高リスク
        elif cold_days < 55:
            return 4  # 高リスク
        elif cold_days < 70:
            return 3  # 中リスク
        elif cold_days < 90:
            return 2  # 低リスク
        else:
            return 1  # 最低リスク
    
    def calculate_weather_score(self, weather_data: pd.DataFrame) -> float:
        """
        気象スコアを算出
        
        Args:
            weather_data: 気象データのDataFrame
            
        Returns:
            気象スコア（1-5）
        """
        summer_score = self.calculate_summer_breeding_score(weather_data)
        winter_score = self.calculate_winter_overwintering_score(weather_data)
        
        # 重み付き平均
        weather_score = 0.5 * summer_score + 0.5 * winter_score
        
        return weather_score
    
    def get_weather_analysis(self, station_id: str, year: int) -> Dict:
        """
        指定年の気象分析を実行
        
        Args:
            station_id: 気象観測所ID
            year: 対象年
            
        Returns:
            気象分析結果の辞書
        """
        start_date = f"{year}-01-01"
        end_date = f"{year}-12-31"
        
        weather_data = self.fetch_weather_data(station_id, start_date, end_date)
        
        summer_score = self.calculate_summer_breeding_score(weather_data)
        winter_score = self.calculate_winter_overwintering_score(weather_data)
        weather_score = self.calculate_weather_score(weather_data)
        
        return {
            'year': year,
            'station_id': station_id,
            'summer_breeding_score': summer_score,
            'winter_overwintering_score': winter_score,
            'weather_score': weather_score,
            'effective_accumulated_temperature': self.calculate_effective_accumulated_temperature(weather_data),
            'cold_days_count': (weather_data['temperature'] <= 0).sum()
        }


if __name__ == "__main__":
    # テスト実行
    processor = WeatherDataProcessor()
    result = processor.get_weather_analysis("47646", 2023)  # 東京
    print("気象分析結果:")
    print(json.dumps(result, indent=2, ensure_ascii=False))

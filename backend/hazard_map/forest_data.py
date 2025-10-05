"""
林分データ処理モジュール

林分データから林分スコアを算出する
大径木指標、感受性樹種指標、林分構造指標を計算
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
import json
from dataclasses import dataclass


@dataclass
class TreeData:
    """個体木データクラス"""
    tree_id: str
    species: str  # 樹種
    dbh: float  # 胸高直径（cm）
    x: float  # X座標（m）
    y: float  # Y座標（m）
    basal_area: float  # 胸高断面積（m²）


class ForestDataProcessor:
    """林分データ処理クラス"""
    
    def __init__(self):
        # 高感受性樹種のリスト
        self.high_susceptible_species = [
            'ミズナラ', 'Quercus crispula', 'mizunara',
            'コナラ', 'Quercus serrata', 'konara',
            'カシワ', 'Quercus dentata', 'kashiwa'
        ]
        
        # ナラ類の樹種リスト
        self.oak_species = [
            'ミズナラ', 'Quercus crispula', 'mizunara',
            'コナラ', 'Quercus serrata', 'konara',
            'カシワ', 'Quercus dentata', 'kashiwa',
            'クヌギ', 'Quercus acutissima', 'kunugi',
            'アベマキ', 'Quercus variabilis', 'abemaki'
        ]
    
    def load_forest_data(self, file_path: str) -> pd.DataFrame:
        """
        林分データを読み込み
        
        Args:
            file_path: データファイルのパス
            
        Returns:
            林分データのDataFrame
        """
        # 実際の実装ではCSVファイルから読み込み
        # ここではサンプルデータを生成
        np.random.seed(42)
        
        n_trees = 1000
        species_list = ['ミズナラ', 'コナラ', 'スギ', 'ヒノキ', 'ブナ', 'カエデ']
        
        sample_data = {
            'tree_id': [f'tree_{i:04d}' for i in range(n_trees)],
            'species': np.random.choice(species_list, n_trees, p=[0.3, 0.2, 0.2, 0.15, 0.1, 0.05]),
            'dbh': np.random.lognormal(3.5, 0.5, n_trees),  # 平均約33cm
            'x': np.random.uniform(0, 100, n_trees),
            'y': np.random.uniform(0, 100, n_trees)
        }
        
        df = pd.DataFrame(sample_data)
        df['basal_area'] = np.pi * (df['dbh'] / 200) ** 2  # 胸高断面積を計算
        
        return df
    
    def calculate_large_tree_indicator(self, forest_data: pd.DataFrame) -> float:
        """
        大径木指標を計算
        
        Args:
            forest_data: 林分データのDataFrame
            
        Returns:
            大径木指標（0-1）
        """
        # ナラ類のみを抽出
        oak_data = forest_data[forest_data['species'].isin(self.oak_species)]
        
        if len(oak_data) == 0:
            return 0.0
        
        # ナラ類の胸高断面積合計
        total_oak_basal_area = oak_data['basal_area'].sum()
        
        # DBH 30cm以上のナラ類の胸高断面積合計
        large_oak_basal_area = oak_data[oak_data['dbh'] >= 30]['basal_area'].sum()
        
        # 大径木の割合
        large_tree_ratio = large_oak_basal_area / total_oak_basal_area if total_oak_basal_area > 0 else 0.0
        
        return large_tree_ratio
    
    def calculate_susceptible_species_indicator(self, forest_data: pd.DataFrame) -> float:
        """
        感受性樹種指標を計算
        
        Args:
            forest_data: 林分データのDataFrame
            
        Returns:
            感受性樹種指標（0-1）
        """
        # ナラ類のみを抽出
        oak_data = forest_data[forest_data['species'].isin(self.oak_species)]
        
        if len(oak_data) == 0:
            return 0.0
        
        # ナラ類の胸高断面積合計
        total_oak_basal_area = oak_data['basal_area'].sum()
        
        # 高感受性樹種の胸高断面積合計
        high_susceptible_basal_area = oak_data[
            oak_data['species'].isin(self.high_susceptible_species)
        ]['basal_area'].sum()
        
        # 高感受性樹種の割合
        susceptible_ratio = high_susceptible_basal_area / total_oak_basal_area if total_oak_basal_area > 0 else 0.0
        
        return susceptible_ratio
    
    def calculate_forest_structure_indicator(self, forest_data: pd.DataFrame) -> float:
        """
        林分構造指標を計算
        
        Args:
            forest_data: 林分データのDataFrame
            
        Returns:
            林分構造指標（0-1）
        """
        # ナラ類の大径木のみを抽出
        large_oak_data = forest_data[
            (forest_data['species'].isin(self.oak_species)) & 
            (forest_data['dbh'] >= 30)
        ]
        
        if len(large_oak_data) == 0:
            return 0.0
        
        # クラスター分析
        cluster_score = 0.0
        total_clusters = 0
        
        for _, tree in large_oak_data.iterrows():
            # 半径10m内の大径ナラ類の数をカウント
            nearby_trees = large_oak_data[
                ((large_oak_data['x'] - tree['x']) ** 2 + 
                 (large_oak_data['y'] - tree['y']) ** 2) <= 100  # 半径10m = 100m²
            ]
            
            if len(nearby_trees) >= 3:  # 3本以上でクラスター
                cluster_score += 1.0
            
            total_clusters += 1
        
        # クラスターの割合
        cluster_ratio = cluster_score / total_clusters if total_clusters > 0 else 0.0
        
        return cluster_ratio
    
    def calculate_forest_score(self, forest_data: pd.DataFrame) -> int:
        """
        林分スコアを算出
        
        Args:
            forest_data: 林分データのDataFrame
            
        Returns:
            林分スコア（1-5）
        """
        large_tree_indicator = self.calculate_large_tree_indicator(forest_data)
        susceptible_indicator = self.calculate_susceptible_species_indicator(forest_data)
        structure_indicator = self.calculate_forest_structure_indicator(forest_data)
        
        # スコア5の条件：2つ以上の指標が高い
        high_indicators = 0
        if large_tree_indicator >= 0.5:  # 50%以上
            high_indicators += 1
        if susceptible_indicator >= 0.6:  # 60%以上
            high_indicators += 1
        if structure_indicator >= 0.3:  # 30%以上がクラスター
            high_indicators += 1
        
        if high_indicators >= 2:
            return 5  # 最高リスク
        
        # スコア4の条件：1つの指標が高い、またはスコア5に近い
        if (large_tree_indicator >= 0.3 or 
            susceptible_indicator >= 0.4 or 
            structure_indicator >= 0.2):
            return 4  # 高リスク
        
        # スコア3の条件：中程度の指標
        if (large_tree_indicator >= 0.1 or 
            susceptible_indicator >= 0.2):
            return 3  # 中リスク
        
        # スコア2の条件：低い指標
        if large_tree_indicator > 0:
            return 2  # 低リスク
        
        # スコア1の条件：ナラ類が存在しない
        return 1  # 最低リスク
    
    def get_forest_analysis(self, forest_data: pd.DataFrame) -> Dict:
        """
        林分分析を実行
        
        Args:
            forest_data: 林分データのDataFrame
            
        Returns:
            林分分析結果の辞書
        """
        large_tree_indicator = self.calculate_large_tree_indicator(forest_data)
        susceptible_indicator = self.calculate_susceptible_species_indicator(forest_data)
        structure_indicator = self.calculate_forest_structure_indicator(forest_data)
        forest_score = self.calculate_forest_score(forest_data)
        
        # ナラ類の統計
        oak_data = forest_data[forest_data['species'].isin(self.oak_species)]
        large_oak_data = oak_data[oak_data['dbh'] >= 30]
        
        return {
            'forest_score': forest_score,
            'large_tree_indicator': large_tree_indicator,
            'susceptible_species_indicator': susceptible_indicator,
            'forest_structure_indicator': structure_indicator,
            'total_trees': len(forest_data),
            'oak_trees': len(oak_data),
            'large_oak_trees': len(large_oak_data),
            'oak_basal_area_total': oak_data['basal_area'].sum() if len(oak_data) > 0 else 0.0,
            'large_oak_basal_area_total': large_oak_data['basal_area'].sum() if len(large_oak_data) > 0 else 0.0
        }


if __name__ == "__main__":
    # テスト実行
    processor = ForestDataProcessor()
    forest_data = processor.load_forest_data("sample_forest_data.csv")
    result = processor.get_forest_analysis(forest_data)
    print("林分分析結果:")
    print(json.dumps(result, indent=2, ensure_ascii=False))

"""
ハザードマップ用APIエンドポイント
"""
import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
# 一時的にダミー関数を定義
def generate_hazard_map(station_id, year, include_geojson=True):
    return {
        "features": [],
        "type": "FeatureCollection"
    }

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/hazard-map/{station_id}/{year}")
async def get_hazard_map(
    station_id: str,
    year: int,
    include_geojson: bool = Query(True, description="GeoJSONデータを含めるかどうか")
):
    """
    ハザードマップデータを取得
    
    Args:
        station_id: 気象台ID
        year: 年
        include_geojson: GeoJSONデータを含めるかどうか
    
    Returns:
        ハザードマップデータ
    """
    try:
        # ハザードマップを生成
        hazard_map_data = generate_hazard_map(station_id, year)
        
        if include_geojson:
            return hazard_map_data
        else:
            # GeoJSONを除いた統計情報のみを返す
            return {
                "station_id": station_id,
                "year": year,
                "summary": hazard_map_data.get("summary", {}),
                "statistics": hazard_map_data.get("statistics", {})
            }
            
    except Exception as e:
        logger.error(f"ハザードマップの生成に失敗: {e}")
        raise HTTPException(status_code=500, detail="ハザードマップの生成に失敗しました")

@router.get("/hazard-statistics/{station_id}/{year}")
async def get_hazard_statistics(station_id: str, year: int):
    """
    ハザードマップの統計情報を取得
    
    Args:
        station_id: 気象台ID
        year: 年
    
    Returns:
        統計情報
    """
    try:
        hazard_map_data = generate_hazard_map(station_id, year)
        return hazard_map_data.get("statistics", {})
    except Exception as e:
        logger.error(f"統計情報の取得に失敗: {e}")
        raise HTTPException(status_code=500, detail="統計情報の取得に失敗しました")

@router.get("/hazard-parks")
async def get_available_parks():
    """
    利用可能な公園のリストを取得
    
    Returns:
        公園の基本情報リスト
    """
    try:
        # 東京の主要公園の情報
        parks = [
            {
                'id': 'sakuragaoka',
                'name': '桜ヶ丘公園',
                'bounds': {
                    'min_lat': 35.63,
                    'max_lat': 35.64,
                    'min_lng': 139.46,
                    'max_lng': 139.47
                }
            },
            {
                'id': 'naganuma',
                'name': '長沼公園',
                'bounds': {
                    'min_lat': 35.63,
                    'max_lat': 35.64,
                    'min_lng': 139.36,
                    'max_lng': 139.37
                }
            },
            {
                'id': 'hirayama',
                'name': '平山城址公園',
                'bounds': {
                    'min_lat': 35.63,
                    'max_lat': 35.64,
                    'min_lng': 139.38,
                    'max_lng': 139.39
                }
            },
            {
                'id': 'koyamada',
                'name': '小山田緑地',
                'bounds': {
                    'min_lat': 35.59,
                    'max_lat': 35.60,
                    'min_lng': 139.41,
                    'max_lng': 139.42
                }
            },
            {
                'id': 'koyanaidai',
                'name': '小山内裏公園',
                'bounds': {
                    'min_lat': 35.60,
                    'max_lat': 35.61,
                    'min_lng': 139.36,
                    'max_lng': 139.37
                }
            },
            {
                'id': 'hachioji',
                'name': '八王子霊園',
                'bounds': {
                    'min_lat': 35.65,
                    'max_lat': 35.67,
                    'min_lng': 139.26,
                    'max_lng': 139.28
                }
            }
        ]
        return {'parks': parks}
    except Exception as e:
        logger.error(f"公園リストの取得に失敗: {e}")
        raise HTTPException(status_code=500, detail="公園リストの取得に失敗しました")

@router.get("/hazard-mesh-sample")
async def get_hazard_mesh_sample():
    """
    ハザードメッシュのサンプルデータを取得（デバッグ用）
    
    Returns:
        サンプルメッシュデータ
    """
    try:
        # 桜ヶ丘公園のサンプルデータ
        sample_data = generate_hazard_map('47646', 2023)
        return {
            'message': 'サンプルデータ（桜ヶ丘公園）',
            'data': sample_data
        }
    except Exception as e:
        logger.error(f"サンプルデータの取得に失敗: {e}")
        raise HTTPException(status_code=500, detail="サンプルデータの取得に失敗しました")

"""
ドローンからの画像受信用Webhookエンドポイント

ドローン画像の自動受信、VARI分析の実行、結果の返却を行う
"""

import logging
import uuid
import os
import tempfile
import asyncio
from datetime import datetime
from typing import Optional, Dict, Any

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, BackgroundTasks
from pydantic import BaseModel, Field

# 一時的にインポートを無効化（後で修正）
# from backend.image_processor import ImageProcessor, VARIAnalyzer, ImageMeta
# from backend.ml_analysis.analysis_job import AnalysisJobProcessor

# ダミークラスを定義
class ImageProcessor:
    def process_drone_image(self, image_path, drone_metadata):
        return {"status": "dummy"}

class VARIAnalyzer:
    def analyze_image(self, img_bgr, meta, tile_side_m):
        return []

class ImageMeta:
    def __init__(self, **kwargs):
        pass

class AnalysisJobProcessor:
    def save_analysis_result(self, job_id, result):
        pass

router = APIRouter()
logger = logging.getLogger(__name__)


class DroneImageData(BaseModel):
    """ドローンから送信される画像データ"""
    drone_id: str = Field(..., description="ドローンの識別ID")
    flight_id: str = Field(..., description="フライトセッションID")
    timestamp: str = Field(..., description="撮影時刻 (ISO format)")
    latitude: Optional[float] = Field(None, description="撮影位置の緯度")
    longitude: Optional[float] = Field(None, description="撮影位置の経度")
    altitude: Optional[float] = Field(None, description="撮影高度（メートル）")
    metadata: Optional[str] = Field(None, description="追加のメタデータ（JSON文字列）")


class DroneImageResponse(BaseModel):
    """ドローン画像受信の応答"""
    job_id: str = Field(..., description="分析ジョブID")
    status: str = Field(..., description="受信ステータス")
    message: str = Field(..., description="処理メッセージ")
    estimated_completion_time: int = Field(..., description="推定完了時間（秒）")


class DroneJobStatus(BaseModel):
    """ドローン分析ジョブの状態"""
    job_id: str
    state: str
    submitted_at: datetime
    finished_at: Optional[datetime] = None
    error: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    progress: int = Field(..., description="進捗パーセンテージ (0-100)")


class DroneAnalysisResult(BaseModel):
    """ドローン画像分析結果"""
    job_id: str
    drone_metadata: Dict[str, Any]
    analysis_completed_at: Optional[datetime]
    summary: Dict[str, Any]
    tiles: list


@router.post("/webhook/image", response_model=DroneImageResponse)
async def receive_drone_image(
    background_tasks: BackgroundTasks,
    image: UploadFile = File(...),
    drone_id: str = Form(...),
    flight_id: str = Form(...),
    timestamp: str = Form(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    altitude: Optional[float] = Form(None),
    metadata: Optional[str] = Form(None),
):
    """
    ドローンからの画像を受信し、自動的にVARI分析を開始する
    
    Args:
        image: ドローンが撮影した画像ファイル
        drone_id: ドローンの識別ID
        flight_id: フライトセッションID
        timestamp: 撮影時刻 (ISO format)
        latitude: 撮影位置の緯度
        longitude: 撮影位置の経度
        altitude: 撮影高度（メートル）
        metadata: 追加のメタデータ（JSON文字列）
    """
    try:
        logger.info(f"Received image from drone {drone_id}, flight {flight_id}")
        
        # 画像ファイルの検証
        if not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Invalid file type. Only images are allowed.")
        
        if image.size > 50 * 1024 * 1024:  # 50MB制限
            raise HTTPException(status_code=400, detail="File too large. Maximum size is 50MB.")
        
        # 画像を保存
        image_path = await _save_uploaded_image(image, drone_id, flight_id)
        
        # 分析ジョブを作成
        job_id = str(uuid.uuid4())
        
        # ドローン関連のメタデータを準備
        drone_metadata = {
            "drone_id": drone_id,
            "flight_id": flight_id,
            "timestamp": timestamp,
            "latitude": latitude,
            "longitude": longitude,
            "altitude": altitude,
            "original_filename": image.filename,
            "file_size": image.size,
            "additional_metadata": metadata
        }
        
        # バックグラウンドで分析を開始
        background_tasks.add_task(
            _process_drone_image_analysis, 
            job_id, 
            image_path, 
            drone_metadata
        )
        
        logger.info(f"Started analysis job {job_id} for drone {drone_id}")
        
        return DroneImageResponse(
            job_id=job_id,
            status="received",
            message=f"Image from drone {drone_id} received and analysis started",
            estimated_completion_time=300  # 5分の推定完了時間
        )
        
    except Exception as e:
        logger.error(f"Error processing drone image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process drone image: {str(e)}")


@router.get("/webhook/status/{job_id}")
async def get_drone_job_status(job_id: str):
    """
    ドローン画像分析ジョブの状態を取得
    """
    try:
        # 分析ジョブプロセッサーから状態を取得
        job_processor = AnalysisJobProcessor()
        job_status = job_processor.get_job_status(job_id)
        
        if not job_status:
            raise HTTPException(status_code=404, detail="Job not found")
        
        return job_status
        
    except Exception as e:
        logger.error(f"Error getting job status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get job status: {str(e)}")


@router.get("/webhook/results/{job_id}")
async def get_drone_analysis_results(job_id: str):
    """
    ドローン画像分析の結果を取得
    """
    try:
        # 分析ジョブプロセッサーから結果を取得
        job_processor = AnalysisJobProcessor()
        analysis_result = job_processor.get_analysis_results(job_id)
        
        if not analysis_result:
            raise HTTPException(status_code=404, detail="Job not found")
        
        if analysis_result.get('state') != "completed":
            raise HTTPException(
                status_code=400, 
                detail=f"Job not completed. Current state: {analysis_result.get('state')}"
            )
        
        return analysis_result
        
    except Exception as e:
        logger.error(f"Error getting analysis results: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get analysis results: {str(e)}")


async def _save_uploaded_image(image: UploadFile, drone_id: str, flight_id: str) -> str:
    """アップロードされた画像を保存"""
    # 保存先ディレクトリ作成
    images_dir = "data/images"
    os.makedirs(images_dir, exist_ok=True)
    
    # ファイル名生成
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_extension = os.path.splitext(image.filename)[1] if image.filename else ".jpg"
    filename = f"drone_{drone_id}_flight_{flight_id}_{timestamp}{file_extension}"
    file_path = os.path.join(images_dir, filename)
    
    # ファイル保存
    content = await image.read()
    with open(file_path, "wb") as f:
        f.write(content)
    
    logger.info(f"Saved uploaded image: {file_path}")
    return file_path


async def _process_drone_image_analysis(job_id: str, image_path: str, drone_metadata: Dict[str, Any]):
    """ドローン画像のVARI分析を実行"""
    try:
        logger.info(f"Starting VARI analysis for job {job_id}")
        
        # 1. 画像前処理
        image_processor = ImageProcessor()
        preprocess_result = image_processor.process_drone_image(image_path, drone_metadata)
        
        if not preprocess_result['success']:
            raise Exception(f"Image preprocessing failed: {preprocess_result['error']}")
        
        # 2. VARI分析実行
        vari_analyzer = VARIAnalyzer()
        
        # 画像読み込み
        import cv2
        img_bgr = cv2.imread(preprocess_result['processed_image'])
        
        # メタデータ設定
        meta = ImageMeta(
            gsd_m_per_px=0.05,  # デフォルト値（実際はドローンから取得）
            yaw_deg=0.0
        )
        
        # VARI分析実行
        tile_results = vari_analyzer.analyze_image(img_bgr, meta, tile_side_m=20.0)
        
        # 3. 結果を保存
        analysis_result = {
            'job_id': job_id,
            'state': 'completed',
            'submitted_at': datetime.now(),
            'finished_at': datetime.now(),
            'drone_metadata': drone_metadata,
            'preprocess_result': preprocess_result,
            'tile_results': [tile.as_dict() for tile in tile_results],
            'summary': _calculate_analysis_summary(tile_results)
        }
        
        # 結果をファイルに保存
        _save_analysis_result(job_id, analysis_result)
        
        logger.info(f"VARI analysis completed for job {job_id}")
        
    except Exception as e:
        logger.error(f"Error in VARI analysis for job {job_id}: {str(e)}")
        # エラー結果を保存
        error_result = {
            'job_id': job_id,
            'state': 'failed',
            'submitted_at': datetime.now(),
            'finished_at': datetime.now(),
            'error': str(e),
            'drone_metadata': drone_metadata
        }
        _save_analysis_result(job_id, error_result)


def _calculate_analysis_summary(tile_results) -> Dict[str, Any]:
    """分析結果のサマリーを計算"""
    total_tiles = len(tile_results)
    healthy_count = len([t for t in tile_results if t.class_label == "健康"])
    warning_count = len([t for t in tile_results if t.class_label == "要注意"])
    danger_count = len([t for t in tile_results if t.class_label == "危険"])
    na_count = len([t for t in tile_results if t.class_label == "N/A"])
    
    return {
        "total_tiles": total_tiles,
        "healthy_count": healthy_count,
        "warning_count": warning_count,
        "danger_count": danger_count,
        "na_count": na_count,
        "healthy_percentage": (healthy_count / total_tiles * 100) if total_tiles > 0 else 0,
        "warning_percentage": (warning_count / total_tiles * 100) if total_tiles > 0 else 0,
        "danger_percentage": (danger_count / total_tiles * 100) if total_tiles > 0 else 0
    }


def _save_analysis_result(job_id: str, result: Dict[str, Any]):
    """分析結果をファイルに保存"""
    import json
    
    # 保存先ディレクトリ作成
    results_dir = "data/vari_results"
    os.makedirs(results_dir, exist_ok=True)
    
    # ファイル名生成
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"vari_analysis_{job_id}_{timestamp}.json"
    file_path = os.path.join(results_dir, filename)
    
    # JSON形式で保存
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2, default=str)
    
    logger.info(f"Saved analysis result: {file_path}")


def _calculate_progress(state: str) -> int:
    """分析状態から進捗パーセンテージを計算"""
    progress_map = {
        "queued": 0,
        "processing": 50,
        "completed": 100,
        "failed": 0
    }
    return progress_map.get(state, 0)

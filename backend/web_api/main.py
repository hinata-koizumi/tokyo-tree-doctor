"""
Tree Doctor Web API メインアプリケーション

ドローン画像受信、VARI分析、ハザードマップ生成のAPIを提供
"""

import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .endpoints import drone_webhook, hazard_map
# 一時的にダミー関数を定義
def generate_hazard_map(station_id, year, include_geojson=True):
    return {
        "features": [],
        "type": "FeatureCollection"
    }

# ログ設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """アプリケーションのライフサイクル管理"""
    # 起動時の処理
    logger.info("Tree Doctor API を起動中...")
    
    # 必要なディレクトリを作成
    import os
    os.makedirs("data/images", exist_ok=True)
    os.makedirs("data/processed", exist_ok=True)
    os.makedirs("data/vari_results", exist_ok=True)
    os.makedirs("data/analysis_results", exist_ok=True)
    
    logger.info("Tree Doctor API が起動しました")
    
    yield
    
    # 終了時の処理
    logger.info("Tree Doctor API を終了中...")


# FastAPIアプリケーション作成
app = FastAPI(
    title="Tree Doctor API",
    description="ドローン画像による木の健康状態分析とハザードマップ生成システム",
    version="1.0.0",
    lifespan=lifespan
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*"  # すべてのオリジンからのアクセスを許可（本番環境では適切に制限してください）
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# ルーターの登録
app.include_router(drone_webhook.router, prefix="/api/v1", tags=["drone"])
app.include_router(hazard_map.router, prefix="/api/v1", tags=["hazard"])


@app.get("/")
async def root():
    """ルートエンドポイント"""
    return {
        "message": "Tree Doctor API",
        "version": "1.0.0",
        "description": "ドローン画像による木の健康状態分析システム"
    }


@app.get("/health")
async def health_check():
    """ヘルスチェックエンドポイント"""
    return {"status": "healthy", "service": "tree-doctor-api"}


@app.get("/api/v1/hazard-map/{station_id}/{year}")
async def get_hazard_map(station_id: str, year: int):
    """ハザードマップ生成API"""
    try:
        # ハザードマップ生成を実行
        result = generate_hazard_map.main(station_id, year)
        return {
            "success": True,
            "station_id": station_id,
            "year": year,
            "result": result
        }
    except Exception as e:
        logger.error(f"ハザードマップ生成エラー: {str(e)}")
        raise HTTPException(status_code=500, detail=f"ハザードマップ生成に失敗しました: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

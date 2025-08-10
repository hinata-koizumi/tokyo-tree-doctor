from pydantic import BaseModel, Field
from typing import List


class TreeDataInput(BaseModel):
    """APIが受け取る入力データモデル"""

    tree_id: str = Field(..., description="樹木の一意のID")
    latitude: float = Field(..., description="緯度")
    longitude: float = Field(..., description="経度")
    # 今後、恭輔さん(ML担当)が必要とするデータを追加していく
    # 例: green_ratio: float


class RiskScoreOutput(BaseModel):
    """MLモデルから受け取るリスクスコアのモデル"""

    tree_id: str
    risk_score: float = Field(..., ge=0, le=1, description="病害リスクスコア (0.0 ~ 1.0)")


class AnalysisResult(BaseModel):
    """最終的にクライアントに返す分析結果のモデル"""

    tree_id: str
    risk_score: float
    cause_analysis: str = Field(..., description="生成AIによる原因分析結果")
    countermeasure: str = Field(..., description="生成AIによる対策提案")


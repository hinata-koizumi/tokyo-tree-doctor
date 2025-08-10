import httpx
import random
from app.schemas.tree import TreeDataInput, RiskScoreOutput
from app.core.config import settings


async def get_risk_score(tree_data: TreeDataInput) -> RiskScoreOutput:
    """
    MLモデルAPIに問い合わせて、樹木のリスクスコアを取得する。
    将来的には、実際のAPIを呼び出すように変更する。
    """
    # --- モック実装 ---
    # 0.0から1.0の間のランダムなスコアを生成する
    mock_score = random.uniform(0.0, 1.0)
    print(f"ML Service (Mock): Generated score {mock_score} for tree {tree_data.tree_id}")
    return RiskScoreOutput(tree_id=tree_data.tree_id, risk_score=mock_score)

    # --- 将来的な実装例 ---
    # async with httpx.AsyncClient() as client:
    #     try:
    #         response = await client.post(settings.ML_API_ENDPOINT, json=tree_data.dict())
    #         response.raise_for_status() # HTTPエラーがあれば例外を発生させる
    #         return RiskScoreOutput(**response.json())
    #     except httpx.RequestError as e:
    #         # ここでエラーハンドリングを行う
    #         print(f"Error calling ML API: {e}")
    #         return None


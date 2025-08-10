from fastapi import APIRouter, HTTPException
from app.schemas.tree import TreeDataInput, AnalysisResult
from app.services import ml_service, generative_ai_service


router = APIRouter()


@router.post("/analyze", response_model=AnalysisResult)
async def analyze_tree(tree_data: TreeDataInput):
    """
    樹木データを受け取り、完全な分析パイプラインを実行するエンドポイント
    """
    # 1. MLサービスを呼び出してリスクスコアを取得
    risk_output = await ml_service.get_risk_score(tree_data)
    if not risk_output:
        raise HTTPException(status_code=503, detail="ML service is unavailable.")

    # 2. 生成AIサービスを呼び出して原因分析と対策案を取得
    generative_ai_output = await generative_ai_service.get_analysis_and_suggestion(
        risk_output
    )
    if not generative_ai_output:
        raise HTTPException(
            status_code=503, detail="Generative AI service is unavailable."
        )

    # 3. 結果を統合してクライアントに返す
    return AnalysisResult(
        tree_id=tree_data.tree_id,
        risk_score=risk_output.risk_score,
        **generative_ai_output,
    )


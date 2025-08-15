
from app.schemas.tree import TreeDataInput, RiskScoreOutput

# --- 内部 ML モジュールを用いた簡易推論 ---
# ipynb を変更せず、ml パッケージ側に実装した predict_risk_score を呼び出す
from ml import predict_risk_score  # type: ignore  # noqa: E402


async def get_risk_score(tree_data: TreeDataInput) -> RiskScoreOutput:  # noqa: D401
    """内部 ML モジュールからリスクスコアを取得する (非同期ラッパー)。"""

    # 現状は CPU 軽量処理なので直接呼び出し
    score = predict_risk_score(tree_data)
    return RiskScoreOutput(tree_id=tree_data.tree_id, risk_score=score)


import random
from typing import Dict, Tuple

# Import configuration constants
from .config.config import CLASS_PRIORS  # type: ignore  # noqa: E402

# クラスごとのリスクスコア範囲を設定 (0.0 ~ 1.0)
RISK_SCORE_RANGES: Dict[str, Tuple[float, float]] = {
    "H": (0.0, 0.4),  # Healthy
    "E": (0.4, 0.7),  # Early warning / 要注意
    "D": (0.7, 1.0),  # Danger / 危険
}


def _sample_class_by_prior() -> str:
    """CLASS_PRIORS に基づいてクラスラベルをサンプリングする"""
    r = random.random()
    cumulative = 0.0
    for cls, prior in CLASS_PRIORS.items():
        cumulative += prior
        if r <= cumulative:
            return cls
    # フォールバック
    return "E"


def predict_risk_score(tree_data) -> float:  # noqa: ANN001
    """簡易的なリスクスコア推定関数。

    現状はルールベース + サンプリングのみで実装しており、将来的には
    学習済みモデルをロードして推論を行う部分に置き換える予定。

    Args:
        tree_data: software/backend の TreeDataInput または dict 相当

    Returns:
        0.0 〜 1.0 のリスクスコア
    """
    cls = _sample_class_by_prior()
    low, high = RISK_SCORE_RANGES[cls]
    return random.uniform(low, high)

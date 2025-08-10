from app.schemas.tree import RiskScoreOutput


async def get_analysis_and_suggestion(risk_info: RiskScoreOutput) -> dict:
    """
    リスクスコアに基づき、生成AIに原因分析と対策案を問い合わせる。
    将来的には、実際のClaude APIを呼び出すように変更する。
    """
    # --- モック実装 ---
    analysis = (
        f"原因分析(モック): ID {risk_info.tree_id} のリスクスコアが {risk_info.risk_score:.2f} と高いため、"
        "ナラ枯れの初期症状の可能性があります。"
    )
    suggestion = (
        f"対策提案(モック): ID {risk_info.tree_id} の樹木について、専門家による現地調査を推奨します。"
    )

    print("Generative AI Service (Mock): Generated analysis and suggestion.")

    return {
        "cause_analysis": analysis,
        "countermeasure": suggestion,
    }

    # --- 将来的な実装例 ---
    # prompt = f"樹木のリスクスコアが{risk_info.risk_score}です。原因分析と対策案を簡潔に生成してください。"
    # ここでClaude APIを呼び出す処理を実装する


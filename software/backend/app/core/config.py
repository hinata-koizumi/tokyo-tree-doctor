from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # 将来的に、ここに環境変数から読み込む設定値を追加する
    # 例: CLAUDE_API_KEY: str = "your_api_key_here"

    ML_API_ENDPOINT: str = "http://127.0.0.1:8001/predict"  # MLモデルAPIのエンドポイント（仮）
    # ローカル開発時のCORS許可オリジン（フロントエンドのデフォルトポートを許可）
    ALLOWED_ORIGINS: List[str] = [
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ]

    class Config:
        env_file = ".env"


settings = Settings()


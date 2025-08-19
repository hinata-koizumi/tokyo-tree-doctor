from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # 将来的に、ここに環境変数から読み込む設定値を追加する
    # 例: CLAUDE_API_KEY: str = "your_api_key_here"

    ML_API_ENDPOINT: str = "http://127.0.0.1:8001/predict"  # MLモデルAPIのエンドポイント（仮）
    # CORS許可オリジン（本番環境とローカル開発環境）
    ALLOWED_ORIGINS: List[str] = [
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "https://tokyo-tree-doctor.vercel.app",  # Vercelデプロイ用
        "https://tokyo-tree-doctor-frontend.vercel.app",  # 代替ドメイン
        "*"  # 本番環境では適切に制限することを推奨
    ]

    class Config:
        env_file = ".env"


settings = Settings()


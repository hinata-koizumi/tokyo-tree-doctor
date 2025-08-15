# Tokyo Tree Doctor

AIとドローン技術を活用した、樹木の健康状態を監視・診断するための包括的なシステムです。


このプロジェクトは **機械学習 (`ml`)**・**バックエンド (`backend`)**・**フロントエンド (`frontend`)**・**インフラ (`infrastructure`)** の 4 つのトップレベルディレクトリで構成されています。

---

## 🔖 Repository Layout

```text
tokyo-tree-doctor/
├── ml/              # 画像をタイル分割して診断するコア ML ロジック
├── backend/         # FastAPI + RQ Worker + SQLAlchemy/PostGIS
├── frontend/        # Vite + React + Leaflet (地図 UI)
└── infrastructure/  # docker-compose.yml などローカル E2E 用インフラ定義
```

---

## 🚀 Quick Start (Docker Compose)

ローカル PC に Docker / Docker Compose が入っていれば、**ワンコマンドで全サービスが起動**します。

```bash
# プロジェクトルート
docker compose -f infrastructure/docker-compose.yml up -d

# ブラウザで確認
open http://localhost:8000/docs        # FastAPI (Swagger UI)
open http://localhost:9001             # MinIO Console (ID/PW: minio / minio123)
```

起動するサービス | ポート | 役割
+----------------|-------|----------------------------------
API (FastAPI)   | 8000  | `/api/v1/*` REST エンドポイント
RQ Worker       | —     | 画像解析の非同期ジョブ実行
PostgreSQL + PostGIS | 5432 | 診断結果 (`analysis_jobs`, `area_tiles`) 永続化
Redis           | 6379  | ジョブキュー
MinIO           | 9000/9001 | S3 互換オブジェクトストレージ（画像アップロード）

---

## 🔍 開発フロー (個別コンテナ不要派向け)

バックエンドだけローカルで動かしたい場合：

```bash
# 依存インストール
python -m venv .venv && source .venv/bin/activate
pip install -r backend/requirements.txt

# 環境変数 (SQLite にフォールバック)
export DATABASE_URL=sqlite:///./dev.db
uvicorn backend/app.main:app --reload --port 8000
```

フロントエンド：

```bash
cd frontend
npm ci
VITE_API_BASE_URL=http://localhost:8000/api/v1 npm run dev
```

---

## 🧪 テスト

GitHub Actions が `pytest` を自動実行します。ローカルでは：

```bash
pytest -q
```

---

## 📡 End-to-End Flow

1. ドローン画像を MinIO バケット `drone-images` にアップロード
2. MinIO Event → `/api/v1/analysis/s3/webhook` を呼び出しジョブ作成
3. RQ Worker が画像をダウンロード → `ml.analyzer` で区画診断
4. 結果を PostGIS に永続化 (`analysis_jobs` / `area_tiles`)
5. フロントエンドが `/dashboard/summary` などの API で KPI を取得し地図に描画

---

## 🛠️ Troubleshooting

- `ModuleNotFoundError: No module named 'app'` → Docker を使うか `PYTHONPATH=. uvicorn ...`。
- Postgres が ARM Mac で起動しない → `platform: linux/arm64` を compose に追記。
- ポート 8000 がバッティング → `.env` で `API_PORT=8001` に変更し compose 側も合わせる。

---

## 📜 License

MIT

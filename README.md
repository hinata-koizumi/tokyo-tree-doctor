# Tokyo Tree Doctor

AIとドローン技術を活用した、樹木の健康状態を監視・診断するための包括的なシステムです。

このリポジトリは、**機械学習領域 (`ml`)** と **Webアプリケーション領域 (`software`)** の2つのコンポーネントに明確に分離されています。

-----

## 機械学習領域 (`ml`)

機械学習モデルの研究、実験、および関連資産の管理を行うディレクトリです。

  - **役割**: データ分析、モデルの学習・評価、実験管理など、データサイエンスに関連するタスクを集約します。
  - **現状**: Webアプリケーションとは直接接続されておらず、独立した環境として機能します。将来的に、ここで作成されたモデルがAPI経由でアプリケーションに提供される予定です。

<!-- end list -->

```sh
ml/
├── assets/     # モデルや画像などの資産
├── config/     # 設定ファイル
├── data/       # データセット
├── docs/       # ドキュメント
└── tests/      # テストコード
```

-----

## Webアプリケーション領域 (`software`)

ユーザーが実際に操作するWebアプリケーション本体（バックエンド・フロントエンド）のディレクトリです。

  - **役割**: 診断リクエストの受付、結果の表示、ユーザーインタラクションの管理など、サービス提供の役割を担います。
  - **構成**: バックエンドは**FastAPI**、フロントエンドは**Vite + React**で構築されています。

### セットアップ

#### 前提条件

  - **Python**: `3.10` 以上 ( `3.11` を推奨)
  - **Node.js**: `18` 以上 / npm
  - **ポート**: バックエンド `8000`, フロントエンド `5173` (デフォルト)

#### 1. バックエンド (FastAPI) の起動

```bash
# 仮想環境の作成と有効化（未作成の場合）
python -m venv .venv
source .venv/bin/activate

# 依存パッケージのインストール
pip install -r software/backend/requirements.txt

# 開発サーバーの起動（プロジェクトルートから）
# app パッケージが software/backend/app にあるため、--app-dir を指定します
uvicorn app.main:app --app-dir software/backend --reload --host 0.0.0.0 --port 8000

# 必要に応じて監視対象ディレクトリを制限（フロントエンドのnode_modulesによるリロードを防ぐ）
# uvicorn app.main:app --app-dir software/backend --reload --reload-dir software/backend --host 0.0.0.0 --port 8000
```

> 起動後、 `http://127.0.0.1:8000/docs` からAPIドキュメントを確認できます。
> CORS は開発向けに既定で有効（`http://127.0.0.1:5173`, `http://localhost:5173` を許可）。

#### 2. フロントエンド (Vite + React) の起動

```bash
# フロントエンドディレクトリへ移動
cd software/frontend

# 依存パッケージのインストール
npm ci

# (任意) API接続先を設定
echo "VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1" > .env

# 開発サーバーの起動（software/frontendディレクトリから実行）
npm run dev
```

> **注意**: フロントエンドの起動は必ず`software/frontend`ディレクトリから実行してください。プロジェクトルートから実行すると`package.json`が見つからないエラーが発生します。

> `http://127.0.0.1:5173` でアプリケーションにアクセスできます。

トラブルシューティング:
- `ModuleNotFoundError: No module named 'app'` → `--app-dir software/backend` を付けて起動してください。
- ポート 8000 が使用中 → `--port 8001` など別ポートを指定。
- バックエンドが頻繁にリロードされる → WatchFilesがフロントエンドの`node_modules`を監視している可能性があります。必要に応じて`--reload-dir software/backend`を追加して監視対象を制限してください。
- フロントエンドで`package.json`が見つからない → `software/frontend`ディレクトリに移動してから`npm run dev`を実行してください。

### アプリケーション概要

  - **バックエンド API**: `POST /api/v1/analysis/analyze` エンドポイントで樹木IDと位置情報を受け取り、診断結果（リスクスコア、原因分析など）を返します。
  - **フロントエンド UI**: 地図（Leaflet）上に診断結果を色分けして表示し、過去の履歴も確認できるインターフェースを提供します。

### ディレクトリ構造

```sh
software/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── services/
│   │   ├── schemas/
│   │   └── main.py
│   ├── tests/
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

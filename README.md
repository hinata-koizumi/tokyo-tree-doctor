# Tokyo Tree Doctor

AIとドローン技術を活用した包括的な樹木健康監視・診断システム。

## プロジェクト構造

```
tokyo-tree-doctor/
├── ml/                  # 機械学習コンポーネント
│   ├── ml_models/           # 機械学習モデル
│   ├── ml_data/             # 機械学習データ
│   ├── ml_notebooks/        # 機械学習ノートブック
│   ├── ml_scripts/          # 機械学習スクリプト
│   ├── tests/               # 機械学習テスト
│   ├── docs/                # 機械学習ドキュメント
│   ├── config/              # 機械学習設定
│   └── assets/              # 機械学習アセット
│       ├── images/          # 機械学習用画像
│       └── videos/          # 機械学習用動画
│
└── software/            # ソフトウェアコンポーネント
    ├── software_apps/       # ソフトウェアアプリケーション
    ├── software_web/        # Webアプリケーション
    ├── software_api/        # APIサービス
    ├── software_utils/      # ユーティリティ
    ├── tests/               # ソフトウェアテスト
    ├── docs/                # ソフトウェアドキュメント
    ├── config/              # ソフトウェア設定
    └── assets/              # ソフトウェアアセット
        ├── images/          # ソフトウェア用画像（UI、アイコン等）
        └── videos/          # ソフトウェア用動画（デモ、チュートリアル等）
```

## 機能

### 機械学習機能
- AI駆動の樹木健康分析
- 樹木分類と識別
- 病気・害虫検出
- リスク評価とスコアリング
- 予測モデル開発

### ソフトウェア機能
- ドローンによる画像収集
- リアルタイム監視ダッシュボード
- モバイル・デスクトップアプリ
- REST/GraphQL API
- データ処理パイプライン

## 開発環境

### システム情報
- **OS**: macOS 24.5.0 (darwin)
- **シェル**: /bin/zsh
- **ワークスペース**: /Users/koizumihinata/tokyo-tree-doctor

### 必要なツール
- **Git**: バージョン管理
- **Python**: 機械学習開発
- **Node.js**: ソフトウェア開発
- **Docker**: コンテナ化

## 開発ガイド

### 機械学習開発
```bash
cd ml
# 詳細は ml/README.md を参照
# ドキュメントは ml/docs/ を参照
```

### ソフトウェア開発
```bash
cd software
# 詳細は software/README.md を参照
# ドキュメントは software/docs/ を参照
```

## テスト

### 機械学習テスト
```bash
cd ml/tests
python -m pytest
# 詳細は ml/tests/README.md を参照
```

### ソフトウェアテスト
```bash
cd software/tests
npm test  # フロントエンド
python -m pytest  # バックエンド
# 詳細は software/tests/README.md を参照
```

## ドキュメント

### 機械学習ドキュメント
```bash
cd ml/docs
# 詳細は ml/docs/README.md を参照
```

### ソフトウェアドキュメント
```bash
cd software/docs
# 詳細は software/docs/README.md を参照
```

## セットアップ

### 初期セットアップ
```bash
# リポジトリのクローン
git clone https://github.com/hinata-koizumi/tokyo-tree-doctor.git
cd tokyo-tree-doctor

# 機械学習環境のセットアップ
cd ml
python -m venv ml_env
source ml_env/bin/activate
pip install -r requirements.txt

# ソフトウェア環境のセットアップ
cd ../software
npm install
```

## 始め方

[詳細なセットアップ手順は各コンポーネントのREADME.mdを参照]

## ライセンス

[ライセンス情報はここに追加予定] 
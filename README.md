# Tree Doctor

ドローン画像による木の健康状態分析とハザードマップ生成システム

## システム概要

Tree Doctorは、ドローンで撮影した画像を分析して木の健康状態を判定し、ハザードマップを生成するシステムです。

### 主要機能

1. **画像分析システム**
   - ドローン画像の自動受信
   - 画像前処理（正規化・品質チェック）
   - VARI値計算による健康状態判定
   - 3段階分類（健康・要注意・危険）

2. **ハザードマップ生成システム**
   - 気象データと林分データの統合分析
   - リスクスコア算出
   - クラスター分析による危険木の密度分析
   - 地理情報システム（GIS）連携

3. **Webアプリケーション**
   - インタラクティブなハザードマップ表示
   - リアルタイムデータ可視化
   - 公園別の詳細分析情報
   - 統計情報と対策提案

## プロジェクト構造

```
tree-doctor/
├── backend/                    # バックエンド（Python/FastAPI）
│   ├── database/              # データベース関連
│   ├── hazard_map/            # ハザードマップ生成
│   │   ├── data/              # 分析結果データ
│   │   ├── forest_data.py     # 林分データ処理
│   │   ├── generate_hazard_map.py  # ハザードマップ生成
│   │   ├── risk_calculator.py # リスク計算
│   │   └── weather_data.py    # 気象データ処理
│   ├── image_processor/       # 画像処理システム
│   │   ├── config.py          # 設定パラメータ
│   │   ├── image_processor.py # 画像前処理
│   │   ├── quality_checker.py # 画像品質チェック
│   │   └── vari_analyzer.py   # VARI分析
│   ├── ml_analysis/           # ML分析システム
│   │   └── analysis_job.py    # 分析ジョブ管理
│   └── web_api/               # Web API
│       ├── endpoints/         # APIエンドポイント
│       │   ├── drone_webhook.py  # ドローン画像受信
│       │   └── hazard_map.py     # ハザードマップAPI
│       └── main.py            # メインアプリケーション
├── frontend/                  # フロントエンド（React/TypeScript）
│   ├── src/
│   │   ├── components/        # Reactコンポーネント
│   │   │   ├── HazardMapApp.tsx      # メインアプリ
│   │   │   └── map/           # マップ関連コンポーネント
│   │   │       ├── MapboxMap.tsx     # メインマップ
│   │   │       └── HazardHeatmap.tsx # ハザードヒートマップ
│   │   ├── services/          # APIサービス
│   │   │   └── hazardMapService.ts   # ハザードマップAPI
│   │   ├── constants/         # 定数定義
│   │   │   └── mapbox.ts      # Mapbox設定
│   │   └── main.tsx           # エントリーポイント
│   ├── package.json           # 依存関係
│   └── vite.config.ts         # Vite設定
├── data/                      # データディレクトリ
│   ├── analysis_results/      # 分析結果
│   ├── images/                # 画像データ
│   ├── processed/             # 処理済み画像
│   └── vari_results/          # VARI分析結果
├── docker-compose.yml         # Docker Compose設定
├── Dockerfile                 # Docker設定
├── requirements.txt           # Python依存関係
└── README.md                  # このファイル
```

## セットアップ

### 前提条件

- Python 3.8以上
- Node.js 16以上
- Docker & Docker Compose（推奨）

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd tree-doctor
```

### 2. バックエンドのセットアップ

```bash
# 仮想環境の作成
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存関係のインストール
pip install -r requirements.txt

# 環境変数の設定
cp env.example .env
# .envファイルを編集して必要な設定を行う
```

### 3. フロントエンドのセットアップ

```bash
cd frontend

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集してAPIエンドポイントを設定
```

### 4. 簡単起動（推奨）

```bash
# アプリケーションを起動（ターミナルを閉じても動作し続けます）
./start.sh

# 停止する場合
./stop.sh
```

### 5. Docker Composeでの起動

```bash
# 全サービスを起動
docker-compose up -d

# ログの確認
docker-compose logs -f
```

### 6. 個別起動

#### バックエンド

```bash
cd backend
uvicorn web_api.main:app --host 0.0.0.0 --port 8000 --reload
```

#### フロントエンド

```bash
cd frontend
npm run dev
```

## アクセス情報

アプリケーションが起動すると、以下のURLでアクセスできます：

- **🌐 フロントエンド（Webアプリ）**: http://localhost:3000
- **🔧 バックエンドAPI**: http://localhost:8000
- **📊 API ドキュメント**: http://localhost:8000/docs
- **💚 ヘルスチェック**: http://localhost:8000/health

### 外部アクセス

他のデバイスからアクセスする場合は、以下のURLを使用してください：
- **🌐 フロントエンド**: http://[あなたのIPアドレス]:3000
- **🔧 バックエンドAPI**: http://[あなたのIPアドレス]:8000

IPアドレスは以下のコマンドで確認できます：
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# または
hostname -I
```

## 使用方法

### 画像分析

#### Web API経由

1. **Web APIを起動**
   ```bash
   cd backend
   uvicorn web_api.main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **ドローン画像をアップロード**
   ```bash
   curl -X POST "http://localhost:8000/api/v1/webhook/image" \
     -F "image=@path/to/drone_image.jpg" \
     -F "drone_id=drone_001" \
     -F "flight_id=flight_20231201_001" \
     -F "timestamp=2023-12-01T10:00:00Z" \
     -F "latitude=35.681236" \
     -F "longitude=139.766103" \
     -F "altitude=100.0"
   ```

3. **分析結果を取得**
   ```bash
   # ジョブステータス確認
   curl "http://localhost:8000/api/v1/webhook/status/{job_id}"
   
   # 分析結果取得
   curl "http://localhost:8000/api/v1/webhook/results/{job_id}"
   ```

#### 直接分析

```python
from backend.image_processor.vari_analyzer import VARIAnalyzer, ImageMeta
import cv2

# 画像を読み込み
img_bgr = cv2.imread("path/to/image.jpg")

# メタデータを設定
meta = ImageMeta(
    drone_id="drone_001",
    flight_id="flight_001",
    timestamp="2023-12-01T10:00:00Z",
    latitude=35.681236,
    longitude=139.766103,
    altitude=100.0,
    gsd_m_per_px=0.1,
    yaw_deg=0.0
)

# VARI分析を実行
analyzer = VARIAnalyzer()
tile_results = analyzer.analyze_image(img_bgr, meta, tile_side_m=20.0)

# 結果を表示
for result in tile_results:
    print(f"タイル {result.tile_id}: {result.classification} (VARI: {result.vari_median:.3f})")
```

### ハザードマップ生成

```bash
# ハザードマップ生成
curl "http://localhost:8000/api/v1/hazard-map/47646/2023"
```

### Webアプリケーション

1. **フロントエンドを起動**
   ```bash
   cd frontend
   npm run dev
   ```

2. **ブラウザでアクセス**
   ```
   http://localhost:3000
   ```

3. **機能**
   - インタラクティブな地図表示
   - 公園の選択と詳細情報表示
   - ハザードヒートマップの表示
   - 統計情報と分析結果の確認

## API エンドポイント

### ドローン画像関連

- `POST /api/v1/webhook/image` - ドローン画像のアップロード
- `GET /api/v1/webhook/status/{job_id}` - 分析ジョブのステータス確認
- `GET /api/v1/webhook/results/{job_id}` - 分析結果の取得

### ハザードマップ関連

- `GET /api/v1/hazard-map/{station_id}/{year}` - ハザードマップ生成
- `GET /api/v1/hazard-statistics/{station_id}/{year}` - 統計情報取得
- `GET /api/v1/hazard-parks` - 利用可能な公園リスト
- `GET /api/v1/hazard-mesh-sample` - サンプルデータ取得

## 技術仕様

### バックエンド

- **フレームワーク**: FastAPI
- **画像処理**: OpenCV, NumPy
- **機械学習**: scikit-learn
- **データ処理**: Pandas
- **地理情報**: GeoPandas

### フロントエンド

- **フレームワーク**: React 18
- **言語**: TypeScript
- **地図**: Mapbox GL JS
- **スタイリング**: Tailwind CSS
- **ビルドツール**: Vite

### データベース

- **ファイルベース**: JSON形式での結果保存
- **キャッシュ**: メモリ内キャッシュ（5分間）

## 開発

### コード品質

```bash
# Python
flake8 backend/
black backend/
isort backend/

# TypeScript
cd frontend
npm run lint
```

### テスト

```bash
# Python
pytest backend/tests/

# TypeScript
cd frontend
npm test
```

## ライセンス

MIT License

## 貢献

1. フォークを作成
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## サポート

問題や質問がある場合は、GitHubのIssuesページで報告してください。

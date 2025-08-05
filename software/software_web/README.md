# Webアプリケーション

Tokyo Tree DoctorのWebアプリケーションコンポーネント

## ディレクトリ構造

- `frontend/` - React/Vue.jsフロントエンドアプリケーション
- `backend/` - Node.js/PythonバックエンドAPI
- `dashboard/` - リアルタイム監視ダッシュボード

## 技術スタック

### フロントエンド
- React.js / Vue.js
- TypeScript
- Tailwind CSS / Material-UI
- Chart.js / D3.js (データ可視化)

### バックエンド
- Node.js / Python (FastAPI/Flask)
- PostgreSQL / MongoDB
- Redis (キャッシュ)
- WebSocket (リアルタイム通信)

## 開発環境

```bash
# フロントエンド
cd software_web/frontend
npm install
npm run dev

# バックエンド
cd software_web/backend
pip install -r requirements.txt
python app.py
``` 
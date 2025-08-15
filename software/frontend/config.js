// 環境に応じたAPIエンドポイントの設定
const config = {
  // 本番環境のAPIエンドポイント（Railwayデプロイ後）
  production: {
    apiBaseUrl: 'https://tokyo-tree-doctor-backend.railway.app/api/v1',
    // または実際のRailwayドメインに置き換え
  },
  // ローカル開発環境
  development: {
    apiBaseUrl: 'http://localhost:8000/api/v1',
  }
};

// 現在の環境を判定
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const currentConfig = isProduction ? config.production : config.development;

// グローバル設定として公開
window.APP_CONFIG = currentConfig;

export default currentConfig;

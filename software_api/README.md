# APIサービス

Tokyo Tree DoctorのAPIサービス

## ディレクトリ構造

- `rest_api/` - RESTful API
- `graphql_api/` - GraphQL API
- `websocket/` - WebSocket API

## API仕様

### REST API
- 樹木データ取得・更新
- 画像アップロード・処理
- 分析結果取得
- ユーザー認証

### GraphQL API
- 柔軟なデータクエリ
- リアルタイム更新
- スキーマ駆動開発

### WebSocket API
- リアルタイム通知
- ドローン状態監視
- 分析進捗通知

## 認証・セキュリティ

- JWT認証
- API Key管理
- レート制限
- CORS設定 
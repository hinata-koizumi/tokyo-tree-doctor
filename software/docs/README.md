# ソフトウェアドキュメント

Tokyo Tree Doctorのソフトウェアコンポーネントのドキュメント

## 概要

このディレクトリには、ソフトウェアアプリケーションとAPIに関する技術ドキュメントが含まれています。

## ドキュメント構造

```
software/docs/
├── architecture/              # アーキテクチャドキュメント
│   ├── system_design/         # システム設計
│   ├── database_schema/       # データベース設計
│   └── deployment/            # デプロイメント設計
│
├── api/                       # APIドキュメント
│   ├── rest_api/              # REST API仕様
│   ├── graphql_api/           # GraphQL API仕様
│   └── websocket_api/         # WebSocket API仕様
│
├── applications/              # アプリケーションドキュメント
│   ├── web_app/               # Webアプリケーション仕様
│   ├── mobile_app/            # モバイルアプリケーション仕様
│   └── drone_control/         # ドローン制御アプリ仕様
│
├── guides/                    # ガイド
│   ├── setup/                 # セットアップガイド
│   ├── development/           # 開発ガイド
│   ├── deployment/            # デプロイメントガイド
│   └── troubleshooting/       # トラブルシューティング
│
├── user_manuals/              # ユーザーマニュアル
│   ├── admin_guide/           # 管理者ガイド
│   ├── user_guide/            # ユーザーガイド
│   └── api_reference/         # APIリファレンス
│
└── technical/                 # 技術資料
    ├── security/              # セキュリティ仕様
    ├── performance/           # 性能仕様
    └── monitoring/            # 監視仕様
```

## ドキュメント形式

- **Markdown**: 技術仕様、ガイド
- **OpenAPI/Swagger**: API仕様書
- **PlantUML**: アーキテクチャ図
- **PDF**: ユーザーマニュアル
- **HTML**: オンラインドキュメント

## 更新ポリシー

- API変更時は必ずドキュメントも更新
- 新機能追加時は仕様書を作成
- ユーザーガイドは定期的に更新
- レビュー必須

## 参照

- [ソフトウェアREADME](../README.md)
- [テストドキュメント](../tests/README.md) 
# ソフトウェアテスト

Tokyo Tree Doctorのソフトウェアコンポーネントのテスト

## 概要

このディレクトリには、ソフトウェアアプリケーションとAPIのテストが含まれています。

## テスト構造

```
software/tests/
├── unit/                    # 単体テスト
│   ├── test_api/            # APIテスト
│   ├── test_apps/           # アプリケーションテスト
│   └── test_utils/          # ユーティリティテスト
│
├── integration/              # 統合テスト
│   ├── test_services/       # サービス統合テスト
│   └── test_workflows/      # ワークフローテスト
│
├── e2e/                     # エンドツーエンドテスト
│   ├── test_web/            # Webアプリケーションテスト
│   ├── test_mobile/         # モバイルアプリテスト
│   └── test_drone/          # ドローン制御テスト
│
├── performance/              # 性能テスト
│   ├── test_load/           # 負荷テスト
│   └── test_stress/         # ストレステスト
│
└── fixtures/                # テストデータ
    ├── test_data/            # テスト用データ
    └── mock_services/        # モックサービス
```

## テスト実行

```bash
# 全テスト実行
npm test  # フロントエンド
python -m pytest software/tests/  # バックエンド

# 単体テストのみ
npm run test:unit  # フロントエンド
python -m pytest software/tests/unit/  # バックエンド

# E2Eテスト
npm run test:e2e  # フロントエンド
python -m pytest software/tests/e2e/  # バックエンド

# 性能テスト
npm run test:performance  # フロントエンド
python -m pytest software/tests/performance/  # バックエンド
```

## テスト基準

### 単体テスト
- 各関数・コンポーネントの動作確認
- エラーハンドリングのテスト
- モックを使用した依存関係の分離

### 統合テスト
- サービス間の連携確認
- データベース操作のテスト
- 外部APIとの連携テスト

### E2Eテスト
- ユーザー操作のシミュレーション
- ブラウザ・デバイス間の互換性
- 実際の使用シナリオのテスト

### 性能テスト
- レスポンス時間の測定
- 同時接続数の確認
- リソース使用量の監視

## 品質基準

- **テストカバレッジ**: 85%以上
- **実行時間**: 10分以内
- **レスポンス時間**: 2秒以内
- **可用性**: 99.9%以上 
# 機械学習テスト

Tokyo Tree Doctorの機械学習コンポーネントのテスト

## 概要

このディレクトリには、機械学習モデルとスクリプトのテストが含まれています。

## テスト構造

```
ml/tests/
├── unit/                    # 単体テスト
│   ├── test_models/         # モデルテスト
│   ├── test_data/           # データ処理テスト
│   └── test_scripts/        # スクリプトテスト
│
├── integration/              # 統合テスト
│   ├── test_pipeline/       # パイプラインテスト
│   └── test_workflow/       # ワークフローテスト
│
├── performance/              # 性能テスト
│   ├── test_inference/      # 推論性能テスト
│   └── test_training/       # 学習性能テスト
│
└── fixtures/                # テストデータ
    ├── sample_data/          # サンプルデータ
    └── mock_models/          # モックモデル
```

## テスト実行

```bash
# 全テスト実行
python -m pytest ml/tests/

# 単体テストのみ
python -m pytest ml/tests/unit/

# 特定のテストファイル
python -m pytest ml/tests/unit/test_models.py

# カバレッジ付きテスト
python -m pytest ml/tests/ --cov=ml/ --cov-report=html
```

## テスト基準

### 単体テスト
- 各関数・クラスの動作確認
- エッジケースのテスト
- モックを使用した依存関係の分離

### 統合テスト
- データパイプラインの動作確認
- モデル学習から推論までの流れ
- 外部APIとの連携テスト

### 性能テスト
- 推論速度の測定
- メモリ使用量の確認
- スケーラビリティの検証

## 品質基準

- **テストカバレッジ**: 80%以上
- **実行時間**: 5分以内
- **メモリ使用量**: 指定された制限内
- **精度**: モデル性能基準を満たす 
# 機械学習ドキュメント

Tokyo Tree Doctorの機械学習コンポーネントのドキュメント

## 概要

このディレクトリには、機械学習モデルとアルゴリズムに関する技術ドキュメントが含まれています。

## ドキュメント構造

```
ml/docs/
├── models/                    # モデルドキュメント
│   ├── tree_classification/   # 樹木分類モデル仕様
│   ├── health_detection/      # 健康状態検出モデル仕様
│   ├── disease_prediction/    # 病気予測モデル仕様
│   └── risk_assessment/       # リスク評価モデル仕様
│
├── algorithms/                # アルゴリズムドキュメント
│   ├── preprocessing/         # 前処理アルゴリズム
│   ├── feature_engineering/   # 特徴量エンジニアリング
│   └── evaluation/            # 評価手法
│
├── api/                       # APIドキュメント
│   ├── model_inference/       # 推論API仕様
│   ├── training_api/          # 学習API仕様
│   └── data_api/              # データAPI仕様
│
├── guides/                    # ガイド
│   ├── getting_started/       # はじめに
│   ├── best_practices/        # ベストプラクティス
│   └── troubleshooting/       # トラブルシューティング
│
└── research/                  # 研究資料
    ├── papers/                # 論文
    ├── experiments/           # 実験結果
    └── benchmarks/            # ベンチマーク結果
```

## ドキュメント形式

- **Markdown**: 技術仕様、ガイド
- **Jupyter Notebook**: 実験結果、サンプルコード
- **PDF**: 論文、レポート
- **HTML**: API仕様書

## 更新ポリシー

- モデル更新時は必ずドキュメントも更新
- 実験結果は即座に記録
- ベストプラクティスは定期的に更新
- レビュー必須

## 参照

- [機械学習README](../README.md)
- [テストドキュメント](../tests/README.md) 
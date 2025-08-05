# 機械学習 (ML)

Tokyo Tree Doctorの機械学習コンポーネント

## 概要

このディレクトリには、樹木健康診断システムの機械学習関連のすべてのコンポーネントが含まれています。

## ディレクトリ構造

```
ml/
├── ml_models/           # 機械学習モデル
│   ├── tree_classification/    # 樹木分類モデル
│   ├── health_detection/       # 健康状態検出モデル
│   ├── disease_prediction/     # 病気予測モデル
│   └── risk_assessment/        # リスク評価モデル
│
├── ml_data/             # 機械学習データ
│   ├── raw/             # 生データ
│   ├── processed/       # 処理済みデータ
│   ├── training/        # 学習用データ
│   └── validation/      # 検証用データ
│
├── ml_notebooks/        # 機械学習ノートブック
│   ├── data_exploration/       # データ探索
│   ├── model_development/      # モデル開発
│   ├── model_evaluation/       # モデル評価
│   └── experiments/            # 実験
│
└── ml_scripts/          # 機械学習スクリプト
    ├── data_preprocessing/     # データ前処理
    ├── model_training/         # モデル学習
    ├── model_inference/        # モデル推論
    └── evaluation/             # 評価スクリプト
```

## 技術スタック

- **フレームワーク**: TensorFlow, PyTorch, Scikit-learn
- **データ処理**: Pandas, NumPy, OpenCV
- **可視化**: Matplotlib, Seaborn, Plotly
- **実験管理**: MLflow, Weights & Biases
- **モデル形式**: ONNX, TensorRT, TorchScript

## 開発環境

```bash
# 仮想環境の作成
python -m venv ml_env
source ml_env/bin/activate  # Linux/Mac
# ml_env\Scripts\activate  # Windows

# 依存関係のインストール
pip install -r requirements.txt

# Jupyter Labの起動
jupyter lab
```

## ワークフロー

1. **データ収集** → `ml_data/raw/`
2. **データ前処理** → `ml_scripts/data_preprocessing/`
3. **モデル開発** → `ml_notebooks/model_development/`
4. **モデル学習** → `ml_scripts/model_training/`
5. **モデル評価** → `ml_notebooks/model_evaluation/`
6. **モデル保存** → `ml_models/`

## 品質管理

- コードレビュー必須
- テストカバレッジ80%以上
- モデル性能基準の設定
- データ品質チェック 
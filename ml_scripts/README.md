# 機械学習スクリプト

Tokyo Tree Doctorの機械学習パイプラインスクリプト

## ディレクトリ構造

- `data_preprocessing/` - データ前処理スクリプト
- `model_training/` - モデル学習スクリプト
- `model_inference/` - モデル推論スクリプト
- `evaluation/` - 評価スクリプト

## スクリプト機能

### データ前処理
- 画像正規化
- データ拡張
- 特徴量抽出
- データ分割

### モデル学習
- バッチ学習
- 転移学習
- アンサンブル学習
- ハイパーパラメータ最適化

### モデル推論
- リアルタイム推論
- バッチ推論
- モデルサーバー
- API統合

### 評価
- 性能評価
- モデル比較
- エラー分析
- レポート生成

## 実行方法

```bash
# データ前処理
python ml_scripts/data_preprocessing/preprocess.py

# モデル学習
python ml_scripts/model_training/train.py

# モデル推論
python ml_scripts/model_inference/inference.py
``` 
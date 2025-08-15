# Tokyo Tree Doctor - デプロイ手順

このドキュメントでは、Tokyo Tree Doctorアプリケーションを永続的なURLで公開する手順を説明します。

## デプロイ構成

- **フロントエンド**: Vercel (無料)
- **バックエンド**: Railway (無料枠あり)

## 前提条件

1. GitHubアカウント
2. Vercelアカウント (GitHubでサインアップ可能)
3. Railwayアカウント (GitHubでサインアップ可能)

## 手順

### 1. フロントエンドのデプロイ (Vercel)

1. [Vercel](https://vercel.com)にアクセスしてGitHubでサインアップ
2. "New Project"をクリック
3. GitHubリポジトリを選択
4. 以下の設定を行う：
   - **Framework Preset**: Other
   - **Root Directory**: `software/frontend`
   - **Build Command**: 空欄のまま
   - **Output Directory**: 空欄のまま
5. "Deploy"をクリック

デプロイ後、以下のようなURLが生成されます：
`https://tokyo-tree-doctor-frontend.vercel.app`

### 2. バックエンドのデプロイ (Railway)

1. [Railway](https://railway.app)にアクセスしてGitHubでサインアップ
2. "New Project"をクリック
3. "Deploy from GitHub repo"を選択
4. GitHubリポジトリを選択
5. 以下の設定を行う：
   - **Root Directory**: `software/backend`
   - **Environment**: Python
6. "Deploy"をクリック

デプロイ後、以下のようなURLが生成されます：
`https://tokyo-tree-doctor-backend.railway.app`

### 3. 環境変数の設定

#### Railway (バックエンド) で設定する環境変数：

```
ML_API_ENDPOINT=https://your-ml-api-endpoint.com/predict
```

#### Vercel (フロントエンド) で設定する環境変数：

```
VITE_API_BASE_URL=https://tokyo-tree-doctor-backend.railway.app/api/v1
```

### 4. フロントエンドのAPI接続設定更新

バックエンドのデプロイが完了したら、`software/frontend/config.js`の`apiBaseUrl`を実際のRailwayドメインに更新してください。

```javascript
production: {
  apiBaseUrl: 'https://your-actual-railway-domain.railway.app/api/v1',
}
```

### 5. カスタムドメインの設定 (オプション)

#### Vercelでカスタムドメインを設定：

1. Vercelプロジェクトの設定画面に移動
2. "Domains"セクションでカスタムドメインを追加
3. DNSレコードを設定

#### Railwayでカスタムドメインを設定：

1. Railwayプロジェクトの設定画面に移動
2. "Domains"セクションでカスタムドメインを追加
3. DNSレコードを設定

## トラブルシューティング

### よくある問題

1. **CORSエラー**
   - バックエンドの`ALLOWED_ORIGINS`にフロントエンドのドメインが含まれているか確認

2. **API接続エラー**
   - フロントエンドの`config.js`でAPIエンドポイントが正しく設定されているか確認

3. **ビルドエラー**
   - 依存関係が正しくインストールされているか確認
   - ログを確認してエラーの詳細を把握

### ログの確認方法

#### Vercel
- プロジェクトの"Functions"タブでログを確認

#### Railway
- プロジェクトの"Deployments"タブでログを確認

## メンテナンス

### 更新手順

1. GitHubリポジトリにコードをプッシュ
2. VercelとRailwayが自動的にデプロイを実行
3. デプロイ状況を確認

### 監視

- VercelとRailwayのダッシュボードでアプリケーションの状態を監視
- エラーが発生した場合はログを確認

## セキュリティ考慮事項

1. **環境変数**
   - 機密情報は環境変数として設定
   - リポジトリに直接記述しない

2. **CORS設定**
   - 本番環境では必要最小限のオリジンのみ許可

3. **API認証**
   - 必要に応じてAPIキーやJWT認証を実装

## コスト

- **Vercel**: 無料プランで十分
- **Railway**: 無料枠あり（月500時間）
- **カスタムドメイン**: 年間約1,000円程度

## サポート

問題が発生した場合は、以下を確認してください：

1. 各プラットフォームのドキュメント
2. GitHubのIssues
3. ログファイル

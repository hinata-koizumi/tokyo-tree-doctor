#!/bin/bash

# Tokyo Tree Doctor デプロイスクリプト

echo "🌳 Tokyo Tree Doctor デプロイスクリプト"
echo "======================================"

# 現在のブランチを確認
current_branch=$(git branch --show-current)
echo "現在のブランチ: $current_branch"

# 変更があるかチェック
if [[ -n $(git status --porcelain) ]]; then
    echo "⚠️  未コミットの変更があります"
    echo "変更をコミットしてからデプロイしてください"
    exit 1
fi

# リモートにプッシュ
echo "📤 GitHubにプッシュ中..."
git push origin $current_branch

if [ $? -eq 0 ]; then
    echo "✅ プッシュ完了"
    echo ""
    echo "🚀 デプロイが開始されました"
    echo ""
    echo "📋 次の手順:"
    echo "1. Vercelでフロントエンドのデプロイ状況を確認"
    echo "   https://vercel.com/dashboard"
    echo ""
    echo "2. Railwayでバックエンドのデプロイ状況を確認"
    echo "   https://railway.app/dashboard"
    echo ""
    echo "3. デプロイ完了後、フロントエンドのconfig.jsを更新"
    echo "   バックエンドの実際のドメインに変更してください"
    echo ""
    echo "🌐 フロントエンドURL: https://tokyo-tree-doctor-frontend.vercel.app"
    echo "🔧 バックエンドURL: https://tokyo-tree-doctor-backend.railway.app"
else
    echo "❌ プッシュに失敗しました"
    exit 1
fi

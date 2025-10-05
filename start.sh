#!/bin/bash

echo "🌳 Tree Doctor アプリケーションを起動中..."

# PM2がインストールされているかチェック
if ! command -v pm2 &> /dev/null; then
    echo "PM2をインストール中..."
    npm install -g pm2
fi

# フロントエンドの依存関係をインストール
echo "フロントエンドの依存関係をインストール中..."
cd frontend && npm install && cd ..

# フロントエンドをビルド
echo "フロントエンドをビルド中..."
npm run build:frontend

# PM2でアプリケーションを起動
echo "アプリケーションを起動中..."
pm2 start ecosystem.config.js

# 起動状況を表示
echo "起動状況を確認中..."
pm2 status

echo ""
echo "✅ Tree Doctor アプリケーションが起動しました！"
echo ""
echo "🌐 フロントエンド: http://localhost:3000"
echo "🔧 バックエンドAPI: http://localhost:8000"
echo "📊 PM2 ステータス: pm2 status"
echo "📝 ログ確認: pm2 logs"
echo ""
echo "💡 ターミナルを閉じてもアプリケーションは動作し続けます"
echo "🛑 停止する場合は: pm2 stop ecosystem.config.js"

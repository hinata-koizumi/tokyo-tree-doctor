#!/bin/bash

echo "🛑 Tree Doctor フロントエンドを停止中..."

# プロセスIDファイルが存在するかチェック
if [ -f "frontend.pid" ]; then
    PID=$(cat frontend.pid)
    echo "プロセスID $PID を停止中..."

    # プロセスを停止
    if kill $PID 2>/dev/null; then
        echo "✅ フロントエンドプロセスを停止しました"
    else
        echo "⚠️  プロセスID $PID が見つかりません"
    fi

    # プロセスIDファイルを削除
    rm -f frontend.pid
else
    echo "⚠️  プロセスIDファイルが見つかりません"
fi

# 念のため、フロントエンド関連プロセスをすべて停止
echo "残りのフロントエンドプロセスを停止中..."
pkill -f "npm run dev"
pkill -f "vite"

echo "✅ Tree Doctor フロントエンドを停止しました"
echo ""
echo "💡 再度起動する場合は: ./start-frontend.sh"

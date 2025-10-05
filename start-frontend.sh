#!/bin/bash

echo "🚀 Tree Doctor フロントエンドを起動中..."

# 既存のフロントエンドプロセスを停止
echo "既存のフロントエンドプロセスを停止中..."
pkill -f "npm run dev"
pkill -f "vite"

# 少し待機
sleep 2

# フロントエンドディレクトリに移動してバックグラウンドで起動
echo "フロントエンドをバックグラウンドで起動中..."
cd frontend
nohup npm run dev > ../frontend.log 2>&1 &

# プロセスIDを保存
echo $! > ../frontend.pid

# 少し待機してから確認
echo "フロントエンドの起動を確認中..."
sleep 10

# フロントエンドが起動しているか確認
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo ""
    echo "✅ Tree Doctor フロントエンドが起動しました！"
    echo ""
    echo "🌐 ローカルURL: http://localhost:3000"
    echo "📝 ログファイル: frontend.log"
    echo "🆔 プロセスID: $(cat ../frontend.pid)"
    echo ""
    echo "💡 このプロセスはCursorを閉じても動作し続けます"
    echo "🛑 停止する場合は: ./stop-frontend.sh"
    echo ""
else
    echo "❌ フロントエンドの起動に失敗しました"
    echo "ログを確認してください: cat frontend.log"
fi

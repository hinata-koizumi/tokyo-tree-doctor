#!/bin/bash

echo "🛑 Tree Doctor の公開URLを停止中..."

# プロセスIDファイルが存在するかチェック
if [ -f "ngrok.pid" ]; then
    PID=$(cat ngrok.pid)
    echo "プロセスID $PID を停止中..."
    
    # プロセスを停止
    if kill $PID 2>/dev/null; then
        echo "✅ ngrokプロセスを停止しました"
    else
        echo "⚠️  プロセスID $PID が見つかりません"
    fi
    
    # プロセスIDファイルを削除
    rm -f ngrok.pid
else
    echo "⚠️  プロセスIDファイルが見つかりません"
fi

# 念のため、ngrokプロセスをすべて停止
echo "残りのngrokプロセスを停止中..."
pkill -f ngrok

echo "✅ Tree Doctor の公開URLを停止しました"
echo ""
echo "💡 再度公開URLを発行する場合は: ./start-ngrok.sh"

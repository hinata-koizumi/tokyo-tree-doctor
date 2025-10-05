#!/bin/bash

echo "🌐 Tree Doctor の公開URLを発行中..."

# ngrokがインストールされているかチェック
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrokがインストールされていません"
    echo "インストール方法: https://ngrok.com/download"
    exit 1
fi

# 既存のngrokプロセスを停止
echo "既存のngrokプロセスを停止中..."
pkill -f ngrok

# 少し待機
sleep 2

# ngrokをバックグラウンドで起動
echo "ngrokトンネルを起動中..."
nohup ngrok start --config ngrok.yml frontend > ngrok.log 2>&1 &

# プロセスIDを保存
echo $! > ngrok.pid

# 少し待機してからURLを取得
echo "公開URLを取得中..."
sleep 5

# 公開URLを取得
PUBLIC_URL=$(curl -s http://localhost:4040/api/tunnels | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    for tunnel in data.get('tunnels', []):
        if tunnel.get('name') == 'frontend':
            print(tunnel.get('public_url', ''))
            break
except:
    print('')
")

if [ -n "$PUBLIC_URL" ]; then
    echo ""
    echo "✅ Tree Doctor の公開URLが発行されました！"
    echo ""
    echo "🌐 公開URL: $PUBLIC_URL"
    echo "🔧 ngrok管理画面: http://localhost:4040"
    echo "📝 ログファイル: ngrok.log"
    echo "🆔 プロセスID: $(cat ngrok.pid)"
    echo ""
    echo "💡 このURLはターミナルを閉じても動作し続けます"
    echo "🛑 停止する場合は: ./stop-ngrok.sh"
    echo ""
else
    echo "❌ 公開URLの取得に失敗しました"
    echo "ログを確認してください: cat ngrok.log"
fi

#!/bin/bash

echo "🛑 Tree Doctor アプリケーションを停止中..."

# PM2でアプリケーションを停止
pm2 stop ecosystem.config.js

echo "✅ アプリケーションが停止しました"
echo ""
echo "📊 現在のPM2ステータス:"
pm2 status

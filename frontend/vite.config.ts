import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 外部アクセスを許可
    port: 3000,
    allowedHosts: [
      'localhost',
      '192.168.0.225',
      '192.168.0.75',
      '83b0a15288df.ngrok-free.app',
      '.ngrok-free.app', // すべてのngrokホストを許可
      '.trycloudflare.com' // すべてのCloudflare Tunnelホストを許可
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0', // プレビューでも外部アクセスを許可
    port: 3000,
    allowedHosts: [
      'localhost',
      '192.168.0.225',
      '192.168.0.75',
      'exposed-likes-aids-kick.trycloudflare.com',
      'ur-surfaces-prescription-asks.trycloudflare.com',
      'closes-composition-arrest-offerings.trycloudflare.com',
      'gm-invention-francis-indonesian.trycloudflare.com',
      '.trycloudflare.com' // すべてのCloudflare Tunnelホストを許可
    ],
  },
})

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiProxyTarget = env.DEV_API_PROXY_TARGET || 'http://localhost:8080'

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@app': fileURLToPath(new URL('./src/app', import.meta.url)),
        '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
        '@widgets': fileURLToPath(new URL('./src/widgets', import.meta.url)),
        '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
        '@entities': fileURLToPath(new URL('./src/entities', import.meta.url)),
        '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      },
    },
    server: {
      port: 3000,
      host: true,
      proxy: {
        // API через тот же origin (localhost:3000), чтобы HttpOnly access_token
        // уходил и в REST, и в Socket.IO — иначе кука с :8080 не попадёт в WS на :3000.
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
        },
        '/realtime': {
          target: 'http://localhost:3001',
          ws: true,
        },
        '/socket.io': {
          target: 'http://localhost:3001',
          ws: true,
        },
      },
    },
  }
})

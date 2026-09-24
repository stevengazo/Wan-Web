import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Prefijo '' para leer también variables sin VITE_: se usan solo aquí y no llegan al bundle.
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.API_PROXY_TARGET || 'http://localhost:5238'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': apiTarget,
        '/hubs': { target: apiTarget, ws: true },
      },
    },
  }
})

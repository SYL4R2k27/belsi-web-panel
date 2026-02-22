import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// All known API path prefixes from the real backend (api.belsi.ru)
const apiPrefixes = [
  '/auth',
  '/curator',
  '/coordinator',
  '/foreman',
  '/shifts',
  '/shift',
  '/tasks',
  '/tools',
  '/support',
  '/user',
  '/users',
  '/photos',
  '/messenger',
  '/push',
  '/reports',
  '/health',
  '/profile',
]

const backendTarget = 'https://api.belsi.ru'

// Create proxy rules for each API prefix → real backend
const proxyConfig: Record<string, object> = {}
for (const prefix of apiPrefixes) {
  proxyConfig[prefix] = {
    target: backendTarget,
    changeOrigin: true,
    secure: true,
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  base: mode === 'production' ? '/panel/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: proxyConfig,
  },
}))

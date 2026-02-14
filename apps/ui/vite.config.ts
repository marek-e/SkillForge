import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const csp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' http://localhost:4320 ws://localhost:4320 http://localhost:4321 http://127.0.0.1:4320 ws://127.0.0.1:4320 http://127.0.0.1:4321",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join('; ')

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 4320,
    headers: {
      'Content-Security-Policy': csp,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

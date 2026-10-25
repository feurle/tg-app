import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Parallel worktrees override the ports, see docs/local-development.md.
const backendPort = process.env.SERVER_PORT ?? '8080'
const frontendPort = Number(process.env.VITE_PORT ?? 5173)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
  server: {
    port: frontendPort,
    strictPort: true,
    proxy: {
      '/api': `http://localhost:${backendPort}`
    }
  }
})

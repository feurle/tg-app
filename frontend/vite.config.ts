import { defineConfig } from 'vitest/config'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// SERVER_PORT / VITE_PORT override the ports, see docs/local-development.md.
const backendPort = process.env.SERVER_PORT ?? '8080'
const frontendPort = Number(process.env.VITE_PORT ?? 5173)

// Oldest browsers the public site supports. Vite's default (baseline-widely-available) starts at
// Safari/iOS 16.4; older iPads often stay on iOS 15. See docs/frontend.md#supported-browsers.
const BUILD_TARGET = ['chrome90', 'edge90', 'firefox90', 'safari15', 'ios15']

/**
 * Fails the build if a chunk contains a regex lookbehind. It cannot be transpiled, and Safari before
 * 16.4 rejects the whole bundle when it meets one, which leaves every page blank (#148).
 */
function noRegexLookbehind(): Plugin {
  return {
    name: 'no-regex-lookbehind',
    renderChunk(code, chunk) {
      const at = code.search(/\(\?<[=!]/)
      if (at !== -1) {
        this.error(`chunk "${chunk.name}" contains a regex lookbehind, which Safari < 16.4 cannot parse: …${code.slice(Math.max(0, at - 60), at + 40)}…`)
      }
      return null
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), noRegexLookbehind()],
  build: {
    target: BUILD_TARGET,
  },
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

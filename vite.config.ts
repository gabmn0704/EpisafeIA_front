/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // El usuario decide cuándo actualizar: el aviso lo muestra <UpdatePrompt />.
      registerType: 'prompt',
      injectRegister: false,
      // El service worker de MSW (mocks) convive solo en desarrollo; la PWA se activa solo en build.
      devOptions: { enabled: false },
      includeAssets: ['favicon.svg', 'icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'EpiSafe IA',
        short_name: 'EpiSafe',
        description: 'Prevención inteligente y ayuda inmediata para personas con epilepsia.',
        lang: 'es',
        start_url: '/app',
        scope: '/',
        id: '/app',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#f5f3ff',
        theme_color: '#5B2BFF',
        categories: ['health', 'medical'],
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
        shortcuts: [
          { name: 'Emergencia', url: '/app/emergencia', icons: [{ src: '/icon-192.png', sizes: '192x192' }] },
          { name: 'Registrar mi día', url: '/app/registro', icons: [{ src: '/icon-192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        // App shell: precache de los assets del build; las llamadas a la API nunca se cachean.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,webmanifest}'],
        globIgnores: ['**/mockServiceWorker.js'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /mockServiceWorker\.js$/],
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
    }),
  ],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: { port: 5173 },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('framer-motion') || id.includes('gsap')) return 'motion'
          if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/') || id.includes('/node_modules/react-router') || id.includes('/node_modules/scheduler/')) return 'vendor'
          return undefined
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})

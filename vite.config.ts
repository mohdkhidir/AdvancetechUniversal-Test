import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'charts': ['recharts'],
          'icons': ['lucide-react'],
        },
      },
    },
    target: 'ES2020',
    minify: 'terser',
    cssCodeSplit: true,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Medical Equipment Replacement Plan',
        short_name: 'EquipPlanner',
        description: 'LCCA-based Medical Equipment Replacement Planning Tool with Life Cycle Cost Analysis',
        theme_color: '#0f172a',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        categories: ['medical', 'productivity', 'utilities'],
        screenshots: [
          { src: 'screenshot-540x720.svg', sizes: '540x720', type: 'image/svg+xml', form_factor: 'narrow' },
          { src: 'screenshot-1280x720.svg', sizes: '1280x720', type: 'image/svg+xml', form_factor: 'wide' },
        ],
        icons: [
          { src: 'pwa-64x64.png',            sizes: '64x64',   type: 'image/png' },
          { src: 'pwa-192x192.png',           sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png',           sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Add Equipment', short_name: 'Add', description: 'Quickly add new equipment', url: '/?action=add', icons: [{ src: 'icon-add-192.svg', sizes: '192x192', type: 'image/svg+xml' }] },
          { name: 'View Reports', short_name: 'Reports', description: 'View replacement reports', url: '/?action=reports', icons: [{ src: 'icon-report-192.svg', sizes: '192x192', type: 'image/svg+xml' }] },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'gstatic-fonts-cache', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
  },
});

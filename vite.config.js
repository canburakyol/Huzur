import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isAndroidBuild = mode === 'android' || mode === 'android-debug'

  return {
  base: './',
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('/node_modules/firebase/') || id.includes('/node_modules/@firebase/')) {
            if (id.includes('/firebase/firestore') || id.includes('/@firebase/firestore')) {
              return 'vendor-firebase-firestore';
            }

            if (id.includes('/firebase/auth') || id.includes('/@firebase/auth')) {
              return 'vendor-firebase-auth';
            }

            if (id.includes('/firebase/functions') || id.includes('/@firebase/functions')) {
              return 'vendor-firebase-functions';
            }

            if (id.includes('/firebase/analytics') || id.includes('/@firebase/analytics')) {
              return 'vendor-firebase-analytics';
            }

            if (id.includes('/firebase/app-check') || id.includes('/@firebase/app-check')) {
              return 'vendor-firebase-app-check';
            }

            return 'vendor-firebase-core';
          }
          if (id.includes('/@revenuecat/')) return 'vendor-revenuecat';
          if (id.includes('/@capacitor/')) return 'vendor-capacitor';

          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) {
            return 'vendor-react';
          }

          if (id.includes('/react-i18next/') || id.includes('/i18next/')) {
            return 'vendor-i18n';
          }

          if (id.includes('/leaflet/') || id.includes('/react-leaflet/')) {
            return 'vendor-maps';
          }

          if (id.includes('/html2canvas/')) {
            return 'vendor-html2canvas';
          }

          if (id.includes('/lottie-react/') || id.includes('/lottie-web/')) {
            return 'vendor-lottie';
          }

          if (id.includes('/date-fns/')) return 'vendor-date';
        }
      }
    }
  },
  plugins: [
    react(),
    visualizer({
      open: false,
      filename: 'bundle-stats.html'
    }),
    VitePWA({
      selfDestroying: isAndroidBuild,
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.webp'],
      manifest: {
        name: 'Huzur - İslami Yaşam Asistanı',
        short_name: 'Huzur',
        description: 'Namaz, Kur\'an, zikirmatik ve daha fazlası',
        theme_color: '#0d1117',
        background_color: '#0d1117',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        icons: [
          { src: 'icons/icon-192.webp', sizes: '192x192', type: 'image/webp', purpose: 'any maskable' },
          { src: 'icons/icon-512.webp', sizes: '512x512', type: 'image/webp', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,webp,png,svg,woff2}'],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache-v2',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache-v2',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          }
        ]
      }
    })
  ],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.test.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.{js,jsx}',
        '**/*.config.js',
        'e2e/',
        'dist/',
        'functions/',
        'scripts/'
      ]
    }
  },
  }
})

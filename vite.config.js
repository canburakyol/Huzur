import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
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
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-i18next', 'i18next'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/functions'],
          ui: ['lucide-react', 'lottie-react'],
          maps: ['leaflet', 'react-leaflet']
        }
      }
    }
  },
  plugins: [
    react(),
    visualizer({
      open: false,
      filename: 'bundle-stats.html'
    })
  ],
})

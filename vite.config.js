import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
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
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('/node_modules/firebase/')) return 'vendor-firebase';
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

          if (id.includes('/lucide-react/')) {
            return 'vendor-icons';
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
    })
  ],
})

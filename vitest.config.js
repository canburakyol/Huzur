import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.js'],
    include: [
      'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'scripts/**/*.{test,spec}.{js,jsx,ts,tsx}'
    ],
    exclude: [
      'e2e/**',
      'node_modules/**',
      'dist/**',
      'android/**',
      'functions/**'
    ],
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
    },
    pool: 'threads'
  }
});

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: [
      'e2e/**',
      'node_modules/**',
      'dist/**',
      'android/**',
      'functions/**'
    ],
    pool: 'threads'
  }
});

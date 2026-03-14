import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/backend/**/*.test.js'],
    exclude: [
      'e2e/**',
      'node_modules/**',
      'dist/**',
      'android/**',
    ],
    pool: 'forks',
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});

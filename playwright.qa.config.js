import { defineConfig, devices } from '@playwright/test';

// Fast, deterministic release gate for the user-facing Android/WebView surface.
export default defineConfig({
  testDir: './e2e/qa',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 45_000,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'e2e/results/qa-html-report' }],
    ['json', { outputFile: 'e2e/results/qa-results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'qa-desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'qa-pixel-5', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

import { expect, test } from '@playwright/test';

test.describe('theme startup on install and upgrade', () => {
  test.use({ colorScheme: 'dark' });

  test('uses the Huzur light theme on a clean install', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect.poll(() => page.evaluate(() => localStorage.getItem('app_theme'))).toBe('light');
  });

  test('migrates an obsolete saved theme before the first screen is painted', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('app_theme', 'auto-vakit'));

    await page.reload();

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect.poll(() => page.evaluate(() => localStorage.getItem('app_theme'))).toBe('light');
  });
});

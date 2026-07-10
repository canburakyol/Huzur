import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 360, height: 480 } });

test('first-run onboarding stays scrollable and actionable on a short mobile viewport', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem('splashShown', 'true');
  });

  await page.goto('/');

  const dialog = page.locator('.growth-onboarding-overlay');
  await expect(dialog).toBeVisible({ timeout: 15000 });
  const firstChoice = dialog.locator('button').first();
  const initialChoiceText = await firstChoice.textContent();

  const layout = await dialog.evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
    overflowY: getComputedStyle(element).overflowY,
  }));

  expect(layout.overflowY).toBe('auto');
  expect(layout.scrollHeight).toBeGreaterThan(layout.clientHeight);

  const continueButton = dialog.getByRole('button', { name: /Devam et|Continue/i }).last();
  await continueButton.scrollIntoViewIfNeeded();
  await expect(continueButton).toBeInViewport();
  await continueButton.click();

  await expect.poll(() => firstChoice.textContent()).not.toBe(initialChoiceText);
  await expect.poll(() => dialog.evaluate((element) => element.scrollTop)).toBe(0);
});

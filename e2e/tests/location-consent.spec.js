import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 360, height: 640 } });

test('location consent is shown after onboarding and precedes other consent overlays', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('growthOnboardingCompleted', 'true');
    sessionStorage.setItem('splashShown', 'true');
  });

  await page.goto('/');

  const dialog = page.getByRole('dialog', { name: /Konumunu kullanabilir miyiz|location/i });
  await expect(dialog).toBeVisible({ timeout: 15000 });
  await expect(dialog.getByRole('button', { name: /Konumumu kullan/i })).toBeVisible();
  await expect(dialog.getByRole('button', { name: /İstanbul ile devam et/i })).toBeVisible();

  await dialog.getByRole('button', { name: /İstanbul ile devam et/i }).click();
  await expect(dialog).toBeHidden();
});

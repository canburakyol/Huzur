import { test, expect } from '@playwright/test';

async function completeOnboarding(page) {
  const dialog = page.locator('.growth-onboarding-overlay');
  const isShown = await dialog.waitFor({ state: 'visible', timeout: 15_000 }).then(() => true).catch(() => false);
  if (!isShown) return;

  for (let step = 0; step < 5 && await dialog.isVisible().catch(() => false); step += 1) {
    const skipButtons = dialog.getByRole('button', { name: /Simdilik gec|Şimdilik geç|Skip for now/i });
    while (await skipButtons.count() > 0 && await skipButtons.first().isVisible().catch(() => false)) {
      await skipButtons.first().click();
    }

    const continueButton = dialog.getByRole('button', {
      name: /Continue|Devam et|Basla|Başla|Get started|Start/i,
    }).last();
    await expect(continueButton).toBeVisible();
    await continueButton.click();
  }

  await expect(dialog).toBeHidden();
}

async function openFreshApp(page) {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem('splashShown', 'true');
    // Location consent is separately covered; keep P0 navigation deterministic.
    localStorage.setItem('locationConsentGiven', 'declined');
  });
  await page.goto('/');
  await completeOnboarding(page);
  await expect(page.getByTestId('bottom-navigation')).toBeVisible();
}

test.describe('P0 navigation smoke', () => {
  test('fresh install reaches the home screen with usable bottom navigation', async ({ page }) => {
    await openFreshApp(page);

    const navigation = page.getByTestId('bottom-navigation');
    await expect(navigation.getByTestId('bottom-tab-home')).toBeVisible();
    await expect(navigation.getByTestId('bottom-tab-quran')).toBeVisible();
    await expect(navigation.getByTestId('bottom-tab-menu')).toBeVisible();

    const navBox = await navigation.boundingBox();
    expect(navBox).not.toBeNull();
    expect(navBox.y + navBox.height).toBeLessThanOrEqual(page.viewportSize().height + 1);
  });

  test('Quran opens, its surah drawer works, and returning home remains possible', async ({ page }) => {
    await openFreshApp(page);

    await page.getByTestId('bottom-tab-quran').click();
    await expect(page.getByTestId('quran-screen')).toBeVisible();
    await expect(page.getByTestId('quran-drawer-toggle')).toBeVisible();

    await page.getByTestId('quran-drawer-toggle').click();
    await expect(page.getByTestId('quran-drawer')).toBeVisible();
    await expect(page.getByTestId('quran-surah-1')).toBeVisible();

    await page.getByTestId('quran-drawer-close').click();
    await page.getByTestId('quran-close').click();
    await expect(page.getByTestId('bottom-tab-home')).toHaveAttribute('aria-current', 'page');
  });

  test('hamburger menu opens Quran and Settings entry points', async ({ page }) => {
    await openFreshApp(page);

    await page.getByTestId('bottom-tab-menu').click();
    await expect(page.getByTestId('hamburger-menu')).toBeVisible();
    await expect(page.getByTestId('menu-feature-quran')).toBeVisible();
    await expect(page.getByTestId('menu-feature-settings')).toBeVisible();

    await page.getByTestId('menu-feature-quran').click();
    await expect(page.getByTestId('quran-screen')).toBeVisible();
  });
});

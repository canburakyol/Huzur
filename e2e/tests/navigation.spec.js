import { test, expect } from '@playwright/test';
import { 
  waitForSplashScreen, 
  dismissLocationPrompt, 
  dismissNotificationPrompt,
  checkForErrors 
} from '../utils/test-helpers.js';

test.describe('Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForSplashScreen(page);
    await dismissLocationPrompt(page);
    await dismissNotificationPrompt(page);
  });

  test('homepage loads successfully', async ({ page }) => {
    // Check main elements are visible
    await expect(page.locator('.app-container')).toBeVisible();
    await expect(page.locator('.feature-grid')).toBeVisible();
    
    // Check for errors
    const errors = await checkForErrors(page);
    expect(errors).toHaveLength(0);
  });

  test('feature grid displays all main features', async ({ page }) => {
    const expectedFeatures = [
      { icon: '🧭', name: 'Kıble' },
      { icon: '📿', name: 'Zikirmatik' },
      { icon: '☀️', name: 'Esbah' },
      { icon: '✨', name: '99 Esma' },
      { icon: '👨‍👩‍👧', name: 'Aile' },
      { icon: '💌', name: 'Tebrik Kartları' },
      { icon: '🌙', name: 'İmsakiye' },
      { icon: '📖', name: 'Hadisler' },
      { icon: '📻', name: 'Radyo' },
      { icon: '🗺️', name: 'Siyer Haritası' },
      { icon: '🤲', name: 'Dua Takipçisi' },
    ];

    for (const feature of expectedFeatures) {
      const featureBtn = page.locator(`.feature-btn:has-text("${feature.icon}")`);
      await expect(featureBtn).toBeVisible();
    }
  });

  test('bottom navigation is visible', async ({ page }) => {
    await expect(page.locator('.bottom-nav')).toBeVisible();
    
    // Check nav items (using translation keys from i18n)
    const navItems = ['Home', 'Quran', 'Assistant', 'Community', 'Menu'];
    for (const item of navItems) {
      await expect(page.locator(`.nav-item:has-text("${item}")`)).toBeVisible();
    }
  });

  test('prayer time banner displays', async ({ page }) => {
    // The banner is rendered with inline styles, not a class
    // Check for prayer time related text or elements
    const prayerBanner = page.locator('div').filter({ hasText: /Time|Vakit|İstanbul/ }).first();
    await expect(prayerBanner).toBeVisible();
    
    // Check for location indicator
    await expect(page.locator('text=Istanbul')).toBeVisible();
  });

  test('quran arabic glyphs render without tofu squares', async ({ page }) => {
    // Navigate to Quran tab
    await page.locator('.nav-item').filter({ hasText: /Quran|Kuran/i }).first().click();

    // Wait for ayah text container
    const arabicAyah = page.locator('.ayah-arabic').first();
    await expect(arabicAyah).toBeVisible({ timeout: 10000 });

    const text = (await arabicAyah.textContent()) || '';

    // Tofu replacement character / white-square style artifacts should not exist
    expect(text).not.toContain('□');
    expect(text).not.toContain('�');

    // Ensure contains Arabic script range
    expect(/\p{Script=Arabic}/u.test(text)).toBeTruthy();
  });
});

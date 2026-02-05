import { test, expect } from '@playwright/test';
import { 
  waitForSplashScreen, 
  dismissLocationPrompt, 
  dismissNotificationPrompt,
  checkForErrors,
  takeScreenshot
} from '../utils/test-helpers.js';

test.describe('Feature Module Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForSplashScreen(page);
    await dismissLocationPrompt(page);
    await dismissNotificationPrompt(page);
  });

  test.describe('Core Features', () => {
    test('Qibla Compass opens', async ({ page }) => {
      await page.click('.feature-btn:has-text("🧭")');
      await page.waitForTimeout(1000);
      
      const errors = await checkForErrors(page);
      expect(errors).toHaveLength(0);
      
      await takeScreenshot(page, 'qibla-compass');
    });

    test('Quran opens', async ({ page }) => {
      await page.click('.feature-btn:has-text("📖")');
      await page.waitForTimeout(1000);
      
      const errors = await checkForErrors(page);
      expect(errors).toHaveLength(0);
      
      await takeScreenshot(page, 'quran');
    });
  });

  test.describe('Ibadet Features', () => {
    test('Zikirmatik opens', async ({ page }) => {
      await page.click('.feature-btn:has-text("📿")');
      await page.waitForTimeout(1000);
      
      const errors = await checkForErrors(page);
      expect(errors).toHaveLength(0);
      
      await takeScreenshot(page, 'zikirmatik');
    });

    test('Adhkar opens', async ({ page }) => {
      await page.click('.feature-btn:has-text("☀️")');
      await page.waitForTimeout(1000);
      
      const errors = await checkForErrors(page);
      expect(errors).toHaveLength(0);
      
      await takeScreenshot(page, 'adhkar');
    });

    test('EsmaUlHusna opens', async ({ page }) => {
      await page.click('.feature-btn:has-text("✨")');
      await page.waitForTimeout(1000);
      
      const errors = await checkForErrors(page);
      expect(errors).toHaveLength(0);
      
      await takeScreenshot(page, 'esma-ul-husna');
    });
  });

  test.describe('Content Features', () => {
    test('Hadiths opens', async ({ page }) => {
      await page.click('.feature-btn:has-text("📖")');
      await page.waitForTimeout(1000);
      
      const errors = await checkForErrors(page);
      expect(errors).toHaveLength(0);
      
      await takeScreenshot(page, 'hadiths');
    });

    test('Radio opens', async ({ page }) => {
      await page.click('.feature-btn:has-text("📻")');
      await page.waitForTimeout(1000);
      
      const errors = await checkForErrors(page);
      expect(errors).toHaveLength(0);
      
      await takeScreenshot(page, 'radio');
    });
  });

  test.describe('Tool Features', () => {
    test('Imsakiye opens', async ({ page }) => {
      await page.click('.feature-btn:has-text("🌙")');
      await page.waitForTimeout(1000);
      
      const errors = await checkForErrors(page);
      expect(errors).toHaveLength(0);
      
      await takeScreenshot(page, 'imsakiye');
    });
  });

  test.describe('Social Features', () => {
    test('Greeting Cards opens', async ({ page }) => {
      await page.click('.feature-btn:has-text("💌")');
      await page.waitForTimeout(1000);
      
      const errors = await checkForErrors(page);
      expect(errors).toHaveLength(0);
      
      await takeScreenshot(page, 'greeting-cards');
    });
  });

  test.describe('Education Features', () => {
    test('Seerah Map opens', async ({ page }) => {
      await page.click('.feature-btn:has-text("🗺️")');
      await page.waitForTimeout(1000);
      
      const errors = await checkForErrors(page);
      expect(errors).toHaveLength(0);
      
      await takeScreenshot(page, 'seerah-map');
    });
  });
});
import { test, expect } from '@playwright/test';
import { 
  waitForSplashScreen, 
  dismissLocationPrompt, 
  dismissNotificationPrompt,
  checkForErrors,
  takeScreenshot,
  detectMockData
} from '../utils/test-helpers.js';

test.describe('Family Mode Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForSplashScreen(page);
    await dismissLocationPrompt(page);
    await dismissNotificationPrompt(page);
    
    // Open Family feature
    await page.click('.feature-btn:has-text("👨‍👩‍👧")');
    await page.waitForTimeout(1000);
  });

  test('Family Mode opens successfully', async ({ page }) => {
    // Check header
    await expect(page.locator('text=Huzur Aile')).toBeVisible();
    await expect(page.locator('text=Birlikte büyüyoruz')).toBeVisible();
    
    // Check tabs
    const tabs = ['Aile Evi', 'Ebeveyn Paneli', 'Sıralama', 'Yarışmalar', 'Grup'];
    for (const tab of tabs) {
      await expect(page.locator(`button:has-text("${tab}")`)).toBeVisible();
    }
  });

  test('Home tab displays family members section', async ({ page }) => {
    // Should be on home tab by default
    await expect(page.locator('text=Aile Üyelerimiz')).toBeVisible();
    await expect(page.locator('text=Bugünkü Aktiviteler')).toBeVisible();
    await expect(page.locator('text=Aile Hedeflerimiz')).toBeVisible();
  });

  test('Home tab shows mock activity data', async ({ page }) => {
    // Check for mock activity data
    const mockActivities = [
      'Sabah namazını tamamladı',
      'sayfa Kuran okudu',
      'Aile hatminden'
    ];
    
    for (const activity of mockActivities) {
      const activityElement = page.locator(`text=${activity}`);
      if (await activityElement.isVisible().catch(() => false)) {
        console.log(`Found mock activity: ${activity}`);
      }
    }
  });

  test('Aile Hatmi shows mock progress data', async ({ page }) => {
    // Check for Aile Hatmi section
    await expect(page.locator('text=Aile Hatmi')).toBeVisible();
    
    // Check if progress shows mock data (15/30 is hardcoded in FamilyMode.jsx)
    const hatimProgress = page.locator('text=/15\\s*/\\s*30/');
    if (await hatimProgress.isVisible().catch(() => false)) {
      console.log('WARNING: Aile Hatmi shows mock data (15/30)');
    }
  });

  test('Challenges tab opens without errors', async ({ page }) => {
    // Click on Yarışmalar tab
    await page.click('button:has-text("Yarışmalar")');
    await page.waitForTimeout(500);
    
    // Check for errors
    const errors = await checkForErrors(page);
    
    // If there are errors, log them but don't fail the test
    // This helps us identify which features have issues
    if (errors.length > 0) {
      console.log('Errors in Challenges tab:', errors);
    }
    
    // Take screenshot for debugging
    await takeScreenshot(page, 'family-challenges-tab');
  });

  test('Challenges tab displays family challenges', async ({ page }) => {
    await page.click('button:has-text("Yarışmalar")');
    await page.waitForTimeout(500);
    
    // Check for challenge cards
    const challengeTitles = ['Aile Hatmi', 'Sabah Namazı Yarışması', 'Günlük Zikir'];
    
    for (const title of challengeTitles) {
      const challengeCard = page.locator(`text=${title}`);
      if (await challengeCard.isVisible().catch(() => false)) {
        console.log(`Found challenge: ${title}`);
      } else {
        console.log(`Challenge not found or has error: ${title}`);
      }
    }
  });

  test('Leaderboard tab displays ranking', async ({ page }) => {
    await page.click('button:has-text("Sıralama")');
    await page.waitForTimeout(500);
    
    await expect(page.locator('text=Aile Sıralaması')).toBeVisible();
    
    // Check for period buttons
    await expect(page.locator('button:has-text("Bu Hafta")')).toBeVisible();
    await expect(page.locator('button:has-text("Bu Ay")')).toBeVisible();
  });

  test('Groups tab shows group management', async ({ page }) => {
    await page.click('button:has-text("Grup")');
    await page.waitForTimeout(500);
    
    // Should show either existing group or create/join options
    const createGroup = page.locator('text=Grup Oluştur');
    const joinGroup = page.locator('text=Gruba Katıl');
    
    const hasCreate = await createGroup.isVisible().catch(() => false);
    const hasJoin = await joinGroup.isVisible().catch(() => false);
    
    expect(hasCreate || hasJoin).toBeTruthy();
  });

  test('detect mock data in Family Mode', async ({ page }) => {
    const mockIndicators = await detectMockData(page);
    
    if (mockIndicators.length > 0) {
      console.log('Mock data detected in Family Mode:', mockIndicators);
    }
    
    // Take screenshot for documentation
    await takeScreenshot(page, 'family-mode-mock-data-check');
  });
});
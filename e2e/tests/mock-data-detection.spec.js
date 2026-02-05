import { test, expect } from '@playwright/test';
import { 
  waitForSplashScreen, 
  dismissLocationPrompt, 
  dismissNotificationPrompt,
  detectMockData,
  takeScreenshot
} from '../utils/test-helpers.js';

/**
 * This test suite specifically checks for mock data and placeholders
 * across all features to identify what needs to be replaced with real data
 */
test.describe('Mock Data Detection Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForSplashScreen(page);
    await dismissLocationPrompt(page);
    dismissNotificationPrompt(page);
  });

  test('detect mock data in Family Mode - Home tab', async ({ page }) => {
    await page.click('.feature-btn:has-text("👨‍👩‍👧")');
    await page.waitForTimeout(1000);
    
    // Check for mock activity data
    const mockActivities = [
      { name: 'Ahmet', action: 'Sabah namazını tamamladı' },
      { name: 'Zeynep', action: 'sayfa Kuran okudu' },
      { name: 'Fatma (Anne)', action: 'Aile hatminden' }
    ];
    
    for (const activity of mockActivities) {
      const element = page.locator(`text=${activity.action}`);
      if (await element.isVisible().catch(() => false)) {
        console.log(`MOCK DATA: Activity feed contains mock user "${activity.name}" with action "${activity.action}"`);
      }
    }
    
    // Check for Aile Hatmi mock progress
    const hatimSection = page.locator('.goal-card.family-hatim');
    if (await hatimSection.isVisible().catch(() => false)) {
      const progressText = await hatimSection.locator('text=/\\d+\\s*/\\s*30/').textContent().catch(() => '');
      if (progressText.includes('15 / 30')) {
        console.log('MOCK DATA: Aile Hatmi shows hardcoded progress (15/30)');
      }
    }
    
    await takeScreenshot(page, 'family-mock-data-home');
  });

  test('detect mock data in Family Mode - Challenges tab', async ({ page }) => {
    await page.click('.feature-btn:has-text("👨‍👩‍👧")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Yarışmalar")');
    await page.waitForTimeout(500);
    
    // Check for mock challenges
    const mockChallenges = [
      { title: 'Aile Hatmi', progress: 15, target: 30 },
      { title: 'Sabah Namazı Yarışması', progress: 3, target: 7 },
      { title: 'Günlük Zikir', progress: 6500, target: 10000 }
    ];
    
    for (const challenge of mockChallenges) {
      const challengeCard = page.locator(`.challenge-card-large:has-text("${challenge.title}")`);
      if (await challengeCard.isVisible().catch(() => false)) {
        console.log(`MOCK DATA: Challenge "${challenge.title}" has hardcoded progress (${challenge.progress}/${challenge.target})`);
      }
    }
    
    await takeScreenshot(page, 'family-mock-data-challenges');
  });

  test('detect mock data in Family Mode - Dashboard tab', async ({ page }) => {
    await page.click('.feature-btn:has-text("👨‍👩‍👧")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Ebeveyn Paneli")');
    await page.waitForTimeout(500);
    
    // Check for mock child stats
    const mockStats = [
      { label: 'Namaz', value: '3/5' },
      { label: 'Sayfa', value: '2' },
      { label: 'Zikir', value: '100' },
      { label: 'Görev', value: '5' }
    ];
    
    for (const stat of mockStats) {
      const statCard = page.locator(`.stat-card:has-text("${stat.label}")`);
      if (await statCard.isVisible().catch(() => false)) {
        const value = await statCard.locator('.stat-value').textContent().catch(() => '');
        console.log(`MOCK DATA: Dashboard stat "${stat.label}" shows value "${value}"`);
      }
    }
    
    // Check for mock appreciation messages
    const appreciationCard = page.locator('.appreciation-card');
    if (await appreciationCard.isVisible().catch(() => false)) {
      const fromText = await appreciationCard.locator('.appreciation-from').textContent().catch(() => '');
      if (fromText === 'Anne') {
        console.log('MOCK DATA: Dashboard shows mock appreciation from "Anne"');
      }
    }
    
    await takeScreenshot(page, 'family-mock-data-dashboard');
  });

  test('detect TODO comments in rendered content', async ({ page }) => {
    // Family Mode has a TODO for appreciation sending
    await page.click('.feature-btn:has-text("👨‍👩‍👧")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Ebeveyn Paneli")');
    await page.waitForTimeout(500);
    
    // Check if Takdir tab has working functionality
    await page.click('button:has-text("Takdir")');
    await page.waitForTimeout(500);
    
    // Try to send appreciation
    const sendButton = page.locator('.send-appreciation-btn');
    if (await sendButton.isVisible().catch(() => false)) {
      console.log('INFO: Takdir (Appreciation) feature is visible');
      // The TODO comment indicates this functionality is not fully implemented
      console.log('TODO: handleSendAppreciation function needs implementation');
    }
    
    await takeScreenshot(page, 'family-todo-check');
  });

  test('generate mock data report', async ({ page }) => {
    const mockDataReport = {
      familyMode: {
        homeTab: [],
        challengesTab: [],
        dashboardTab: []
      },
      otherFeatures: []
    };
    
    // Check Family Mode
    await page.click('.feature-btn:has-text("👨‍👩‍👧")');
    await page.waitForTimeout(1000);
    
    // Home tab
    const homeMockIndicators = await detectMockData(page);
    mockDataReport.familyMode.homeTab = homeMockIndicators;
    
    // Challenges tab
    await page.click('button:has-text("Yarışmalar")');
    await page.waitForTimeout(500);
    const challengesMockIndicators = await detectMockData(page);
    mockDataReport.familyMode.challengesTab = challengesMockIndicators;
    
    // Dashboard tab
    await page.click('button:has-text("Ebeveyn Paneli")');
    await page.waitForTimeout(500);
    const dashboardMockIndicators = await detectMockData(page);
    mockDataReport.familyMode.dashboardTab = dashboardMockIndicators;
    
    // Log the report
    console.log('\n=== MOCK DATA DETECTION REPORT ===');
    console.log(JSON.stringify(mockDataReport, null, 2));
    console.log('===================================\n');
    
    // Save report to file
    await page.evaluate((report) => {
      const dataStr = JSON.stringify(report, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mock-data-report.json';
      a.click();
    }, mockDataReport);
  });
});
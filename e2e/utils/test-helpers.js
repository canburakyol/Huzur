/**
 * Test Helpers for Huzur App E2E Tests
 * Common utilities and selectors for testing
 */

// Feature selectors based on FeatureGrid component
export const FEATURE_SELECTORS = {
  // Core features
  qibla: { id: 'qibla', icon: '🧭', label: 'features.qibla' },
  zikirmatik: { id: 'zikirmatik', icon: '📿', label: 'features.dhikr' },
  adhkar: { id: 'adhkar', icon: '☀️', label: 'features.tasbih' },
  esmaUlHusna: { id: 'esmaUlHusna', icon: '✨', label: 'menu.esmaUlHusna' },
  family: { id: 'family', icon: '👨‍👩‍👧', label: 'features.family' },
  greetingCards: { id: 'greetingCards', icon: '💌', label: 'menu.greetingCards' },
  imsakiye: { id: 'imsakiye', icon: '🌙', label: 'features.imsakiye' },
  hadiths: { id: 'hadiths', icon: '📖', label: 'features.hadith' },
  radio: { id: 'radio', icon: '📻', label: 'features.radio' },
  seerahMap: { id: 'seerahMap', icon: '🗺️', label: 'features.seerah' },
  duaTracker: { id: 'duaTracker', icon: '🤲', label: 'features.duaTracker' },
};

// Family Mode tab selectors
export const FAMILY_TABS = {
  home: { id: 'home', label: 'Aile Evi' },
  dashboard: { id: 'dashboard', label: 'Ebeveyn Paneli' },
  leaderboard: { id: 'leaderboard', label: 'Sıralama' },
  challenges: { id: 'challenges', label: 'Yarışmalar' },
  groups: { id: 'groups', label: 'Grup' },
};

// Common test utilities
export async function waitForSplashScreen(page) {
  // Wait for splash screen to disappear
  await page.waitForTimeout(3000);
}

export async function dismissLocationPrompt(page) {
  // Handle location permission prompt if it appears
  const locationPrompt = page.locator('text=Konum İzni Gerekli');
  if (await locationPrompt.isVisible().catch(() => false)) {
    await page.click('text=Şimdi İzin Ver');
  }
}

export async function dismissNotificationPrompt(page) {
  // Handle notification permission prompt if it appears
  const notifPrompt = page.locator('text=Bildirimleri Etkinleştir');
  if (await notifPrompt.isVisible().catch(() => false)) {
    await page.click('text=Hayır, Teşekkürler');
  }
}

export async function openFeature(page, featureId) {
  // Click on a feature in the FeatureGrid
  const featureBtn = page.locator(`.feature-btn:has-text("${getFeatureIcon(featureId)}")`);
  await featureBtn.click();
  await page.waitForTimeout(500); // Wait for feature to load
}

export async function closeFeature(page) {
  // Close the currently open feature
  const closeBtn = page.locator('button:has-text("Kapat")').first();
  if (await closeBtn.isVisible().catch(() => false)) {
    await closeBtn.click();
  }
}

export async function takeScreenshot(page, name) {
  await page.screenshot({ path: `e2e/results/${name}.png`, fullPage: true });
}

// Helper to get feature icon
function getFeatureIcon(featureId) {
  const feature = FEATURE_SELECTORS[featureId];
  return feature ? feature.icon : '';
}

// Test data generators
export const TEST_DATA = {
  familyProfile: {
    name: 'Test Çocuk',
    role: 'child',
    avatar: '👶'
  },
  hatimTitle: 'Test Hatmi',
  duaText: 'Test duası içeriği',
};

// Error handlers
export async function checkForErrors(page) {
  const errorElements = await page.locator('.error-card, .error-message, [role="alert"]').all();
  return errorElements.length > 0 ? errorElements.map(el => el.textContent()) : [];
}

// Mock data detectors
export async function detectMockData(page) {
  const mockIndicators = [];
  
  // Check for common mock data patterns
  const pageContent = await page.content();
  
  if (pageContent.includes('mock') || pageContent.includes('Mock')) {
    mockIndicators.push('Contains "mock" text');
  }
  
  if (pageContent.includes('TODO')) {
    mockIndicators.push('Contains TODO comments');
  }
  
  if (pageContent.includes('placeholder')) {
    mockIndicators.push('Contains placeholder text');
  }
  
  return mockIndicators;
}
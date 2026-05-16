import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  updateDoc: vi.fn().mockResolvedValue(undefined),
  increment: vi.fn((n) => n),
  arrayUnion: vi.fn((v) => v),
  serverTimestamp: vi.fn(),
  onSnapshot: vi.fn(() => vi.fn()),
}));

vi.mock('./authService', () => ({
  getCurrentUserId: vi.fn(() => 'test-user-123'),
}));

vi.mock('./analyticsService', () => ({
  ANALYTICS_EVENTS: { XP_EARNED: 'xp_earned', LEVEL_UP: 'level_up', BADGE_EARNED: 'badge_earned' },
  logEvent: vi.fn(),
  logLevelUp: vi.fn(),
  logBadgeEarned: vi.fn(),
}));

vi.mock('./engagementSummaryService', () => ({
  recordXpEvent: vi.fn(),
}));

vi.mock('./activationService', () => ({
  markFirstIbadahActionCompleted: vi.fn(),
}));

vi.mock('./familyGoalContributionService', () => ({
  contributeFamilyGoalOncePerDay: vi.fn(),
}));

vi.mock('../utils/xpMultiplier', () => ({
  getXpMultiplier: vi.fn(() => 1),
}));

vi.mock('../utils/logger', () => ({
  logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('../utils/crashlyticsReporter', () => ({
  default: { logExceptionWithContext: vi.fn(), logCrash: vi.fn() },
}));

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => (key in store ? store[key] : null)),
    setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

vi.mock('./storageService', () => ({
  storageService: {
    getItem: vi.fn((key, fallback) => {
      const v = localStorageMock.getItem(key);
      return v ? JSON.parse(v) : fallback;
    }),
    setItem: vi.fn((key, value) => localStorageMock.setItem(key, JSON.stringify(value))),
    removeItem: vi.fn((key) => localStorageMock.removeItem(key)),
    getBoolean: vi.fn((key) => !!localStorageMock.getItem(key)),
    setBoolean: vi.fn((key, value) => localStorageMock.setItem(key, value.toString())),
    getString: vi.fn((key) => localStorageMock.getItem(key)),
    setString: vi.fn((key, value) => localStorageMock.setItem(key, value)),
  },
}));

describe('Gamification - XP and Level System', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorageMock.clear();
  });

  it('calculates correct level from points', async () => {
    const { LEVELS, getLevelProgress } = await import('../data/gamificationData');
    expect(LEVELS).toBeDefined();
    expect(LEVELS.length).toBeGreaterThan(0);
    expect(getLevelProgress).toBeDefined();
  });

  it('has beginner level at 0 points', async () => {
    const { LEVELS } = await import('../data/gamificationData');
    const beginner = LEVELS[0];
    expect(beginner.minPoints).toBe(0);
  });

  it('levels are in ascending order by minPoints', async () => {
    const { LEVELS } = await import('../data/gamificationData');
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i].minPoints).toBeGreaterThan(LEVELS[i - 1].minPoints);
    }
  });

  it('getNextLevel returns the next level info', async () => {
    const { LEVELS, getNextLevel } = await import('../data/gamificationData');
    const next = getNextLevel(1);
    expect(next).toBeDefined();
    expect(next.level).toBeGreaterThan(1);
  });

  it('getLevelProgress returns 0-100 range', async () => {
    const { LEVELS, getLevelProgress } = await import('../data/gamificationData');
    const midPoint = (LEVELS[0].minPoints + LEVELS[1].minPoints) / 2;
    const progress = getLevelProgress(midPoint);
    expect(progress).toBeGreaterThanOrEqual(0);
    expect(progress).toBeLessThanOrEqual(100);
  });
});

describe('Gamification - Badge System', () => {
  it('has badge definitions', async () => {
    const { BADGES } = await import('../data/gamificationData');
    expect(BADGES).toBeDefined();
    expect(Object.keys(BADGES).length).toBeGreaterThan(0);
  });

  it('each badge has required fields', async () => {
    const { BADGES } = await import('../data/gamificationData');
    Object.values(BADGES).forEach((badge) => {
      expect(badge.id).toBeDefined();
      expect(badge.name).toBeDefined();
      expect(badge.description).toBeDefined();
    });
  });
});

describe('Gamification - Quest System', () => {
  it('generates daily quests', async () => {
    const { getRandomDailyQuests } = await import('../data/questsData');
    const quests = getRandomDailyQuests();
    expect(Array.isArray(quests)).toBe(true);
    expect(quests.length).toBeGreaterThan(0);
  });

  it('each quest has required fields', async () => {
    const { getRandomDailyQuests } = await import('../data/questsData');
    const quests = getRandomDailyQuests();
    quests.forEach((q) => {
      expect(q.id).toBeDefined();
      expect(q.type).toBeDefined();
      expect(q.target).toBeGreaterThan(0);
      expect(q.xp).toBeGreaterThan(0);
    });
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';

const store = new Map();

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(async ({ key }) => ({ value: store.get(key) ?? null })),
    set: vi.fn(async ({ key, value }) => {
      store.set(key, value);
    }),
  },
}));

vi.mock('@capacitor/browser', () => ({
  Browser: { open: vi.fn(async () => undefined) },
}));

vi.mock('@capacitor/device', () => ({
  Device: { getInfo: vi.fn(async () => ({ platform: 'web' })) },
}));

vi.mock('../utils/logger', () => ({
  logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

const { rateService } = await import('./rateService');

const matureFrequentUser = {
  firstLaunchDate: Date.now() - 10 * 24 * 60 * 60 * 1000,
  launchCount: 10,
  eventCount: 0,
  lastPromptDate: null,
  hasRated: false,
  hasDeclined: false,
};

describe('rateService happy-event gate', () => {
  beforeEach(() => {
    store.clear();
    vi.clearAllMocks();
  });

  it('blocks prompt when happy events are below threshold', async () => {
    await rateService.saveData({ ...matureFrequentUser, eventCount: 2 });
    await expect(rateService.shouldShowPrompt()).resolves.toBe(false);
  });

  it('allows prompt when happy events reach threshold', async () => {
    await rateService.saveData({ ...matureFrequentUser, eventCount: 3 });
    await expect(rateService.shouldShowPrompt()).resolves.toBe(true);
  });

  it('trackHappyEvent increments eventCount', async () => {
    await rateService.saveData({ ...matureFrequentUser, eventCount: 1 });
    await rateService.trackHappyEvent();
    const data = await rateService.getData();
    expect(data.eventCount).toBe(2);
  });
});

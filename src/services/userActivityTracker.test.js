import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getLifecycleStage, recordAppOpen } from './userActivityTracker';

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('userActivityTracker', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it('classifies lifecycle stages for retention decisions', () => {
    expect(getLifecycleStage(null)).toBe('first_open');
    expect(getLifecycleStage(0)).toBe('same_day');
    expect(getLifecycleStage(1)).toBe('returning_1d');
    expect(getLifecycleStage(3)).toBe('cooling_2_4d');
    expect(getLifecycleStage(8)).toBe('comeback_5_13d');
    expect(getLifecycleStage(20)).toBe('dormant_14d_plus');
  });

  it('returns app open attribution without duplicating same-hour history', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-03T09:10:00+03:00'));

    const firstOpen = recordAppOpen();
    const duplicateOpen = recordAppOpen();

    expect(firstOpen).toMatchObject({
      recorded: true,
      lifecycle_stage: 'first_open',
      active_days_14d: 1
    });
    expect(duplicateOpen).toMatchObject({
      recorded: false,
      lifecycle_stage: 'same_day',
      active_days_14d: 1
    });
  });

  it('marks long gap returns as dormant comeback opens', () => {
    vi.useFakeTimers();
    localStorage.setItem('huzur_app_open_history', JSON.stringify([
      { date: '2026-04-10', hour: 18, ts: new Date('2026-04-10T18:00:00+03:00').getTime() }
    ]));
    vi.setSystemTime(new Date('2026-05-03T10:00:00+03:00'));

    const context = recordAppOpen();

    expect(context).toMatchObject({
      recorded: true,
      days_since_last_open: 23,
      lifecycle_stage: 'dormant_14d_plus',
      previous_open_date: '2026-04-10'
    });
  });
});

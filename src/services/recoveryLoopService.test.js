import { beforeEach, describe, expect, it, vi } from 'vitest';
import { storageService } from './storageService';
import { getRecoveryLoopState, persistRecoverySessionReference } from './recoveryLoopService';

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

describe('recoveryLoopService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('keeps the pre-open last visit reference for the active session', () => {
    storageService.setString('huzur_last_visit_date', '2026-03-20');
    persistRecoverySessionReference('2026-03-26', '2026-03-20');
    storageService.setString('huzur_last_visit_date', '2026-03-26');

    const state = getRecoveryLoopState(new Date(2026, 2, 26));

    expect(state.lastVisitKey).toBe('2026-03-20');
    expect(state.inactiveDays).toBe(6);
    expect(state.riskBand).toBe('comeback');
  });
});

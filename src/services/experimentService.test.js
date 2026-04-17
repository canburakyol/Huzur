import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { STORAGE_KEYS } from '../constants';
import { storageService } from './storageService';
import {
  clearExperimentAssignments,
  getExperimentAssignments,
  getExperimentVariant,
  setExperimentVariant,
} from './experimentService';

describe('experimentService', () => {
  let store = {};

  beforeEach(() => {
    store = {};
    vi.restoreAllMocks();

    vi.spyOn(storageService, 'getItem').mockImplementation((key, fallbackValue = null) => (
      Object.prototype.hasOwnProperty.call(store, key) ? store[key] : fallbackValue
    ));
    vi.spyOn(storageService, 'setItem').mockImplementation((key, value) => {
      store[key] = value;
    });
    vi.spyOn(storageService, 'removeItem').mockImplementation((key) => {
      delete store[key];
    });
    vi.spyOn(storageService, 'getString').mockImplementation((key, fallbackValue = '') => {
      const value = store[key];
      return typeof value === 'string' ? value : fallbackValue;
    });
    vi.spyOn(storageService, 'setString').mockImplementation((key, value) => {
      store[key] = String(value);
    });

    clearExperimentAssignments();
    storageService.removeItem(STORAGE_KEYS.EXPERIMENT_UNIT_SEED);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps deterministic assignment stable for the same unit', () => {
    const first = getExperimentVariant('onboarding_headline_v1');
    const second = getExperimentVariant('onboarding_headline_v1');

    expect(second).toBe(first);
    expect(getExperimentAssignments().onboarding_headline_v1.variant).toBe(first);
  });

  it('allows forcing a variant and persists it', () => {
    const forced = setExperimentVariant('paywall_cta_v1', 'B');

    expect(forced).toBe('B');
    expect(getExperimentVariant('paywall_cta_v1')).toBe('B');
    expect(getExperimentAssignments().paywall_cta_v1.forced).toBe(true);
  });
});

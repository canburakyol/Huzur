import { beforeEach, describe, expect, it, vi } from 'vitest';
import { STORAGE_KEYS } from '../constants';

const storage = vi.hoisted(() => {
  let values: Record<string, string> = {};
  return {
    reset: () => { values = {}; },
    getString: (key: string, fallback = '') => values[key] || fallback,
    setString: (key: string, value: string) => {
      values[key] = value;
      return true;
    },
  };
});

vi.mock('./storageService', () => ({
  storageService: {
    getString: storage.getString,
    setString: storage.setString,
  },
}));

import {
  DEFAULT_THEME_MODE,
  initializeThemeMode,
  normalizeThemeMode,
  resolveThemeMode,
} from './themeModeService';

describe('themeModeService', () => {
  beforeEach(() => {
    storage.reset();
    document.documentElement.removeAttribute('data-theme');
  });

  it('uses and persists the Huzur light theme on a clean install', () => {
    const resolved = initializeThemeMode(true);

    expect(resolved).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(storage.getString(STORAGE_KEYS.THEME)).toBe(DEFAULT_THEME_MODE);
  });

  it('only follows the device theme when system mode was explicitly selected', () => {
    storage.setString(STORAGE_KEYS.THEME, 'system');

    expect(initializeThemeMode(true)).toBe('dark');
    expect(resolveThemeMode('system', false)).toBe('light');
  });

  it('migrates obsolete or invalid saved theme values to light', () => {
    storage.setString(STORAGE_KEYS.THEME, 'auto-vakit');

    expect(normalizeThemeMode('green-gold')).toBe('light');
    expect(initializeThemeMode(true)).toBe('light');
    expect(storage.getString(STORAGE_KEYS.THEME)).toBe('light');
  });
});

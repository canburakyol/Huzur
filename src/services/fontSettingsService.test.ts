import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_FONT_SETTINGS,
  FONT_SETTINGS_KEY,
  applyFontSettings,
  loadFontSettings,
  sanitizeFontSettings,
  saveFontSettings,
} from './fontSettingsService';

describe('fontSettingsService', () => {
  beforeEach(() => {
    // The shared setup mocks localStorage without memory; back it with a Map so a save can be read back.
    const store = new Map<string, string>();
    vi.mocked(localStorage.getItem).mockImplementation((key: string) => store.get(key) ?? null);
    vi.mocked(localStorage.setItem).mockImplementation((key: string, value: string) => { store.set(key, value); });
    document.documentElement.removeAttribute('style');
  });

  it('falls back to defaults for missing, broken or unknown values', () => {
    expect(loadFontSettings()).toEqual(DEFAULT_FONT_SETTINGS);
    localStorage.setItem(FONT_SETTINGS_KEY, '{not json');
    expect(loadFontSettings()).toEqual(DEFAULT_FONT_SETTINGS);
    expect(sanitizeFontSettings({ arabicFontFamily: 'Kitab', arabicFontSize: 'x' })).toEqual(DEFAULT_FONT_SETTINGS);
  });

  it('clamps sizes into the allowed range', () => {
    expect(sanitizeFontSettings({ arabicFontSize: 99, turkishFontSize: 2, lineHeight: 2.25 })).toMatchObject({
      arabicFontSize: 44,
      turkishFontSize: 13,
      lineHeight: 2.3,
    });
  });

  it('persists a choice and applies it to the page so it survives a restart', () => {
    saveFontSettings({ ...DEFAULT_FONT_SETTINGS, arabicFontFamily: 'Scheherazade New', arabicFontSize: 34 });
    document.documentElement.removeAttribute('style');

    applyFontSettings(loadFontSettings());
    const style = document.documentElement.style;
    expect(style.getPropertyValue('--font-arabic')).toContain("'Scheherazade New'");
    expect(style.getPropertyValue('--quran-arabic-size')).toBe('34px');
    expect(style.getPropertyValue('--quran-translation-size')).toBe('16px');
    expect(style.getPropertyValue('--quran-line-height')).toBe('2');
  });
});

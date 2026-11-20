import { storageService } from './storageService';

// Text settings chosen on the Yazı Ayarları screen. Applied as CSS variables on <html> at startup and on change:
// --font-arabic (every Arabic text), --quran-arabic-size / --quran-translation-size / --quran-line-height (Quran reader).
export type FontSettings = {
  arabicFontFamily: string;
  arabicFontSize: number;
  turkishFontSize: number;
  lineHeight: number;
};

export const FONT_SETTINGS_KEY = 'huzur_font_settings';

// Only fonts bundled in main.jsx, so the choice also works offline.
export const ARABIC_FONTS = [
  { id: 'Amiri', name: 'Amiri' },
  { id: 'Scheherazade New', name: 'Scheherazade' },
  { id: 'Noto Naskh Arabic', name: 'Noto Naskh' },
] as const;

export const FONT_LIMITS = {
  arabicFontSize: { min: 20, max: 44, step: 2 },
  turkishFontSize: { min: 13, max: 22, step: 1 },
  lineHeight: { min: 1.6, max: 2.6, step: 0.1 },
} as const;

// Matches the reader's original look (28px Arabic on a 56px line, 16px translation).
export const DEFAULT_FONT_SETTINGS: FontSettings = {
  arabicFontFamily: 'Amiri',
  arabicFontSize: 28,
  turkishFontSize: 16,
  lineHeight: 2,
};

const clamp = (value: unknown, { min, max }: { min: number; max: number }, fallback: number): number => {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.round(Math.min(max, Math.max(min, n)) * 10) / 10;
};

export const sanitizeFontSettings = (raw: unknown): FontSettings => {
  const value = (raw && typeof raw === 'object' ? raw : {}) as Partial<Record<keyof FontSettings, unknown>>;
  const family = ARABIC_FONTS.some((font) => font.id === value.arabicFontFamily)
    ? String(value.arabicFontFamily)
    : DEFAULT_FONT_SETTINGS.arabicFontFamily;
  return {
    arabicFontFamily: family,
    arabicFontSize: clamp(value.arabicFontSize, FONT_LIMITS.arabicFontSize, DEFAULT_FONT_SETTINGS.arabicFontSize),
    turkishFontSize: clamp(value.turkishFontSize, FONT_LIMITS.turkishFontSize, DEFAULT_FONT_SETTINGS.turkishFontSize),
    lineHeight: clamp(value.lineHeight, FONT_LIMITS.lineHeight, DEFAULT_FONT_SETTINGS.lineHeight),
  };
};

export const loadFontSettings = (): FontSettings =>
  sanitizeFontSettings(storageService.getItem<unknown>(FONT_SETTINGS_KEY, null));

export const saveFontSettings = (settings: FontSettings): FontSettings => {
  const clean = sanitizeFontSettings(settings);
  storageService.setItem(FONT_SETTINGS_KEY, clean);
  applyFontSettings(clean);
  return clean;
};

export const applyFontSettings = (settings: FontSettings, root: HTMLElement | undefined = typeof document === 'undefined' ? undefined : document.documentElement): void => {
  if (!root) return;
  root.style.setProperty('--font-arabic', `'${settings.arabicFontFamily}', 'Amiri', 'Noto Naskh Arabic', serif`);
  root.style.setProperty('--quran-arabic-size', `${settings.arabicFontSize}px`);
  root.style.setProperty('--quran-translation-size', `${settings.turkishFontSize}px`);
  root.style.setProperty('--quran-line-height', String(settings.lineHeight));
};

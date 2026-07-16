import { STORAGE_KEYS } from '../constants';
import { storageService } from './storageService';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedThemeMode = 'light' | 'dark';

export const DEFAULT_THEME_MODE: ThemeMode = 'light';

const VALID_THEME_MODES = new Set<ThemeMode>(['light', 'dark', 'system']);

export const normalizeThemeMode = (value?: string | null): ThemeMode => {
  if (value && VALID_THEME_MODES.has(value as ThemeMode)) {
    return value as ThemeMode;
  }
  return DEFAULT_THEME_MODE;
};

export const resolveThemeMode = (
  mode: ThemeMode,
  prefersDark: boolean,
): ResolvedThemeMode => (mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode);

const getPrefersDark = (): boolean => (
  typeof window !== 'undefined'
  && typeof window.matchMedia === 'function'
  && window.matchMedia('(prefers-color-scheme: dark)').matches
);

export const initializeThemeMode = (prefersDark = getPrefersDark()): ResolvedThemeMode => {
  const storedMode = storageService.getString(STORAGE_KEYS.THEME);
  const normalizedMode = normalizeThemeMode(storedMode);

  if (storedMode !== normalizedMode) {
    storageService.setString(STORAGE_KEYS.THEME, normalizedMode);
  }

  const resolvedMode = resolveThemeMode(normalizedMode, prefersDark);
  document.documentElement.setAttribute('data-theme', resolvedMode);
  return resolvedMode;
};

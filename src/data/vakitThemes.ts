export interface VakitThemeColors {
  [key: string]: string;
}

export interface VakitTheme {
  id: string;
  name: string;
  colors: VakitThemeColors;
  bodyGradient: string;
}

export type VakitThemeKey = 'FAJR' | 'DAY' | 'MAGHRIB' | 'ISHA' | 'NIGHT';

const SEMANTIC_VAKIT_COLORS: VakitThemeColors = {
  '--bg-gradient-start': 'var(--surface-page)',
  '--bg-gradient-end': 'var(--surface-page)',
  '--bg-gradient-accent': 'var(--secondary)',
  '--text-color': 'var(--on-surface)',
  '--text-color-light': 'var(--on-surface-variant)',
  '--text-color-muted': 'color-mix(in srgb, var(--on-surface) 62%, transparent)',
  '--primary-color': 'var(--primary)',
  '--primary-dark': 'var(--primary)',
  '--accent-color': 'var(--secondary)',
  '--glass-bg': 'var(--surface-container-lowest)',
  '--glass-border': 'var(--card-border)',
  '--card-bg': 'var(--surface-container-lowest)',
  '--input-border': 'var(--secondary)'
};

const semanticVakitTheme = (id: string, name: string): VakitTheme => ({
  id,
  name,
  colors: { ...SEMANTIC_VAKIT_COLORS },
  bodyGradient: 'var(--surface-page)'
});

export const VAKIT_THEMES: Record<VakitThemeKey, VakitTheme> = {
  FAJR: semanticVakitTheme('vakit-fajr', 'Sabah (Fecr)'),
  DAY: semanticVakitTheme('vakit-day', 'Gündüz'),
  MAGHRIB: semanticVakitTheme('vakit-maghrib', 'Akşam (Mağrib)'),
  ISHA: semanticVakitTheme('vakit-isha', 'Yatsı'),
  NIGHT: semanticVakitTheme('vakit-night', 'Gece')
};

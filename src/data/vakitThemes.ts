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

const semanticVakitTheme = (
  id: string,
  name: string,
  overrides: VakitThemeColors = {},
  bodyGradient = 'var(--surface-page)'
): VakitTheme => ({
  id,
  name,
  colors: { ...SEMANTIC_VAKIT_COLORS, ...overrides },
  bodyGradient,
});

const tintTop = (hex: string, amount: string): string =>
  `linear-gradient(180deg, color-mix(in srgb, ${hex} ${amount}, var(--surface-page)) 0%, var(--surface-page) 62%)`;

export const VAKIT_THEMES: Record<VakitThemeKey, VakitTheme> = {
  // Fecr: gül-altın şafak
  FAJR: semanticVakitTheme('vakit-fajr', 'Sabah (Fecr)', {
    '--ambient-gold': 'rgba(201, 141, 75, 0.24)',
    '--bg-gradient-accent': '#c98d4b',
    '--accent-color': '#a97a3f',
  }, tintTop('#c98d4b', '14%')),
  // Gündüz: varsayılan sakin palet
  DAY: semanticVakitTheme('vakit-day', 'Gündüz'),
  // Mağrib: sıcak kehribar gün batımı
  MAGHRIB: semanticVakitTheme('vakit-maghrib', 'Akşam (Mağrib)', {
    '--ambient-gold': 'rgba(176, 102, 52, 0.26)',
    '--bg-gradient-accent': '#b06634',
    '--accent-color': '#a86a35',
  }, tintTop('#b06634', '14%')),
  // Yatsı: derin zümrüt gece
  ISHA: semanticVakitTheme('vakit-isha', 'Yatsı', {
    '--ambient-teal': 'rgba(22, 90, 70, 0.24)',
    '--bg-gradient-accent': 'var(--primary)',
    '--accent-color': 'var(--primary)',
  }, tintTop('#163b2b', '10%')),
  // Gece: en koyu dinlenme tonu
  NIGHT: semanticVakitTheme('vakit-night', 'Gece', {
    '--ambient-teal': 'rgba(20, 60, 50, 0.28)',
    '--ambient-gold': 'rgba(181, 138, 71, 0.08)',
    '--bg-gradient-accent': 'var(--primary)',
  }, tintTop('#163b2b', '16%')),
};

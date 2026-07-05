export interface AccentColor {
  id: string;
  name: string;
  color: string;
  dark: string;
  rgb: string;
}

export interface ThemeColors {
  [key: string]: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
  bodyGradient: string;
}

export const ACCENT_COLORS: AccentColor[] = [
  { id: 'amber', name: 'Adaçayı', color: 'var(--accent-amber)', dark: 'var(--accent-amber-dark)', rgb: '141, 170, 145' },
  { id: 'antique-gold', name: 'Tezhip', color: 'var(--accent-antique)', dark: 'var(--accent-antique-dark)', rgb: '170, 131, 67' },
  { id: 'emerald', name: 'Orman', color: 'var(--accent-emerald)', dark: 'var(--accent-emerald-dark)', rgb: '74, 101, 79' },
  { id: 'deep-emerald', name: 'Derin Orman', color: 'var(--accent-deep-emerald)', dark: 'var(--accent-deep-emerald-dark)', rgb: '27, 48, 34' },
  { id: 'olive-gold', name: 'Yumuşak Adaçayı', color: 'var(--accent-olive)', dark: 'var(--accent-olive-dark)', rgb: '141, 170, 145' },
];

export const THEMES: Theme[] = [
  {
    id: 'green-gold',
    name: 'Yesil & Altin',
    colors: {
      '--nav-accent': 'var(--secondary)',
      '--primary-color': 'var(--primary)',
      '--primary-dark': 'var(--primary)',
      '--accent-color': 'var(--secondary)',
      '--accent-vibrant': 'var(--secondary)',
      '--accent-gold-light': 'var(--secondary)',
      '--nav-accent-rgb': '141, 170, 145',
    },
    bodyGradient: 'var(--surface-page)'
  },
];

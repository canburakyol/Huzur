/**
 * Vakit Themes - Namaz vakitlerine gore dinamik yesil-altin paletleri
 */

export const VAKIT_THEMES = {
  FAJR: {
    id: 'vakit-fajr',
    name: 'Sabah (Fecr)',
    colors: {
      '--bg-gradient-start': '#065f46',
      '--bg-gradient-end': '#0f766e',
      '--bg-gradient-accent': '#fbbf24',
      '--text-color': '#f8fafc',
      '--text-color-light': '#fde68a',
      '--text-color-muted': 'rgba(209, 213, 219, 0.75)',
      '--primary-color': '#fbbf24',
      '--primary-dark': '#b45309',
      '--accent-color': '#f59e0b',
      '--glass-bg': 'rgba(6, 95, 70, 0.72)',
      '--glass-border': 'rgba(245, 158, 11, 0.25)',
      '--card-bg': 'rgba(6, 95, 70, 0.82)',
      '--input-border': '#fbbf24'
    },
    bodyGradient: 'linear-gradient(135deg, #065f46 0%, #0f766e 100%)'
  },
  DAY: {
    id: 'vakit-day',
    name: 'Gunduz',
    colors: {
      '--bg-gradient-start': '#0f766e',
      '--bg-gradient-end': '#065f46',
      '--bg-gradient-accent': '#f59e0b',
      '--text-color': '#f8fafc',
      '--text-color-light': '#fde68a',
      '--text-color-muted': 'rgba(209, 213, 219, 0.72)',
      '--primary-color': '#f59e0b',
      '--primary-dark': '#b45309',
      '--accent-color': '#fbbf24',
      '--glass-bg': 'rgba(6, 95, 70, 0.7)',
      '--glass-border': 'rgba(251, 191, 36, 0.25)',
      '--card-bg': 'rgba(6, 95, 70, 0.78)',
      '--input-border': '#f59e0b'
    },
    bodyGradient: 'linear-gradient(135deg, #0f766e 0%, #065f46 100%)'
  },
  MAGHRIB: {
    id: 'vakit-maghrib',
    name: 'Aksam (Magrib)',
    colors: {
      '--bg-gradient-start': '#064e3b',
      '--bg-gradient-end': '#042f2e',
      '--bg-gradient-accent': '#b45309',
      '--text-color': '#f8fafc',
      '--text-color-light': '#fde68a',
      '--text-color-muted': 'rgba(209, 213, 219, 0.7)',
      '--primary-color': '#b45309',
      '--primary-dark': '#78350f',
      '--accent-color': '#f59e0b',
      '--glass-bg': 'rgba(4, 47, 46, 0.8)',
      '--glass-border': 'rgba(180, 83, 9, 0.28)',
      '--card-bg': 'rgba(4, 47, 46, 0.85)',
      '--input-border': '#b45309'
    },
    bodyGradient: 'linear-gradient(135deg, #064e3b 0%, #042f2e 100%)'
  },
  ISHA: {
    id: 'vakit-isha',
    name: 'Yatsi',
    colors: {
      '--bg-gradient-start': '#042f2e',
      '--bg-gradient-end': '#022c22',
      '--bg-gradient-accent': '#f59e0b',
      '--text-color': '#e5e7eb',
      '--text-color-light': '#fde68a',
      '--text-color-muted': 'rgba(148, 163, 184, 0.78)',
      '--primary-color': '#f59e0b',
      '--primary-dark': '#b45309',
      '--accent-color': '#fbbf24',
      '--glass-bg': 'rgba(2, 44, 34, 0.84)',
      '--glass-border': 'rgba(245, 158, 11, 0.2)',
      '--card-bg': 'rgba(2, 44, 34, 0.9)',
      '--input-border': '#f59e0b'
    },
    bodyGradient: 'linear-gradient(135deg, #042f2e 0%, #022c22 100%)'
  },
  NIGHT: {
    id: 'vakit-night',
    name: 'Gece',
    colors: {
      '--bg-gradient-start': '#022c22',
      '--bg-gradient-end': '#031f1c',
      '--bg-gradient-accent': '#fbbf24',
      '--text-color': '#e5e7eb',
      '--text-color-light': '#fde68a',
      '--text-color-muted': 'rgba(148, 163, 184, 0.74)',
      '--primary-color': '#fbbf24',
      '--primary-dark': '#b45309',
      '--accent-color': '#f59e0b',
      '--glass-bg': 'rgba(2, 44, 34, 0.9)',
      '--glass-border': 'rgba(251, 191, 36, 0.2)',
      '--card-bg': 'rgba(3, 31, 28, 0.92)',
      '--input-border': '#fbbf24'
    },
    bodyGradient: 'linear-gradient(135deg, #022c22 0%, #031f1c 50%, #042f2e 100%)'
  }
};

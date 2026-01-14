/**
 * Vakit Themes - Namaz vakitlerine göre dinamik renk paletleri
 */

export const VAKIT_THEMES = {
  FAJR: { // Sabah
    id: 'vakit-fajr',
    name: 'Sabah (Fecr)',
    colors: {
      '--bg-gradient-start': '#1e3a5f', // Derin şafak mavisi
      '--bg-gradient-end': '#4a90e2',
      '--bg-gradient-accent': '#ff9a9e', // Şafak pembesi
      '--text-color': '#ffffff',
      '--text-color-light': '#ff9a9e',
      '--text-color-muted': '#a0c4ff',
      '--primary-color': '#ff9a9e',
      '--primary-dark': '#f06292',
      '--accent-color': '#ffd166',
      '--glass-bg': 'rgba(30, 58, 95, 0.7)',
      '--glass-border': 'rgba(255, 154, 158, 0.3)',
      '--card-bg': 'rgba(40, 70, 110, 0.8)',
      '--input-border': '#ff9a9e'
    },
    bodyGradient: 'linear-gradient(135deg, #1e3a5f 0%, #4a90e2 100%)'
  },
  DAY: { // Öğle & İkindi
    id: 'vakit-day',
    name: 'Gündüz',
    colors: {
      '--bg-gradient-start': '#4facfe', // Parlak gökyüzü
      '--bg-gradient-end': '#00f2fe',
      '--bg-gradient-accent': '#f6d365', // Güneş altın
      '--text-color': '#1a2a6c',
      '--text-color-light': '#f6d365',
      '--text-color-muted': '#2c3e50',
      '--primary-color': '#1a2a6c',
      '--primary-dark': '#0f1a4a',
      '--accent-color': '#f39c12',
      '--glass-bg': 'rgba(255, 255, 255, 0.6)',
      '--glass-border': 'rgba(246, 211, 101, 0.4)',
      '--card-bg': 'rgba(255, 255, 255, 0.8)',
      '--input-border': '#1a2a6c'
    },
    bodyGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  MAGHRIB: { // Akşam
    id: 'vakit-maghrib',
    name: 'Akşam (Mağrib)',
    colors: {
      '--bg-gradient-start': '#2c3e50', // Alacakaranlık mavisi
      '--bg-gradient-end': '#fd746c',   // Gün batımı turuncusu
      '--bg-gradient-accent': '#ff9068', // Sıcak turuncu
      '--text-color': '#ffffff',
      '--text-color-light': '#ff9068',
      '--text-color-muted': '#bdc3c7',
      '--primary-color': '#ff9068',
      '--primary-dark': '#e67e22',
      '--accent-color': '#f39c12',
      '--glass-bg': 'rgba(44, 62, 80, 0.7)',
      '--glass-border': 'rgba(253, 116, 108, 0.3)',
      '--card-bg': 'rgba(60, 80, 100, 0.8)',
      '--input-border': '#ff9068'
    },
    bodyGradient: 'linear-gradient(135deg, #2c3e50 0%, #fd746c 100%)'
  },
  ISHA: { // Yatsı
    id: 'vakit-isha',
    name: 'Yatsı (Yatsı)',
    colors: {
      '--bg-gradient-start': '#000428', // Gece yarısı mavisi
      '--bg-gradient-end': '#004e92',   // Derin okyanus mavisi
      '--bg-gradient-accent': '#764ba2', // Mistik mor
      '--text-color': '#e0e0e0',
      '--text-color-light': '#764ba2',
      '--text-color-muted': '#8e9eab',
      '--primary-color': '#764ba2',
      '--primary-dark': '#667eea',
      '--accent-color': '#9b59b6',
      '--glass-bg': 'rgba(0, 4, 40, 0.8)',
      '--glass-border': 'rgba(118, 75, 162, 0.3)',
      '--card-bg': 'rgba(0, 78, 146, 0.6)',
      '--input-border': '#764ba2'
    },
    bodyGradient: 'linear-gradient(135deg, #000428 0%, #004e92 100%)'
  },
  NIGHT: { // Gece (Teheccüd)
    id: 'vakit-night',
    name: 'Gece',
    colors: {
      '--bg-gradient-start': '#0f0c29', // Derin gece
      '--bg-gradient-end': '#302b63',
      '--bg-gradient-accent': '#f1c40f', // Yıldız sarısı
      '--text-color': '#e0e0e0',
      '--text-color-light': '#f1c40f',
      '--text-color-muted': '#95a5a6',
      '--primary-color': '#f1c40f',
      '--primary-dark': '#d4af37',
      '--accent-color': '#e67e22',
      '--glass-bg': 'rgba(15, 12, 41, 0.8)',
      '--glass-border': 'rgba(241, 196, 15, 0.2)',
      '--card-bg': 'rgba(48, 43, 99, 0.8)',
      '--input-border': '#f1c40f'
    },
    bodyGradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)'
  }
};

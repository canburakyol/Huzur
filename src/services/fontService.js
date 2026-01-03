/**
 * Font ayarlarını global olarak uygulayan yardımcı servis
 */

const STORAGE_KEY = 'huzur_font_settings';

export const applyStoredFontSettings = () => {
  const savedSettings = localStorage.getItem(STORAGE_KEY);
  if (savedSettings) {
    try {
      const s = JSON.parse(savedSettings);
      document.documentElement.style.setProperty('--arabic-font-size', `${s.arabicFontSize}px`);
      document.documentElement.style.setProperty('--turkish-font-size', `${s.turkishFontSize}px`);
      document.documentElement.style.setProperty('--arabic-font-family', `'${s.arabicFontFamily}', serif`);
      document.documentElement.style.setProperty('--quran-line-height', s.lineHeight);
    } catch (e) {
      console.warn('Font settings apply error:', e);
    }
  }
};

export default {
  applyStoredFontSettings
};

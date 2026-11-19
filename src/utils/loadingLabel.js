// Shown before translation files load, so it reads the stored language directly.
const LOADING_LABELS = { tr: 'Yükleniyor…', en: 'Loading…', de: 'Wird geladen…', id: 'Memuat…' };

export const getLoadingLabel = () => {
  let lang = 'tr';
  try {
    lang = (localStorage.getItem('app_language') || localStorage.getItem('i18nextLng') || navigator.language || 'tr').slice(0, 2);
  } catch {
    // storage unavailable: keep the default
  }
  return LOADING_LABELS[lang] || LOADING_LABELS.tr;
};

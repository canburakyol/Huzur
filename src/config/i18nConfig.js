export const DEFAULT_LANGUAGE_CODE = 'tr';
export const FALLBACK_BASE_LANGUAGE = 'en';

export const SUPPORTED_LANGUAGE_CODES = ['tr', 'en', 'ar', 'id', 'es', 'fr', 'de'];

export const SUPPORTED_LANGUAGE_OPTIONS = [
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' }
];

export const RTL_LANGUAGE_CODES = ['ar'];

export const I18N_NAMESPACES = [
  'translation',
  'components',
  'surahs',
  'tajweed',
  'wordByWord',
  'prayers',
  'zikirWorld',
  'esma',
  'hadiths',
  'legal',
  'multimedia',
  'prayerTeacher',
  'tespihat'
];

export const isSupportedLanguage = (languageCode) => SUPPORTED_LANGUAGE_CODES.includes(languageCode);

export const isRtlLanguage = (languageCode) => RTL_LANGUAGE_CODES.includes(languageCode);


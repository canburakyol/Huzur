import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

/**
 * i18next Configuration
 * Supports: English (en), Turkish (tr), Arabic (ar)
 * 
 * Translation files are loaded from public/locales/{language}/translation.json
 */
i18n
  // Load translations using HTTP (from public/locales)
  .use(HttpBackend)
  // Detect user language from browser settings
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    // Supported languages
    supportedLngs: ['en', 'tr', 'ar'],
    
    // Fallback language when translation is not found
    fallbackLng: 'tr',
    
    // Default namespace
    ns: ['translation', 'surahs', 'tajweed', 'wordByWord', 'prayers', 'zikirWorld'],
    defaultNS: 'translation',
    
    // Debug mode (disable in production)
    debug: import.meta.env.DEV,
    
    // Interpolation settings
    interpolation: {
      // React already handles escaping
      escapeValue: false,
    },
    
    // Backend configuration (where to load translations from)
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    // Language detection configuration
    detection: {
      // Order of language detection methods
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Key to use in localStorage
      lookupLocalStorage: 'i18nextLng',
      // Cache user language in localStorage
      caches: ['localStorage'],
    },
    
    // React-specific options
    react: {
      // Wait for translations to load before rendering
      useSuspense: true,
    },
  });

export default i18n;

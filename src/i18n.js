import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import {
  DEFAULT_LANGUAGE_CODE,
  FALLBACK_BASE_LANGUAGE,
  I18N_NAMESPACES,
  SUPPORTED_LANGUAGE_CODES
} from './config/i18nConfig';

const buildFallbackChain = (languageCode) => {
  if (languageCode === FALLBACK_BASE_LANGUAGE) {
    return [FALLBACK_BASE_LANGUAGE, DEFAULT_LANGUAGE_CODE];
  }

  if (languageCode === DEFAULT_LANGUAGE_CODE) {
    return [DEFAULT_LANGUAGE_CODE, FALLBACK_BASE_LANGUAGE];
  }

  return [languageCode, FALLBACK_BASE_LANGUAGE];
};

const fallbackLng = SUPPORTED_LANGUAGE_CODES.reduce(
  (acc, languageCode) => ({
    ...acc,
    [languageCode]: buildFallbackChain(languageCode)
  }),
  {
    default: [FALLBACK_BASE_LANGUAGE, DEFAULT_LANGUAGE_CODE]
  }
);

/**
 * i18next Configuration
 * Supports: Turkish (tr), English (en), Arabic (ar), Indonesian (id), Spanish (es), French (fr), German (de)
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
    supportedLngs: SUPPORTED_LANGUAGE_CODES,
    
    // Fallback language when translation is not found
    fallbackLng,
    
    // Default namespace
    ns: I18N_NAMESPACES,
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

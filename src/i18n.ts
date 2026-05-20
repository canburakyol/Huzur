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

const buildFallbackChain = (languageCode: string): string[] => {
  if (languageCode === FALLBACK_BASE_LANGUAGE) {
    return [FALLBACK_BASE_LANGUAGE, DEFAULT_LANGUAGE_CODE];
  }

  if (languageCode === DEFAULT_LANGUAGE_CODE) {
    return [DEFAULT_LANGUAGE_CODE, FALLBACK_BASE_LANGUAGE];
  }

  return [languageCode, FALLBACK_BASE_LANGUAGE, DEFAULT_LANGUAGE_CODE];
};

const fallbackLng: Record<string, string[]> = SUPPORTED_LANGUAGE_CODES.reduce(
  (acc, languageCode) => ({
    ...acc,
    [languageCode]: buildFallbackChain(languageCode)
  }),
  {
    default: [FALLBACK_BASE_LANGUAGE, DEFAULT_LANGUAGE_CODE]
  }
);

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: SUPPORTED_LANGUAGE_CODES,
    fallbackLng,
    ns: I18N_NAMESPACES,
    defaultNS: 'translation',
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
    react: {
      useSuspense: true,
    },
  });

export default i18n;

export const DEFAULT_LANGUAGE_CODE = 'tr';
export const FALLBACK_BASE_LANGUAGE = 'en';

export const SUPPORTED_LANGUAGE_CODES = ['tr', 'en', 'id', 'de'] as const;

export type SupportedLanguageCode = typeof SUPPORTED_LANGUAGE_CODES[number];

export interface LanguageOption {
  code: SupportedLanguageCode | string;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' }
];

export const RTL_LANGUAGE_CODES: readonly SupportedLanguageCode[] = [];

export type RtlLanguageCode = typeof RTL_LANGUAGE_CODES[number];

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
] as const;

export type I18nNamespace = typeof I18N_NAMESPACES[number];

export const isSupportedLanguage = (languageCode: string): languageCode is SupportedLanguageCode =>
  (SUPPORTED_LANGUAGE_CODES as readonly string[]).includes(languageCode);

export const isRtlLanguage = (languageCode: string): languageCode is RtlLanguageCode =>
  (RTL_LANGUAGE_CODES as readonly string[]).includes(languageCode);

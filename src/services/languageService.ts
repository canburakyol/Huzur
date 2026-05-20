import { Device } from '@capacitor/device';
import i18n from '../i18n';
import { logger } from '../utils/logger';
import {
  DEFAULT_LANGUAGE_CODE,
  RTL_LANGUAGE_CODES,
  SUPPORTED_LANGUAGE_CODES,
  SUPPORTED_LANGUAGE_OPTIONS,
  isSupportedLanguage
} from '../config/i18nConfig';
import { storageService } from './storageService';
import { STORAGE_KEYS } from '../constants';

type SupportedLanguageOption = {
  code: string;
  name: string;
  nativeName: string;
};

const REGION_LANGUAGE_MAP: Record<string, string> = {
  TR: 'tr',
  ID: 'id',
  US: 'en',
  DE: 'de',
  AT: 'de',
  CH: 'de'
};

const detectCountryCode = (): string => {
  try {
    const locale = navigator.language || 'tr-TR';
    const normalized = String(locale).replace('_', '-');
    const country = normalized.split('-')[1];
    return (country || 'TR').toUpperCase();
  } catch (error) {
    logger.error('[LanguageService] Country detection failed', error);
    return 'TR';
  }
};

const resolveRegionalDefaultLanguage = (): string => {
  const country = detectCountryCode();
  return REGION_LANGUAGE_MAP[country] || 'en';
};

export const detectAndSetLanguage = async (): Promise<string> => {
  try {
    const isNativePlatform = window.Capacitor?.isNativePlatform?.() ?? window.Capacitor?.isNative ?? false;
    
    let languageCode = resolveRegionalDefaultLanguage();
    
    if (isNativePlatform) {
      const languageInfo = await Device.getLanguageCode();
      const deviceLang = languageInfo.value?.toLowerCase() ?? '';
      const primaryLang = deviceLang.split('-')[0];
      
      logger.log('[LanguageService] Device language detected:', deviceLang, '-> Primary:', primaryLang);
      
      if (isSupportedLanguage(primaryLang)) {
        languageCode = primaryLang;
      } else {
        logger.log('[LanguageService] Device language not supported, using regional fallback:', languageCode);
      }
    } else {
      const browserLang = navigator.language?.toLowerCase() ?? '';
      const primaryLang = browserLang.split('-')[0];
      
      logger.log('[LanguageService] Browser language detected:', browserLang, '-> Primary:', primaryLang);
      
      if (isSupportedLanguage(primaryLang)) {
        languageCode = primaryLang;
      }
    }
    
    const savedLanguage = storageService.getString(STORAGE_KEYS.APP_LANGUAGE, '');
    if (savedLanguage && isSupportedLanguage(savedLanguage)) {
      logger.log('[LanguageService] Using saved language preference:', savedLanguage);
      languageCode = savedLanguage;
    }
    
    await i18n.changeLanguage(languageCode);
    logger.log('[LanguageService] Language set to:', languageCode);
    
    if (RTL_LANGUAGE_CODES.includes(languageCode)) {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', languageCode);
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', languageCode);
    }
    
    return languageCode;
  } catch (error) {
    logger.error('[LanguageService] Error detecting language:', error);
    await i18n.changeLanguage(DEFAULT_LANGUAGE_CODE);
    return DEFAULT_LANGUAGE_CODE;
  }
};

export const changeLanguage = async (languageCode: string): Promise<boolean> => {
  if (!isSupportedLanguage(languageCode)) {
    logger.warn('[LanguageService] Unsupported language:', languageCode);
    return false;
  }
  
  try {
    storageService.setString(STORAGE_KEYS.APP_LANGUAGE, languageCode);
    
    await i18n.changeLanguage(languageCode);
    
    if (RTL_LANGUAGE_CODES.includes(languageCode)) {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', languageCode);
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', languageCode);
    }
    
    logger.log('[LanguageService] Language changed to:', languageCode);
    return true;
  } catch (error) {
    logger.error('[LanguageService] Error changing language:', error);
    return false;
  }
};

export const getCurrentLanguage = (): string => {
  return i18n.language || DEFAULT_LANGUAGE_CODE;
};

export const getSupportedLanguages = (): SupportedLanguageOption[] => {
  return SUPPORTED_LANGUAGE_OPTIONS;
};

export const getSupportedLanguageCodes = (): readonly string[] => {
  return SUPPORTED_LANGUAGE_CODES;
};

export default {
  detectAndSetLanguage,
  changeLanguage,
  getCurrentLanguage,
  getSupportedLanguages,
  getSupportedLanguageCodes
};

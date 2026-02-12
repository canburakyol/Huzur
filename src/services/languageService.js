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

/**
 * Language Service
 * Handles device language detection and i18next language synchronization
 */

const REGION_LANGUAGE_MAP = {
  TR: 'tr',
  ID: 'id',
  US: 'en',
  DE: 'de',
  FR: 'fr',
  ES: 'es'
};

const detectCountryCode = () => {
  try {
    const locale = navigator.language || 'tr-TR';
    const normalized = String(locale).replace('_', '-');
    const country = normalized.split('-')[1];
    return (country || 'TR').toUpperCase();
  } catch {
    return 'TR';
  }
};

const resolveRegionalDefaultLanguage = () => {
  const country = detectCountryCode();
  return REGION_LANGUAGE_MAP[country] || 'en';
};

/**
 * Detects the device's system language and sets i18next accordingly
 * Falls back to Turkish if the device language is not supported
 * 
 * @returns {Promise<string>} The language code that was set
 */
export const detectAndSetLanguage = async () => {
  try {
    // Check if running on native platform
    const isNativePlatform = window.Capacitor?.isNativePlatform?.() ?? window.Capacitor?.isNative ?? false;
    
    let languageCode = resolveRegionalDefaultLanguage();
    
    if (isNativePlatform) {
      // Get device language info using Capacitor
      const languageInfo = await Device.getLanguageCode();
      // languageInfo.value returns something like 'en', 'tr', 'ar', 'en-US', 'tr-TR'
      const deviceLang = languageInfo.value?.toLowerCase() ?? '';
      
      // Extract the primary language code (e.g., 'en-US' -> 'en')
      const primaryLang = deviceLang.split('-')[0];
      
      logger.log('[LanguageService] Device language detected:', deviceLang, '-> Primary:', primaryLang);
      
      if (isSupportedLanguage(primaryLang)) {
        languageCode = primaryLang;
      } else {
        logger.log('[LanguageService] Device language not supported, using regional fallback:', languageCode);
      }
    } else {
      // Web/browser environment - use browser language
      const browserLang = navigator.language?.toLowerCase() ?? '';
      const primaryLang = browserLang.split('-')[0];
      
      logger.log('[LanguageService] Browser language detected:', browserLang, '-> Primary:', primaryLang);
      
      if (isSupportedLanguage(primaryLang)) {
        languageCode = primaryLang;
      }
    }
    
    // Check if user has manually set a language preference
    const savedLanguage = storageService.getString(STORAGE_KEYS.APP_LANGUAGE, '');
    if (savedLanguage && isSupportedLanguage(savedLanguage)) {
      logger.log('[LanguageService] Using saved language preference:', savedLanguage);
      languageCode = savedLanguage;
    }
    
    // Set the language in i18next
    await i18n.changeLanguage(languageCode);
    logger.log('[LanguageService] Language set to:', languageCode);
    
    // Set document direction for RTL languages (Arabic)
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
    // Fallback to default language
    await i18n.changeLanguage(DEFAULT_LANGUAGE_CODE);
    return DEFAULT_LANGUAGE_CODE;
  }
};

/**
 * Manually change the app language
 * Saves the preference to localStorage so it persists across sessions
 * 
 * @param {string} languageCode - The language code to set ('tr', 'en', 'ar')
 * @returns {Promise<boolean>} True if successful
 */
export const changeLanguage = async (languageCode) => {
  if (!isSupportedLanguage(languageCode)) {
    logger.warn('[LanguageService] Unsupported language:', languageCode);
    return false;
  }
  
  try {
    // Save preference to centralized storage
    storageService.setString(STORAGE_KEYS.APP_LANGUAGE, languageCode);
    
    // Change i18next language
    await i18n.changeLanguage(languageCode);
    
    // Set document direction for RTL languages
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

/**
 * Get the current language
 * @returns {string} Current language code
 */
export const getCurrentLanguage = () => {
  return i18n.language || DEFAULT_LANGUAGE_CODE;
};

/**
 * Get list of supported languages with their display names
 * @returns {Array<{code: string, name: string, nativeName: string}>}
 */
export const getSupportedLanguages = () => {
  return SUPPORTED_LANGUAGE_OPTIONS;
};

export const getSupportedLanguageCodes = () => {
  return SUPPORTED_LANGUAGE_CODES;
};

export default {
  detectAndSetLanguage,
  changeLanguage,
  getCurrentLanguage,
  getSupportedLanguages,
  getSupportedLanguageCodes
};

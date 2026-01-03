import { Device } from '@capacitor/device';
import i18n from '../i18n';

/**
 * Language Service
 * Handles device language detection and i18next language synchronization
 */

// Supported languages in the app
const SUPPORTED_LANGUAGES = ['tr', 'en', 'ar'];
const DEFAULT_LANGUAGE = 'tr';

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
    
    let languageCode = DEFAULT_LANGUAGE;
    
    if (isNativePlatform) {
      // Get device language info using Capacitor
      const languageInfo = await Device.getLanguageCode();
      // languageInfo.value returns something like 'en', 'tr', 'ar', 'en-US', 'tr-TR'
      const deviceLang = languageInfo.value?.toLowerCase() ?? '';
      
      // Extract the primary language code (e.g., 'en-US' -> 'en')
      const primaryLang = deviceLang.split('-')[0];
      
      console.log('[LanguageService] Device language detected:', deviceLang, '-> Primary:', primaryLang);
      
      if (SUPPORTED_LANGUAGES.includes(primaryLang)) {
        languageCode = primaryLang;
      } else {
        console.log('[LanguageService] Device language not supported, using default:', DEFAULT_LANGUAGE);
      }
    } else {
      // Web/browser environment - use browser language
      const browserLang = navigator.language?.toLowerCase() ?? '';
      const primaryLang = browserLang.split('-')[0];
      
      console.log('[LanguageService] Browser language detected:', browserLang, '-> Primary:', primaryLang);
      
      if (SUPPORTED_LANGUAGES.includes(primaryLang)) {
        languageCode = primaryLang;
      }
    }
    
    // Check if user has manually set a language preference (stored in localStorage)
    const savedLanguage = localStorage.getItem('app_language');
    if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
      console.log('[LanguageService] Using saved language preference:', savedLanguage);
      languageCode = savedLanguage;
    }
    
    // Set the language in i18next
    await i18n.changeLanguage(languageCode);
    console.log('[LanguageService] Language set to:', languageCode);
    
    // Set document direction for RTL languages (Arabic)
    if (languageCode === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', languageCode);
    }
    
    return languageCode;
  } catch (error) {
    console.error('[LanguageService] Error detecting language:', error);
    // Fallback to default language
    await i18n.changeLanguage(DEFAULT_LANGUAGE);
    return DEFAULT_LANGUAGE;
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
  if (!SUPPORTED_LANGUAGES.includes(languageCode)) {
    console.warn('[LanguageService] Unsupported language:', languageCode);
    return false;
  }
  
  try {
    // Save preference to localStorage
    localStorage.setItem('app_language', languageCode);
    
    // Change i18next language
    await i18n.changeLanguage(languageCode);
    
    // Set document direction for RTL languages
    if (languageCode === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', languageCode);
    }
    
    console.log('[LanguageService] Language changed to:', languageCode);
    return true;
  } catch (error) {
    console.error('[LanguageService] Error changing language:', error);
    return false;
  }
};

/**
 * Get the current language
 * @returns {string} Current language code
 */
export const getCurrentLanguage = () => {
  return i18n.language || DEFAULT_LANGUAGE;
};

/**
 * Get list of supported languages with their display names
 * @returns {Array<{code: string, name: string, nativeName: string}>}
 */
export const getSupportedLanguages = () => {
  return [
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' }
  ];
};

export default {
  detectAndSetLanguage,
  changeLanguage,
  getCurrentLanguage,
  getSupportedLanguages
};

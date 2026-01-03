import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * useDirection Hook
 * Automatically sets document direction (RTL/LTR) based on current language
 * 
 * RTL languages: Arabic (ar), Hebrew (he), Persian (fa), Urdu (ur)
 * All other languages use LTR
 */
const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

export const useDirection = () => {
  const { i18n } = useTranslation();
  
  useEffect(() => {
    const currentLang = i18n.language?.split('-')[0] || 'tr';
    const isRTL = RTL_LANGUAGES.includes(currentLang);
    
    // Set document direction
    document.body.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
    
    // Add data attribute for CSS targeting
    document.documentElement.setAttribute('data-direction', isRTL ? 'rtl' : 'ltr');
    
    console.log(`[useDirection] Language: ${currentLang}, Direction: ${isRTL ? 'RTL' : 'LTR'}`);
    
    return () => {
      // Cleanup on unmount (optional)
    };
  }, [i18n.language]);
  
  return {
    isRTL: RTL_LANGUAGES.includes(i18n.language?.split('-')[0] || 'tr'),
    direction: RTL_LANGUAGES.includes(i18n.language?.split('-')[0] || 'tr') ? 'rtl' : 'ltr',
    language: i18n.language
  };
};

export default useDirection;

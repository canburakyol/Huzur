import { useState, useEffect } from 'react';
import { checkAndUpdateStreak, getStreakDisplay } from '../services/streakService';
import { isPro as checkIsPro } from '../services/proService';
import { initializeRevenueCat } from '../services/revenueCatService';
import { detectAndSetLanguage } from '../services/languageService';
import { adMobService } from '../services/admobService';
import { VAKIT_THEMES } from '../data/vakitThemes';
import { THEMES } from '../components/ThemeSelector';
import { TIMING, STORAGE_KEYS } from '../constants';
import { storageService } from '../services/storageService';

/**
 * Apply theme colors to document
 */
const applyThemeColors = (theme) => {
  if (!theme) return;
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
  document.body.style.background = theme.bodyGradient;
  document.body.style.backgroundAttachment = 'fixed';
};

/**
 * Get current vakit theme based on prayer timings
 */
const getVakitTheme = (timings) => {
  if (!timings) return VAKIT_THEMES.DAY;
  
  const now = new Date();
  const timeStr = now.getHours() * 60 + now.getMinutes();
  
  const getMinutes = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const fajr = getMinutes(timings.Fajr);
  const dhuhr = getMinutes(timings.Dhuhr);
  const maghrib = getMinutes(timings.Maghrib);

  if (timeStr >= fajr && timeStr < dhuhr) return VAKIT_THEMES.FAJR;
  if (timeStr >= dhuhr && timeStr < maghrib) return VAKIT_THEMES.DAY;
  if (timeStr >= maghrib || timeStr < fajr) return VAKIT_THEMES.NIGHT;
  return VAKIT_THEMES.NIGHT;
};

/**
 * App Initialization Hook
 * Handles streak, RevenueCat, theme and AdMob initialization
 * 
 * @param {Object} timings - Prayer timings for dynamic theme
 * @returns {Object} App state (streak, pro status, badge)
 */
export const useAppInit = (timings) => {
  // Calculate streak on initial render (prevents cascading render)
  // Note: Streak is only calculated once on mount, no setter needed
  const [streakData] = useState(() => {
    const result = checkAndUpdateStreak();
    return result.streakData ? getStreakDisplay() : { current: 0, isMilestone: false, emoji: '✨' };
  });
  
  const [newBadge, setNewBadge] = useState(() => {
    const result = checkAndUpdateStreak();
    return result.newBadge || null;
  });
  
  const [isProUser, setIsProUser] = useState(() => checkIsPro());


  // Initialize on mount: RevenueCat, Language Detection, Event listeners
  useEffect(() => {
    // Initialize RevenueCat
    initializeRevenueCat();

    // Detect and set device language
    detectAndSetLanguage().then((lang) => {
      console.log('[useAppInit] Device language detected and set:', lang);
    });

    // Pro Status Change Listener
    const handleProStatusChange = (event) => {
      console.log('[useAppInit] Pro status changed:', event.detail);
      if (event.detail && typeof event.detail.active !== 'undefined') {
        setIsProUser(event.detail.active);
      } else {
        setIsProUser(checkIsPro());
      }
    };
    window.addEventListener('proStatusChanged', handleProStatusChange);

    // Theme Change Listener
    const handleThemeChange = (e) => {
      const { themeId } = e.detail;
      if (themeId === 'auto-vakit') {
        if (timings) applyThemeColors(getVakitTheme(timings));
      } else {
        const theme = THEMES.find(t => t.id === themeId);
        if (theme) applyThemeColors(theme);
      }
    };
    window.addEventListener('appThemeChanged', handleThemeChange);

    return () => {
      window.removeEventListener('appThemeChanged', handleThemeChange);
      window.removeEventListener('proStatusChanged', handleProStatusChange);
    };
  }, [timings]);

  // Dynamic Vakit Theme Update
  useEffect(() => {
    const savedTheme = storageService.getString(STORAGE_KEYS.APP_THEME);
    if (savedTheme === 'auto-vakit' && timings) {
      applyThemeColors(getVakitTheme(timings));
    }
  }, [timings]);

  // Initialize AdMob (skip for Pro users)
  useEffect(() => {
    if (isProUser) {
      console.log('[useAppInit] Pro user detected - stopping all ads');
      adMobService.stopAds();
      return;
    }

    const initAdMob = async () => {
      await adMobService.initialize();
      await adMobService.showRectangleBanner();
    };

    const timeoutId = setTimeout(() => {
      console.log('[useAppInit] Initializing AdMob (delayed)...');
      initAdMob();
    }, TIMING.ADMOB_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, [isProUser]);

  // Clear new badge
  const clearBadge = () => setNewBadge(null);

  return {
    streakData,
    newBadge,
    clearBadge,
    isProUser
  };
};

export default useAppInit;

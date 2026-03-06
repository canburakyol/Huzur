import { useState, useEffect } from 'react';
import { checkAndUpdateStreak, getStreakDisplay } from '../services/streakService';
import { isPro as checkIsPro, verifyProStatus } from '../services/proService';
import { initializeRevenueCat } from '../services/revenueCatService';
import { detectAndSetLanguage } from '../services/languageService';
import { adMobService } from '../services/admobService';
import { syncProStatusFromServer } from '../services/subscriptionSyncService';
import { VAKIT_THEMES } from '../data/vakitThemes';
import { THEMES } from '../data/themes';
import { TIMING, STORAGE_KEYS } from '../constants';
import { storageService } from '../services/storageService';
import { logger } from '../utils/logger';
import { recordAppOpen } from '../services/userActivityTracker';

/**
 * Apply theme colors to document
 */
const applyThemeColors = (theme) => {
  if (!theme) return;
  const root = document.documentElement;
  if (theme.colors) {
    Object.entries(theme.colors).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }
  if (theme.bodyGradient) {
    document.body.style.background = theme.bodyGradient;
    document.body.style.backgroundAttachment = 'fixed';
  }
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
  const asr = getMinutes(timings.Asr);
  const maghrib = getMinutes(timings.Maghrib);
  const isha = getMinutes(timings.Isha);

  if (timeStr >= fajr && timeStr < dhuhr) return VAKIT_THEMES.FAJR;
  if (timeStr >= dhuhr && timeStr < asr) return VAKIT_THEMES.DAY;
  if (timeStr >= asr && timeStr < maghrib) return VAKIT_THEMES.DAY; // İkindi de gündüz teması
  if (timeStr >= maghrib && timeStr < isha) return VAKIT_THEMES.MAGHRIB;
  if (timeStr >= isha || timeStr < fajr) return VAKIT_THEMES.ISHA;
  
  return VAKIT_THEMES.NIGHT; // Fallback
};

/**
 * App Initialization Hook
 * Handles streak, RevenueCat, theme and AdMob initialization
 */
export const useAppInit = (timings) => {
  const [{ streakData, newBadge: initialBadge }] = useState(() => {
    const result = checkAndUpdateStreak();
    return {
      streakData: result.streakData ? getStreakDisplay() : { current: 0, isMilestone: false, emoji: '✨' },
      newBadge: result.newBadge || null
    };
  });
  
  const [newBadge, setNewBadge] = useState(initialBadge);
  const [isProUser, setIsProUser] = useState(() => checkIsPro());

  // Pro Status Change Handler
  const handleProStatusChange = (event) => {
    logger.log('[useAppInit] Pro status changed:', event.detail);
    if (event.detail && typeof event.detail.active !== 'undefined') {
      setIsProUser(event.detail.active);
    } else {
      setIsProUser(checkIsPro());
    }
  };

  // Initialization Effect
  useEffect(() => {
    // Aktivite saatini kaydet (akıllı bildirim zamanlaması için)
    recordAppOpen();

    const initializeServices = async () => {
      try {
        // RevenueCat ve Language işlemlerini paralel başlat (biri diğerine bağlı değil)
        const initResults = await Promise.allSettled([
          initializeRevenueCat(),
          detectAndSetLanguage()
        ]);

        // Hata kontrolü (sadece loglama, uygulamayı çökertmemek için)
        initResults.forEach((result, index) => {
          if (result.status === 'rejected') {
            const serviceName = index === 0 ? 'RevenueCat' : 'Language Detection';
            logger.warn(`[useAppInit] ${serviceName} başlatılamadı:`, result.reason);
          } else if (index === 1 && result.value) {
            logger.log('[useAppInit] Device language detected and set:', result.value);
          }
        });

        // Pro Status doğrulamasını ve senkronizasyonunu RevenueCat inisiyalizasyonundan sonra yap
        if (initResults[0].status === 'fulfilled') {
          const proResults = await Promise.allSettled([
            verifyProStatus(),
            syncProStatusFromServer()
          ]);

          let activeProStatus = false;
          let hasProResult = false;

          if (proResults[0].status === 'fulfilled') {
            activeProStatus = proResults[0].value;
            hasProResult = true;
          } else {
            logger.warn('[useAppInit] verifyProStatus failed:', proResults[0].reason);
          }

          if (proResults[1].status === 'fulfilled' && proResults[1].value && typeof proResults[1].value.isPro === 'boolean') {
            activeProStatus = proResults[1].value.isPro;
            hasProResult = true;
          } else if (proResults[1].status === 'rejected') {
             logger.warn('[useAppInit] syncProStatusFromServer failed:', proResults[1].reason);
          }

          if (hasProResult) {
            setIsProUser(activeProStatus);
          }
        }
      } catch (error) {
        logger.error('[useAppInit] Critical initialization error:', error);
      }
    };

    initializeServices();

    // Initial Theme & Accent Load
    const savedTheme = storageService.getString(STORAGE_KEYS.THEME);
    const savedAccent = storageService.getString('app_accent_color') || 'orange';
    const accentMap = {
      orange: '#f97316',
      emerald: '#10b981',
      blue: '#3b82f6',
      purple: '#8b5cf6',
      gold: '#eab308'
    };

    if (accentMap[savedAccent]) {
      document.documentElement.style.setProperty('--nav-accent', accentMap[savedAccent]);
    }

    if (savedTheme) {
      let targetTheme = savedTheme;
      if (savedTheme === 'system') {
        targetTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', targetTheme);
    }

    window.addEventListener('proStatusChanged', handleProStatusChange);
    return () => window.removeEventListener('proStatusChanged', handleProStatusChange);
  }, []);

  // Theme & Event Listeners Effect
  useEffect(() => {
    const handleThemeChange = (e) => {
      const { themeId } = e.detail;
      if (themeId === 'auto-vakit') {
        if (timings) applyThemeColors(getVakitTheme(timings));
      } else {
        const theme = THEMES.find(t => t.id === themeId);
        if (theme) applyThemeColors(theme);
      }
    };

    const handleThemeModeChange = (e) => {
      const { mode } = e.detail;
      let targetTheme = mode;
      if (mode === 'system') {
        targetTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', targetTheme);
    };

    const handleAccentChange = (e) => {
      const { color } = e.detail;
      document.documentElement.style.setProperty('--nav-accent', color);
    };

    window.addEventListener('appThemeChanged', handleThemeChange);
    window.addEventListener('themeModeChanged', handleThemeModeChange);
    window.addEventListener('accentColorChanged', handleAccentChange);

    return () => {
      window.removeEventListener('appThemeChanged', handleThemeChange);
      window.removeEventListener('themeModeChanged', handleThemeModeChange);
      window.removeEventListener('accentColorChanged', handleAccentChange);
    };
  }, [timings]);

  // Dynamic Vakit Theme Update
  useEffect(() => {
    const savedTheme = storageService.getString(STORAGE_KEYS.APP_THEME);
    if (savedTheme === 'auto-vakit' && timings) {
      applyThemeColors(getVakitTheme(timings));
    }
  }, [timings]);

  // Initialize AdMob
  useEffect(() => {
    if (isProUser) {
      adMobService.stopAds();
      return;
    }

    const initAdMob = async () => {
      await adMobService.initialize();
      await adMobService.showRectangleBanner();
    };

    const timeoutId = setTimeout(() => {
      initAdMob();
    }, TIMING.ADMOB_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, [isProUser]);

  const clearBadge = () => setNewBadge(null);

  return { streakData, newBadge, clearBadge, isProUser };
};

export default useAppInit;

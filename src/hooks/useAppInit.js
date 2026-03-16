import { useState, useEffect } from 'react';
import { checkAndUpdateStreak, getStreakDisplay } from '../services/streakService';
import { getProStateSnapshot, isPro as checkIsPro, verifyProStatus } from '../services/proService';
import { detectAndSetLanguage } from '../services/languageService';
import { VAKIT_THEMES } from '../data/vakitThemes';
import { THEMES, ACCENT_COLORS } from '../data/themes';
import { TIMING, STORAGE_KEYS } from '../constants';
import { storageService } from '../services/storageService';
import { logger } from '../utils/logger';
import { recordAppOpen } from '../services/userActivityTracker';
import { scheduleDeferredTask } from '../utils/startupScheduler';
import crashlyticsReporter from '../utils/crashlyticsReporter';

const LEGACY_ACCENT_MAP = {
  orange: 'amber',
  gold: 'antique-gold',
  blue: 'deep-emerald',
  purple: 'olive-gold',
};

const resolveAccent = (accentId) => {
  const normalized = LEGACY_ACCENT_MAP[accentId] || accentId;
  return ACCENT_COLORS.find((accent) => accent.id === normalized) || ACCENT_COLORS[0];
};

const applyAccent = (accent) => {
  if (!accent) return;
  const root = document.documentElement;
  root.style.setProperty('--nav-accent', accent.color);
  root.style.setProperty('--primary-color', accent.color);
  root.style.setProperty('--accent-color', accent.color);
  root.style.setProperty('--accent-vibrant', accent.color);
  root.style.setProperty('--accent-gold-light', accent.color);

  if (accent.dark) {
    root.style.setProperty('--primary-dark', accent.dark);
    root.style.setProperty('--accent-gold', accent.dark);
  }
  if (accent.rgb) {
    root.style.setProperty('--nav-accent-rgb', accent.rgb);
  }
};

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
  if (timeStr >= asr && timeStr < maghrib) return VAKIT_THEMES.DAY;
  if (timeStr >= maghrib && timeStr < isha) return VAKIT_THEMES.MAGHRIB;
  if (timeStr >= isha || timeStr < fajr) return VAKIT_THEMES.ISHA;

  return VAKIT_THEMES.NIGHT;
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

  const handleProStatusChange = (event) => {
    logger.log('[useAppInit] Pro status changed:', event.detail);
    if (event.detail && typeof event.detail.active !== 'undefined') {
      setIsProUser(event.detail.active);
    } else {
      setIsProUser(checkIsPro());
    }
  };

  useEffect(() => {
    let isCancelled = false;

    recordAppOpen();

    const cancelServiceInitialization = scheduleDeferredTask(async () => {
      try {
        const [{ initializeRevenueCat }, { syncProStatusFromServer }] = await Promise.all([
          import('../services/revenueCatService'),
          import('../services/subscriptionSyncService')
        ]);

        if (isCancelled) {
          return;
        }

        const initResults = await Promise.allSettled([
          initializeRevenueCat(),
          detectAndSetLanguage()
        ]);

        if (isCancelled) {
          return;
        }

        initResults.forEach((result, index) => {
          if (result.status === 'rejected') {
            const serviceName = index === 0 ? 'RevenueCat' : 'Language Detection';
            logger.warn(`[useAppInit] ${serviceName} başlatılamadı:`, result.reason);
          } else if (index === 1 && result.value) {
            logger.log('[useAppInit] Device language detected and set:', result.value);
          }
        });

        const proResults = await Promise.allSettled([
          verifyProStatus(),
          syncProStatusFromServer()
        ]);

        if (isCancelled) {
          return;
        }

        if (proResults[0].status === 'rejected') {
          logger.warn('[useAppInit] verifyProStatus failed:', proResults[0].reason);
        }

        if (proResults[1].status === 'rejected') {
          logger.warn('[useAppInit] syncProStatusFromServer failed:', proResults[1].reason);
        }

        const activeProStatus = checkIsPro();
        const proState = getProStateSnapshot();
        crashlyticsReporter.logCrash(
          `[useAppInit] pro resolved active=${activeProStatus} source=${proState.source} state=${proState.verificationState}`
        ).catch(() => {});
        setIsProUser(activeProStatus);
      } catch (error) {
        if (!isCancelled) {
          logger.error('[useAppInit] Critical initialization error:', error);
        }
      }
    });

    const savedTheme = storageService.getString(STORAGE_KEYS.THEME);
    const savedAccent = storageService.getString('app_accent_color') || 'amber';
    applyAccent(resolveAccent(savedAccent));

    if (savedTheme) {
      let targetTheme = savedTheme;
      if (savedTheme === 'system') {
        targetTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', targetTheme);
    }

    window.addEventListener('proStatusChanged', handleProStatusChange);
    return () => {
      isCancelled = true;
      cancelServiceInitialization();
      window.removeEventListener('proStatusChanged', handleProStatusChange);
    };
  }, []);

  useEffect(() => {
    const handleThemeChange = (e) => {
      const { themeId } = e.detail;
      if (themeId === 'auto-vakit') {
        if (timings) applyThemeColors(getVakitTheme(timings));
      } else {
        const theme = THEMES.find((t) => t.id === themeId);
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
      const { accentId, color, dark, rgb } = e.detail;
      if (accentId) {
        applyAccent(resolveAccent(accentId));
        return;
      }

      applyAccent({ color, dark, rgb });
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

  useEffect(() => {
    const savedTheme = storageService.getString(STORAGE_KEYS.APP_THEME);
    if (savedTheme === 'auto-vakit' && timings) {
      applyThemeColors(getVakitTheme(timings));
    }
  }, [timings]);

  useEffect(() => {
    let isCancelled = false;

    if (isProUser) {
      void import('../services/admobService')
        .then(({ adMobService }) => {
          if (!isCancelled) {
            return adMobService.stopAds();
          }
          return null;
        })
        .catch((error) => {
          if (!isCancelled) {
            logger.warn('[useAppInit] AdMob stop failed:', error);
          }
        });

      return () => {
        isCancelled = true;
      };
    }

    const cancelAdMobInitialization = scheduleDeferredTask(async () => {
      try {
        const { adMobService } = await import('../services/admobService');
        if (isCancelled) {
          return;
        }

        await adMobService.initialize();
        if (isCancelled) {
          return;
        }

        await adMobService.showRectangleBanner();
      } catch (error) {
        if (!isCancelled) {
          logger.warn('[useAppInit] AdMob deferred init failed:', error);
        }
      }
    }, TIMING.ADMOB_DELAY_MS);

    return () => {
      isCancelled = true;
      cancelAdMobInitialization();
    };
  }, [isProUser]);

  const clearBadge = () => setNewBadge(null);

  return { streakData, newBadge, clearBadge, isProUser };
};

export default useAppInit;

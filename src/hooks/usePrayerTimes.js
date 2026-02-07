import { useState, useEffect, useCallback } from 'react';
import { getPrayerTimes, getNextPrayer } from '../services/prayerService';
import { schedulePrayerAlarms, createNotificationChannels, FCMService } from '../services/fcmService';
import smartNotificationService, { showStickyNotification, cancelStickyNotification, requestNotificationPermission } from '../services/smartNotificationService';
import { updateWidget as updateAndroidWidget } from '../services/widgetService';
import { storageService } from '../services/storageService';
import { TIMING, STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';

/**
 * Prayer Times Management Hook
 * Handles fetching, caching, scheduling and updating prayer times
 * Also manages notifications and widget updates
 * 
 * @returns {Object} Prayer times state and functions
 */
export const usePrayerTimes = () => {
  const [timings, setTimings] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  // Fetch prayer times
  const fetchPrayerTimes = useCallback(async (coords = null, isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      }
      setError(null);

      const lat = coords?.latitude || null;
      const lon = coords?.longitude || null;

      const data = await getPrayerTimes(lat, lon);
      if (data && data.timings) {
        setTimings(data.timings);
        setNextPrayer(getNextPrayer(data.timings));

        // Schedule prayer notifications with exact alarms
        const notificationSettings = {
          preAlertMinutes: storageService.getNumber(STORAGE_KEYS.PRE_ALERT_MINUTES, 15),
          enablePreAlert: storageService.getBoolean(STORAGE_KEYS.ENABLE_PRE_ALERT, true),
          enableMainAlert: storageService.getBoolean(STORAGE_KEYS.ENABLE_MAIN_ALERT, true)
        };

        try {
          await schedulePrayerAlarms(data.timings, notificationSettings);
          logger.log('[usePrayerTimes] Prayer alarms scheduled');
        } catch (scheduleError) {
          logger.warn('[usePrayerTimes] Failed to schedule prayer alarms:', scheduleError);
        }
      } else {
        setError('Namaz vakitleri yüklenemedi. Lütfen internet bağlantınızı kontrol edin.');
      }
    } catch (err) {
      logger.error('Prayer times fetch error:', err);
      setError('Namaz vakitleri yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Safety timeout for loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        logger.warn('[usePrayerTimes] Loading timed out, forcing completion');
        setLoading(false);
        if (!timings) {
            setError('Bağlantı zaman aşımına uğradı.');
        }
      }
    }, 10000); // 10 seconds timeout

    return () => clearTimeout(timer);
  }, [loading, timings]);

  // Initialize FCM and notification channels
  useEffect(() => {
    const initFCM = async () => {
      try {
        await createNotificationChannels();
        await FCMService.initialize();
        logger.log('[usePrayerTimes] FCM and notification channels initialized');
      } catch (fcmError) {
        logger.warn('[usePrayerTimes] FCM initialization failed:', fcmError);
      }
    };

    // Check notification permission
    if (typeof Notification !== 'undefined') {
      if (Notification.permission === 'granted') {
        setPermissionGranted(true);
      } else if (Notification.permission === 'default') {
        const hasSeenWelcome = storageService.getBoolean(STORAGE_KEYS.HAS_SEEN_WELCOME);
        if (!hasSeenWelcome) {
          setShowWelcome(true);
        }
      }
    }

    // Delay FCM initialization for better cold start
    const timeoutId = setTimeout(initFCM, TIMING.FCM_DELAY_MS);

    return () => {
      clearTimeout(timeoutId);
      FCMService.removeListeners().catch(() => {});
    };
  }, []);

  // Update next prayer periodically (unified timer)
  useEffect(() => {
    if (!timings) return;

    const updateNextPrayer = () => {
      const next = getNextPrayer(timings);
      setNextPrayer(prev => {
        if (!prev || prev.key !== next.key || prev.time !== next.time || prev.isTomorrow !== next.isTomorrow) {
          return next;
        }
        return prev;
      });
    };

    updateNextPrayer();
    const timer = setInterval(updateNextPrayer, TIMING.REFRESH_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [timings]);

  // Prayer time notification check
  useEffect(() => {
    if (!timings || !permissionGranted) return;

    const checkPrayerTime = () => {
      const now = new Date();
      const timeStr = now.toTimeString().slice(0, 5);

      Object.entries(timings).forEach(([name, time]) => {
        if (typeof time !== 'string') return;
        const [h, m] = time.split(':').map(Number);
        let targetM = m - 10;
        let targetH = h;
        if (targetM < 0) {
          targetM += 60;
          targetH -= 1;
        }
        const checkTime = `${String(targetH).padStart(2, '0')}:${String(targetM).padStart(2, '0')}`;

        if (timeStr === checkTime) {
          smartNotificationService.showInstantNotification("Vakit Yaklaşıyor", `${name} vaktine 10 dakika kaldı.`);
        }
      });
    };

    const interval = setInterval(checkPrayerTime, TIMING.REFRESH_INTERVAL_MS);
    checkPrayerTime();
    return () => clearInterval(interval);
  }, [timings, permissionGranted]);

  // Handle notification permission
  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setPermissionGranted(granted);
    setShowWelcome(false);
    storageService.setBoolean(STORAGE_KEYS.HAS_SEEN_WELCOME, true);
  };

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    storageService.setBoolean(STORAGE_KEYS.HAS_SEEN_WELCOME, true);
  };

  return {
    timings,
    nextPrayer,
    loading,
    error,
    permissionGranted,
    showWelcome,
    fetchPrayerTimes,
    handleEnableNotifications,
    handleCloseWelcome
  };
};

/**
 * Sticky Notification Hook
 * Manages persistent notification showing time until next prayer
 */
export const useStickyNotification = (timings, nextPrayer) => {
  useEffect(() => {
    if (!timings || !nextPrayer) return;

    let stickyInterval;

    const updateStickyNotification = () => {
      const isStickyEnabled = storageService.getBoolean(STORAGE_KEYS.STICKY_NOTIFICATION);

      if (!isStickyEnabled) {
        cancelStickyNotification();
        if (stickyInterval) clearInterval(stickyInterval);
        return;
      }

      const update = () => {
        const now = new Date();
        const prayerTime = timings[nextPrayer.key];
        if (!prayerTime) return;
        
        const [h, m] = prayerTime.split(':').map(Number);
        const prayerDate = new Date();
        prayerDate.setHours(h, m, 0);

        if (prayerDate < now) {
          prayerDate.setDate(prayerDate.getDate() + 1);
        }

        const diff = prayerDate - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        const timeLeft = `${hours}sa ${minutes}dk`;
        const title = `${nextPrayer.name} Vaktine Kalan`;
        const body = `${timeLeft} kaldı.`;

        showStickyNotification(title, body);
      };

      update();
      if (stickyInterval) clearInterval(stickyInterval);
      stickyInterval = setInterval(update, TIMING.REFRESH_INTERVAL_MS);
    };

    window.addEventListener('stickyNotificationChanged', updateStickyNotification);
    updateStickyNotification();

    return () => {
      window.removeEventListener('stickyNotificationChanged', updateStickyNotification);
      if (stickyInterval) clearInterval(stickyInterval);
    };
  }, [timings, nextPrayer]);
};

/**
 * Android Widget Hook
 * Updates Android home screen widget with prayer time info
 */
export const useAndroidWidget = (timings, nextPrayer, locationName) => {
  useEffect(() => {
    if (!timings || !nextPrayer) return;

    // Widget update (native-safe wrapper)
    const updateWidget = async () => {
      try {
        const prayerTime = timings[nextPrayer.key];
        if (!prayerTime) return;

        await updateAndroidWidget({
          name: nextPrayer.name,
          time: prayerTime,
          location: locationName || 'Huzur'
        });
      } catch (e) {
        logger.warn('[usePrayerTimes] Widget update failed:', e);
      }
    };

    updateWidget();
  }, [timings, nextPrayer, locationName]);
};

export default usePrayerTimes;

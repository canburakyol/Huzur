import { useState, useEffect, useCallback, useRef } from 'react';
import { getPrayerTimes, getNextPrayer } from '../services/prayerService';
import { updateWidget as updateAndroidWidget } from '../services/widgetService';
import { storageService } from '../services/storageService';
import { TIMING, STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';
import { scheduleDeferredTask } from '../utils/startupScheduler';
import { syncPrayerSchedule } from '../services/prayerScheduleService';

let smartNotificationModulePromise = null;
let fcmModulePromise = null;

const loadSmartNotificationModule = async () => {
  if (!smartNotificationModulePromise) {
    smartNotificationModulePromise = import('../services/smartNotificationService');
  }

  return smartNotificationModulePromise;
};

const loadFcmModule = async () => {
  if (!fcmModulePromise) {
    fcmModulePromise = import('../services/fcmService');
  }

  return fcmModulePromise;
};

export const usePrayerTimes = () => {
  const [timings, setTimings] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const lastScheduledTimingsRef = useRef('');
  const fcmModuleRef = useRef(null);

  const schedulePrayerSideEffects = useCallback(async (prayerTimings, coords = null) => {
    try {
      const smartNotificationModule = await loadSmartNotificationModule();
      const smartNotificationService = smartNotificationModule.default;

      await Promise.allSettled([
        smartNotificationService.initializeSmartNotifications({ prayerTimes: prayerTimings }),
        syncPrayerSchedule({
          timings: prayerTimings,
          latitude: coords?.latitude ?? null,
          longitude: coords?.longitude ?? null,
          locationName: coords?.locationName || coords?.city || coords?.name || 'Huzur'
        })
      ]);

      logger.log('[usePrayerTimes] Smart notifications and native prayer schedule synced');
    } catch (scheduleError) {
      logger.warn('[usePrayerTimes] Failed to schedule notifications:', scheduleError);
    }
  }, []);

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

        const timingsSignature = JSON.stringify({
          timings: data.timings,
          latitude: lat ? Number(lat.toFixed(4)) : null,
          longitude: lon ? Number(lon.toFixed(4)) : null
        });

        if (lastScheduledTimingsRef.current !== timingsSignature) {
          lastScheduledTimingsRef.current = timingsSignature;
          void schedulePrayerSideEffects(data.timings, coords);
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
  }, [schedulePrayerSideEffects]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        logger.warn('[usePrayerTimes] Loading timed out, forcing completion');
        setLoading(false);
        if (!timings) {
          setError('Bağlantı zaman aşımına uğradı.');
        }
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [loading, timings]);

  useEffect(() => {
    let isCancelled = false;

    const initFCM = async () => {
      try {
        const fcmModule = await loadFcmModule();
        if (isCancelled) {
          return;
        }

        fcmModuleRef.current = fcmModule;
        await fcmModule.createNotificationChannels();
        if (isCancelled) {
          return;
        }

        const firebaseStatus = await fcmModule.FCMService.getFirebaseStatus();
        if (!firebaseStatus.initialized) {
          if (!isCancelled) {
            logger.warn('[usePrayerTimes] Native Firebase unavailable, skipping startup FCM registration');
          }
          return;
        }

        await fcmModule.FCMService.initialize({ requestPermission: false });
        if (!isCancelled) {
          logger.log('[usePrayerTimes] FCM and notification channels initialized');
        }
      } catch (fcmError) {
        if (!isCancelled) {
          logger.warn('[usePrayerTimes] FCM initialization failed:', fcmError);
        }
      }
    };

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

    const cancelDeferredInit = scheduleDeferredTask(initFCM, TIMING.FCM_DELAY_MS);

    return () => {
      isCancelled = true;
      cancelDeferredInit();
      fcmModuleRef.current?.FCMService.removeListeners().catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (!timings) return;

    const updateNextPrayer = () => {
      const next = getNextPrayer(timings);
      setNextPrayer((prev) => {
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

  const handleEnableNotifications = async () => {
    const { requestNotificationPermission } = await loadSmartNotificationModule();
    const granted = await requestNotificationPermission();
    setPermissionGranted(granted);
    setShowWelcome(false);
    storageService.setBoolean(STORAGE_KEYS.HAS_SEEN_WELCOME, true);

    if (!granted) {
      return;
    }

    try {
      const fcmModule = fcmModuleRef.current || await loadFcmModule();
      fcmModuleRef.current = fcmModule;
      await fcmModule.createNotificationChannels();
      await fcmModule.FCMService.initialize({ requestPermission: false });
    } catch (fcmError) {
      logger.warn('[usePrayerTimes] Notification permission granted but FCM init failed:', fcmError);
    }
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

export const useStickyNotification = (timings, nextPrayer) => {
  useEffect(() => {
    if (!timings || !nextPrayer) return;

    let stickyInterval;
    let isDisposed = false;

    const updateStickyNotification = async () => {
      const { showStickyNotification, cancelStickyNotification } = await loadSmartNotificationModule();
      if (isDisposed) {
        return;
      }

      const isStickyEnabled = storageService.getBoolean(STORAGE_KEYS.STICKY_NOTIFICATION);
      if (!isStickyEnabled) {
        await cancelStickyNotification();
        if (stickyInterval) clearInterval(stickyInterval);
        return;
      }

      const pushStickyUpdate = async () => {
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

        await showStickyNotification(title, body);
      };

      await pushStickyUpdate();
      if (stickyInterval) clearInterval(stickyInterval);
      stickyInterval = setInterval(() => {
        void pushStickyUpdate();
      }, TIMING.REFRESH_INTERVAL_MS);
    };

    const handleStickyChange = () => {
      void updateStickyNotification();
    };

    window.addEventListener('stickyNotificationChanged', handleStickyChange);
    void updateStickyNotification();

    return () => {
      isDisposed = true;
      window.removeEventListener('stickyNotificationChanged', handleStickyChange);
      if (stickyInterval) clearInterval(stickyInterval);
    };
  }, [timings, nextPrayer]);
};

export const useAndroidWidget = (timings, nextPrayer, locationName) => {
  useEffect(() => {
    if (!timings || !nextPrayer) return;

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

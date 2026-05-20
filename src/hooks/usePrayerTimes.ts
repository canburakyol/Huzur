import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { getPrayerTimes, getNextPrayer } from "../services/prayerService";
import { updateWidget as updateAndroidWidget } from "../services/widgetService";
import { storageService } from "../services/storageService";
import smartNotificationService, {
  cancelStickyNotification,
  requestNotificationPermission,
  showStickyNotification,
} from "../services/smartNotificationService";
import { syncPrayerSchedule } from "../services/prayerScheduleService";
import { TIMING, STORAGE_KEYS } from "../constants";
import { logger } from "../utils/logger";
import { scheduleDeferredTask } from "../utils/startupScheduler";
import { useVisibilityAwareInterval } from "./useVisibilityAwareInterval";
import { useAppStore } from "../stores/useAppStore";

interface PrayerTimings {
  [key: string]: string;
}

interface NextPrayer {
  key: string;
  name: string;
  time: string;
  isTomorrow: boolean;
}

interface FcmService {
  initialize: (options: { requestPermission: boolean }) => Promise<void>;
  getFirebaseStatus: () => Promise<{ initialized: boolean }>;
  removeListeners?: () => void;
}

interface UsePrayerTimesResult {
  timings: PrayerTimings | null;
  nextPrayer: NextPrayer | null;
  loading: boolean;
  error: string | null;
  permissionGranted: boolean;
  showWelcome: boolean;
  fetchPrayerTimes: (coords?: { latitude: number | null; longitude: number | null }, isInitialLoad?: boolean) => Promise<void>;
  handleEnableNotifications: () => Promise<void>;
  handleCloseWelcome: () => void;
}

interface LocationCoords {
  latitude: number | null;
  longitude: number | null;
  locationName?: string;
  city?: string;
  name?: string;
}

const getInitialPrayerSnapshot = (): { timings: PrayerTimings | null; nextPrayer: NextPrayer | null; loading: boolean } => {
  try {
    const initialData = getPrayerTimes();
    const initialTimings = initialData?.timings || null;

    return {
      timings: initialTimings,
      nextPrayer: initialTimings ? getNextPrayer(initialTimings) : null,
      loading: !initialTimings,
    };
  } catch (error) {
    logger.error("[usePrayerTimes] Failed to create initial prayer snapshot", error);
    return {
      timings: null,
      nextPrayer: null,
      loading: true,
    };
  }
};

const loadFcmRuntime = async (): Promise<{ fcmService: FcmService; createNotificationChannels: () => Promise<void> }> => {
  const fcmModule = await import("../services/fcmService");
  return {
    fcmService: fcmModule.default as FcmService,
    createNotificationChannels: fcmModule.createNotificationChannels,
  };
};

export const usePrayerTimes = (): UsePrayerTimesResult => {
  const { t } = useTranslation();
  const initialPrayerSnapshotRef = useRef<ReturnType<typeof getInitialPrayerSnapshot> | null>(null);
  if (!initialPrayerSnapshotRef.current) {
    initialPrayerSnapshotRef.current = getInitialPrayerSnapshot();
  }

  const [timings, setTimings] = useState<PrayerTimings | null>(initialPrayerSnapshotRef.current.timings);
  const [nextPrayer, setNextPrayer] = useState<NextPrayer | null>(initialPrayerSnapshotRef.current.nextPrayer);
  const [loading, setLoading] = useState(initialPrayerSnapshotRef.current.loading);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const lastScheduledTimingsRef = useRef("");
  const fcmModuleRef = useRef<FcmService | null>(null);

  const schedulePrayerSideEffects = useCallback(async (prayerTimings: PrayerTimings, coords: LocationCoords | null = null): Promise<void> => {
    try {
      await Promise.allSettled([
        smartNotificationService.initializeSmartNotifications({ prayerTimes: prayerTimings }),
        syncPrayerSchedule({
          timings: prayerTimings,
          latitude: coords?.latitude ?? null,
          longitude: coords?.longitude ?? null,
          locationName: coords?.locationName || coords?.city || coords?.name || "Huzur",
        }),
      ]);

      logger.log("[usePrayerTimes] Smart notifications and native prayer schedule synced");
    } catch (scheduleError) {
      logger.warn("[usePrayerTimes] Failed to schedule notifications:", scheduleError);
    }
  }, []);

  const fetchPrayerTimes = useCallback(
    async (coords: LocationCoords | null = null, isInitialLoad = false): Promise<void> => {
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
            longitude: lon ? Number(lon.toFixed(4)) : null,
          });

          if (lastScheduledTimingsRef.current !== timingsSignature) {
            lastScheduledTimingsRef.current = timingsSignature;
            void schedulePrayerSideEffects(data.timings, coords);
          }
        } else {
          setError(t("prayers.errors.loadFailed"));
        }
      } catch (err) {
        logger.error("Prayer times fetch error:", err);
        setError(t("prayers.errors.fetchError"));
      } finally {
        setLoading(false);
      }
    },
    [schedulePrayerSideEffects]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        logger.warn("[usePrayerTimes] Loading timed out, forcing completion");
        setLoading(false);
        if (!timings) {
          setError(t("prayers.errors.timeout"));
        }
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [loading, timings]);

  useEffect(() => {
    let isCancelled = false;

    const initFCM = async () => {
      try {
        const { fcmService, createNotificationChannels } = await loadFcmRuntime();
        if (isCancelled) return;

        fcmModuleRef.current = fcmService;
        await createNotificationChannels();
        if (isCancelled) return;

        const firebaseStatus = await fcmService.getFirebaseStatus();
        if (!firebaseStatus.initialized) {
          if (!isCancelled) {
            logger.warn("[usePrayerTimes] Native Firebase unavailable, skipping startup FCM registration");
          }
          return;
        }

        await fcmService.initialize({ requestPermission: false });
        if (!isCancelled) {
          logger.log("[usePrayerTimes] FCM and notification channels initialized");
        }
      } catch (fcmError) {
        if (!isCancelled) {
          logger.warn("[usePrayerTimes] FCM initialization failed:", fcmError);
        }
      }
    };

    if (typeof Notification !== "undefined") {
      if (Notification.permission === "granted") {
        setPermissionGranted(true);
      } else if (Notification.permission === "default") {
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
      void fcmModuleRef.current?.removeListeners?.();
    };
  }, []);

  const updateNextPrayerRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!timings) return;

    updateNextPrayerRef.current = () => {
      const next = getNextPrayer(timings);
      setNextPrayer((prev) => {
        if (!prev || prev.key !== next.key || prev.time !== next.time || prev.isTomorrow !== next.isTomorrow) {
          return next;
        }
        return prev;
      });
    };

    updateNextPrayerRef.current();
  }, [timings]);

  useVisibilityAwareInterval(() => {
    updateNextPrayerRef.current();
  }, timings ? TIMING.REFRESH_INTERVAL_MS : null);

  const handleEnableNotifications = async (): Promise<void> => {
    const granted = await requestNotificationPermission();
    setPermissionGranted(granted);
    setShowWelcome(false);
    storageService.setBoolean(STORAGE_KEYS.HAS_SEEN_WELCOME, true);

    if (!granted) return;

    try {
      const { fcmService, createNotificationChannels } = await loadFcmRuntime();
      const fcmModule = fcmModuleRef.current || fcmService;
      fcmModuleRef.current = fcmModule;
      await createNotificationChannels();
      await fcmModule.initialize({ requestPermission: false });
    } catch (fcmError) {
      logger.warn("[usePrayerTimes] Notification permission granted but FCM init failed:", fcmError);
    }
  };

  const handleCloseWelcome = (): void => {
    setShowWelcome(false);
    storageService.setBoolean(STORAGE_KEYS.HAS_SEEN_WELCOME, true);
  };

  useEffect(() => {
    if (timings) return undefined;

    void fetchPrayerTimes(null, true);
    return undefined;
  }, [fetchPrayerTimes, timings]);

  return {
    timings,
    nextPrayer,
    loading,
    error,
    permissionGranted,
    showWelcome,
    fetchPrayerTimes,
    handleEnableNotifications,
    handleCloseWelcome,
  };
};

export const useStickyNotification = (timings: PrayerTimings | null, nextPrayer: NextPrayer | null): void => {
  const isStickyEnabled = useAppStore((s) => s.settings.stickyNotification);

  useEffect(() => {
    if (!timings || !nextPrayer) return;

    let stickyInterval: ReturnType<typeof setInterval> | undefined;
    let isDisposed = false;

    const updateStickyNotification = async () => {
      if (isDisposed) return;

      if (!isStickyEnabled) {
        await cancelStickyNotification();
        if (stickyInterval) clearInterval(stickyInterval);
        return;
      }

      const pushStickyUpdate = async () => {
        const now = new Date();
        const prayerTime = timings[nextPrayer.key];
        if (!prayerTime) return;

        const [h, m] = prayerTime.split(":").map(Number);
        const prayerDate = new Date();
        prayerDate.setHours(h, m, 0);

        if (prayerDate < now) {
          prayerDate.setDate(prayerDate.getDate() + 1);
        }

        const diff = prayerDate.getTime() - now.getTime();
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
        if (!document.hidden) {
          void pushStickyUpdate();
        }
      }, TIMING.REFRESH_INTERVAL_MS);
    };

    void updateStickyNotification();

    return () => {
      isDisposed = true;
      if (stickyInterval) clearInterval(stickyInterval);
    };
  }, [timings, nextPrayer, isStickyEnabled]);
};

export const useAndroidWidget = (timings: PrayerTimings | null, nextPrayer: NextPrayer | null, locationName?: string): void => {
  useEffect(() => {
    if (!timings || !nextPrayer) return;

    const updateWidget = async () => {
      try {
        const prayerTime = timings[nextPrayer.key];
        if (!prayerTime) return;

        await updateAndroidWidget({
          name: nextPrayer.name,
          time: prayerTime,
          location: locationName || "Huzur",
        });
      } catch (e) {
        logger.warn("[usePrayerTimes] Widget update failed:", e);
      }
    };

    updateWidget();
  }, [timings, nextPrayer, locationName]);
};

export default usePrayerTimes;

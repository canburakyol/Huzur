import { useState, useEffect } from "react";
import { checkAndUpdateStreak, getStreakDisplay } from "../services/streakService";
import { getProStateSnapshot, isPro as checkIsPro, verifyProStatus } from "../services/proService";
import { detectAndSetLanguage } from "../services/languageService";
import { ONBOARDING_COMPLETED_EVENT, TIMING, STORAGE_KEYS } from "../constants";
import { storageService } from "../services/storageService";
import { isInAdGracePeriod } from "../services/adGracePeriod";
import { logger } from "../utils/logger";
import { scheduleDeferredTask } from "../utils/startupScheduler";
import crashlyticsReporter from "../utils/crashlyticsReporter";
import { useAppStore } from "../stores/useAppStore";
import { initializeThemeMode } from "../services/themeModeService";

type StreakDisplay = {
  current: number;
  longest: number;
  total: number;
  isMilestone: boolean;
  emoji: string;
}

type Badge = {
  id: string;
  days: number;
  emoji: string;
  title: string;
  message: string;
}

type PrayerTimings = Record<string, string>;

type UseAppInitResult = {
  streakData: StreakDisplay;
  newBadge: Badge | null;
  clearBadge: () => void;
  isProUser: boolean;
  isNewUser: boolean;
  bannerEnabled: boolean;
}


export const useAppInit = (
  // Unused since the per-prayer-time colour themes were removed; kept so callers' argument order stays.
  _timings?: PrayerTimings | null,
  activeTab = "home",
  activeFeature: string | null = null,
  isLocationConsentVisible = false,
): UseAppInitResult => {
  const [{ streakData, newBadge: initialBadge }] = useState(() => {
    const result = checkAndUpdateStreak();
    return {
      streakData: result.streakData ? getStreakDisplay() : { current: 0, longest: 0, total: 0, isMilestone: false, emoji: "✨" },
      newBadge: result.newBadge || null,
    };
  });

  const [newBadge, setNewBadge] = useState<Badge | null>(initialBadge);
  const [isProUserLocal, setIsProUserLocal] = useState(() => checkIsPro());
  // Read once per launch; the banner appears on the first app open after the grace period.
  const [inAdGracePeriod] = useState(() => isInAdGracePeriod(storageService.getNumber("APP_INSTALL_DATE", Date.now())));
  const [onboardingCompleted, setOnboardingCompleted] = useState(() =>
    storageService.getBoolean(STORAGE_KEYS.ONBOARDING_COMPLETED, false)
  );
  const setIsProUser = useAppStore((s) => s.setIsProUser);

  useEffect(() => {
    const handleOnboardingCompleted = (): void => setOnboardingCompleted(true);
    window.addEventListener(ONBOARDING_COMPLETED_EVENT, handleOnboardingCompleted);
    return () => window.removeEventListener(ONBOARDING_COMPLETED_EVENT, handleOnboardingCompleted);
  }, []);

  useEffect(() => {
    setIsProUser(isProUserLocal);
  }, [isProUserLocal, setIsProUser]);

  const handleProStatusChange = (event: Event): void => {
    const detail = (event as CustomEvent).detail;
    logger.log("[useAppInit] Pro status changed:", detail);
    if (detail && typeof detail.active !== "undefined") {
      setIsProUserLocal(detail.active);
    } else {
      setIsProUserLocal(checkIsPro());
    }
  };

  useEffect(() => {
    let isCancelled = false;

    const cancelServiceInitialization = scheduleDeferredTask(async () => {
      try {
        const [{ initializeRevenueCat }, { syncProStatusFromServer }] = await Promise.all([
          import("../services/revenueCatService"),
          import("../services/subscriptionSyncService"),
        ]);

        if (isCancelled) return;

        const initResults = await Promise.allSettled([initializeRevenueCat(), detectAndSetLanguage()]);

        if (isCancelled) return;

        initResults.forEach((result, index) => {
          if (result.status === "rejected") {
            const serviceName = index === 0 ? "RevenueCat" : "Language Detection";
            logger.warn(`[useAppInit] ${serviceName} başlatılamadı:`, result.reason);
          } else if (index === 1 && result.value) {
            logger.log("[useAppInit] Device language detected and set:", result.value);
          }
        });

        const proResults = await Promise.allSettled([verifyProStatus(), syncProStatusFromServer()]);

        if (isCancelled) return;

        if (proResults[0].status === "rejected") {
          logger.warn("[useAppInit] verifyProStatus failed:", proResults[0].reason);
        }

        if (proResults[1].status === "rejected") {
          logger.warn("[useAppInit] syncProStatusFromServer failed:", proResults[1].reason);
        }

        const activeProStatus = checkIsPro();
        const proState = getProStateSnapshot();
        crashlyticsReporter.logCrash(
          `[useAppInit] pro resolved active=${activeProStatus} source=${proState.source} state=${proState.verificationState}`
        );
        setIsProUserLocal(activeProStatus);
      } catch (error) {
        if (!isCancelled) {
          logger.error("[useAppInit] Critical initialization error:", error);
        }
      }
    });

    initializeThemeMode();

    if (!storageService.hasKey("APP_INSTALL_DATE")) {
      storageService.setItem("APP_INSTALL_DATE", Date.now());
    }

    window.addEventListener("proStatusChanged", handleProStatusChange);
    return () => {
      isCancelled = true;
      cancelServiceInitialization();
      window.removeEventListener("proStatusChanged", handleProStatusChange);
    };
  }, []);


  useEffect(() => {
    let isCancelled = false;

    if (isProUserLocal) {
      void import("../services/admobService")
        .then(({ adMobService }) => {
          if (!isCancelled) {
            return adMobService.stopAds();
          }
          return null;
        })
        .catch((error) => {
          if (!isCancelled) {
            logger.warn("[useAppInit] AdMob stop failed:", error);
          }
        });

      return () => {
        isCancelled = true;
      };
    }

    if (!onboardingCompleted || inAdGracePeriod) {
      return () => {
        isCancelled = true;
      };
    }

    // The bottom banner is a native view above the WebView: on the paywall it would cover the terms and restore button.
    if (isLocationConsentVisible || activeTab === "quran" || activeFeature === "quran" || activeFeature === "pro") {
      void import("../services/admobService")
        .then(({ adMobService }) => adMobService.hideBanner())
        .catch((error) => {
          if (!isCancelled) {
            logger.warn("[useAppInit] Quran banner cleanup failed:", error);
          }
        });

      return () => {
        isCancelled = true;
      };
    }

    void (async () => {
      try {
        const { adMobService } = await import("../services/admobService");
        if (isCancelled) return;

        await adMobService.initialize();
        if (isCancelled) return;

        await adMobService.showRectangleBanner();
      } catch (error) {
        if (!isCancelled) {
          logger.warn("[useAppInit] AdMob immediate init failed:", error);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [activeFeature, activeTab, inAdGracePeriod, isLocationConsentVisible, isProUserLocal, onboardingCompleted]);

  const clearBadge = () => setNewBadge(null);

  const installDate = storageService.getNumber("APP_INSTALL_DATE", Date.now());
  const isNewUser = Date.now() - installDate < 7 * 24 * 60 * 60 * 1000;
  // Reserve the banner band only when a banner can actually be shown.
  const bannerEnabled = !isProUserLocal && !inAdGracePeriod;

  return { streakData, newBadge, clearBadge, isProUser: isProUserLocal, isNewUser, bannerEnabled };
};

export default useAppInit;

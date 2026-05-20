import { useState, useEffect } from "react";
import { checkAndUpdateStreak, getStreakDisplay } from "../services/streakService";
import { getProStateSnapshot, isPro as checkIsPro, verifyProStatus } from "../services/proService";
import { detectAndSetLanguage } from "../services/languageService";
import { VAKIT_THEMES } from "../data/vakitThemes";
import { THEMES, ACCENT_COLORS } from "../data/themes";
import { TIMING, STORAGE_KEYS } from "../constants";
import { storageService } from "../services/storageService";
import { logger } from "../utils/logger";
import { scheduleDeferredTask } from "../utils/startupScheduler";
import { getPrivacyConsentSnapshot, runPrivacyGatedInitialization } from "../services/privacyConsentStore";
import crashlyticsReporter from "../utils/crashlyticsReporter";
import { useAppStore } from "../stores/useAppStore";

interface StreakDisplay {
  current: number;
  longest: number;
  total: number;
  isMilestone: boolean;
  emoji: string;
}

interface Badge {
  id: string;
  days: number;
  emoji: string;
  title: string;
  message: string;
}

interface AccentColor {
  id: string;
  color: string;
  dark?: string;
  rgb?: string;
}

interface ThemeColors {
  [key: string]: string;
}

interface Theme {
  id: string;
  colors?: ThemeColors;
  bodyGradient?: string;
}

interface PrayerTimings {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}

interface UseAppInitResult {
  streakData: StreakDisplay;
  newBadge: Badge | null;
  clearBadge: () => void;
  isProUser: boolean;
  isNewUser: boolean;
}

const LEGACY_ACCENT_MAP: Record<string, string> = {
  orange: "amber",
  gold: "antique-gold",
  blue: "deep-emerald",
  purple: "olive-gold",
};

const resolveAccent = (accentId: string): AccentColor => {
  const normalized = LEGACY_ACCENT_MAP[accentId] || accentId;
  return ACCENT_COLORS.find((accent) => accent.id === normalized) || ACCENT_COLORS[0];
};

const applyAccent = (accent: AccentColor | undefined): void => {
  if (!accent) return;
  const root = document.documentElement;
  root.style.setProperty("--nav-accent", accent.color);
  root.style.setProperty("--primary-color", accent.color);
  root.style.setProperty("--accent-color", accent.color);
  root.style.setProperty("--accent-vibrant", accent.color);
  root.style.setProperty("--accent-gold-light", accent.color);

  if (accent.dark) {
    root.style.setProperty("--primary-dark", accent.dark);
    root.style.setProperty("--accent-gold", accent.dark);
  }
  if (accent.rgb) {
    root.style.setProperty("--nav-accent-rgb", accent.rgb);
  }
};

const applyThemeColors = (theme: Theme | undefined): void => {
  if (!theme) return;
  const root = document.documentElement;
  if (theme.colors) {
    Object.entries(theme.colors).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }
  if (theme.bodyGradient) {
    document.body.style.background = theme.bodyGradient;
    document.body.style.backgroundAttachment = "fixed";
  }
};

const getVakitTheme = (timings: PrayerTimings | undefined): Theme => {
  if (!timings) return VAKIT_THEMES.DAY;

  const now = new Date();
  const timeStr = now.getHours() * 60 + now.getMinutes();

  const getMinutes = (t: string): number => {
    const [h, m] = t.split(":").map(Number);
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

export const useAppInit = (timings?: PrayerTimings | null): UseAppInitResult => {
  const [{ streakData, newBadge: initialBadge }] = useState(() => {
    const result = checkAndUpdateStreak();
    return {
      streakData: result.streakData ? getStreakDisplay() : { current: 0, isMilestone: false, emoji: "✨" },
      newBadge: result.newBadge || null,
    };
  });

  const [newBadge, setNewBadge] = useState<Badge | null>(initialBadge);
  const [isProUserLocal, setIsProUserLocal] = useState(() => checkIsPro());
  const setIsProUser = useAppStore((s) => s.setIsProUser);

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

    const savedTheme = storageService.getString(STORAGE_KEYS.THEME);
    const savedAccent = storageService.getString("app_accent_color") || "amber";
    applyAccent(resolveAccent(savedAccent));

    if (savedTheme) {
      let targetTheme = savedTheme;
      if (savedTheme === "system") {
        targetTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      document.documentElement.setAttribute("data-theme", targetTheme);
    }

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
    const handleThemeChange = (e: Event): void => {
      const { themeId } = (e as CustomEvent).detail;
      if (themeId === "auto-vakit") {
        if (timings) applyThemeColors(getVakitTheme(timings));
      } else {
        const theme = THEMES.find((t) => t.id === themeId);
        if (theme) applyThemeColors(theme);
      }
    };

    const handleThemeModeChange = (e: Event): void => {
      const { mode } = (e as CustomEvent).detail;
      let targetTheme = mode;
      if (mode === "system") {
        targetTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      document.documentElement.setAttribute("data-theme", targetTheme);
    };

    const handleAccentChange = (e: Event): void => {
      const { accentId, color, dark, rgb } = (e as CustomEvent).detail;
      if (accentId) {
        applyAccent(resolveAccent(accentId));
        return;
      }

      applyAccent({ color, dark, rgb });
    };

    window.addEventListener("appThemeChanged", handleThemeChange);
    window.addEventListener("themeModeChanged", handleThemeModeChange);
    window.addEventListener("accentColorChanged", handleAccentChange);

    return () => {
      window.removeEventListener("appThemeChanged", handleThemeChange);
      window.removeEventListener("themeModeChanged", handleThemeModeChange);
      window.removeEventListener("accentColorChanged", handleAccentChange);
    };
  }, [timings]);

  useEffect(() => {
    const savedTheme = storageService.getString(STORAGE_KEYS.APP_THEME);
    if (savedTheme === "auto-vakit" && timings) {
      applyThemeColors(getVakitTheme(timings));
    }
  }, [timings]);

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

    const cancelAdMobInitialization = runPrivacyGatedInitialization({
      kind: "ads",
      label: "AdMob",
      task: () => scheduleDeferredTask(
        async () => {
          try {
            const { adMobService } = await import("../services/admobService");
            if (isCancelled) return;

            await adMobService.initialize();
            if (isCancelled) return;

            await adMobService.showRectangleBanner();
          } catch (error) {
            if (!isCancelled) {
              logger.warn("[useAppInit] AdMob deferred init failed:", error);
            }
          }
        },
        TIMING.ADMOB_DELAY_MS
      ),
    });

    const handlePrivacyUpdate = (): void => {
      if (getPrivacyConsentSnapshot().adsEnabled) {
        return;
      }

      void import("../services/admobService")
        .then(({ adMobService }) => adMobService.stopAds())
        .catch((error) => {
          if (!isCancelled) {
            logger.warn("[useAppInit] AdMob consent revocation stop failed:", error);
          }
        });
    };

    window.addEventListener("huzur:privacy-settings-updated", handlePrivacyUpdate);

    return () => {
      isCancelled = true;
      cancelAdMobInitialization();
      window.removeEventListener("huzur:privacy-settings-updated", handlePrivacyUpdate);
    };
  }, [isProUserLocal]);

  const clearBadge = () => setNewBadge(null);

  const installDate = storageService.getNumber("APP_INSTALL_DATE", Date.now());
  const isNewUser = Date.now() - installDate < 7 * 24 * 60 * 60 * 1000;

  return { streakData, newBadge, clearBadge, isProUser: isProUserLocal, isNewUser };
};

export default useAppInit;

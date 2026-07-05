import { logger } from "../utils/logger";
import { getPrivacySettingsSync, updatePrivacySettings } from "./privacyModeService";

export type PrivacyConsentKind = "analytics" | "ads";

export type PrivacyConsentSnapshot = {
  analyticsEnabled: boolean;
  adsEnabled: boolean;
  personalizedAdsEnabled: boolean;
  crashReportingEnabled: boolean;
  zeroTelemetryByDefault: boolean;
};

type PrivacyGatedTaskOptions = {
  kind: PrivacyConsentKind;
  label: string;
  task: () => void | (() => void) | Promise<void | (() => void)>;
  runWhenConsentChanges?: boolean;
};

const PRIVACY_UPDATE_EVENT = "huzur:privacy-settings-updated";

export const getPrivacyConsentSnapshot = (): PrivacyConsentSnapshot => {
  const settings = getPrivacySettingsSync() as Record<string, unknown>;
  const analyticsEnabled = settings.telemetryEnabled === true || settings.analytics === true;
  const adsEnabled = settings.adsEnabled === true;

  return {
    analyticsEnabled,
    adsEnabled,
    personalizedAdsEnabled: adsEnabled && settings.personalizedAdsEnabled === true,
    crashReportingEnabled: analyticsEnabled && settings.crashReporting === true,
    zeroTelemetryByDefault: true,
  };
};

export const canInitializeFirebaseAnalytics = (): boolean =>
  getPrivacyConsentSnapshot().analyticsEnabled === true;

export const canInitializeAdMob = (): boolean =>
  getPrivacyConsentSnapshot().adsEnabled === true;

export const updateAnalyticsConsent = (enabled: boolean): PrivacyConsentSnapshot => {
  updatePrivacySettings({
    analytics: enabled === true,
    telemetryEnabled: enabled === true,
    crashReporting: enabled === true ? getPrivacyConsentSnapshot().crashReportingEnabled : false,
  });
  return getPrivacyConsentSnapshot();
};

export const updateAdsConsent = ({
  adsEnabled,
  personalizedAdsEnabled = false,
}: {
  adsEnabled: boolean;
  personalizedAdsEnabled?: boolean;
}): PrivacyConsentSnapshot => {
  updatePrivacySettings({
    adsEnabled: adsEnabled === true,
    personalizedAdsEnabled: adsEnabled === true && personalizedAdsEnabled === true,
  });
  return getPrivacyConsentSnapshot();
};

export const runPrivacyGatedInitialization = ({
  kind,
  label,
  task,
  runWhenConsentChanges = true,
}: PrivacyGatedTaskOptions): (() => void) => {
  let disposed = false;
  let hasRun = false;
  let taskCleanup: (() => void) | null = null;
  const isAllowed = kind === "analytics" ? canInitializeFirebaseAnalytics : canInitializeAdMob;

  const run = (): void => {
    if (disposed || hasRun || !isAllowed()) {
      return;
    }

    hasRun = true;
    void Promise.resolve(task())
      .then((cleanup) => {
        if (typeof cleanup === "function") {
          if (disposed) {
            cleanup();
            return;
          }
          taskCleanup = cleanup;
        }
      })
      .catch((error) => {
        logger.warn(`[PrivacyConsent] ${label} initialization failed`, error);
      });
  };

  run();

  if (!runWhenConsentChanges || hasRun || typeof window === "undefined") {
    return () => {
      disposed = true;
      taskCleanup?.();
    };
  }

  const handleConsentUpdate = (): void => {
    run();
    if (hasRun) {
      window.removeEventListener(PRIVACY_UPDATE_EVENT, handleConsentUpdate);
    }
  };

  window.addEventListener(PRIVACY_UPDATE_EVENT, handleConsentUpdate);

  return () => {
    disposed = true;
    taskCleanup?.();
    window.removeEventListener(PRIVACY_UPDATE_EVENT, handleConsentUpdate);
  };
};

export default {
  getPrivacyConsentSnapshot,
  canInitializeFirebaseAnalytics,
  canInitializeAdMob,
  updateAnalyticsConsent,
  updateAdsConsent,
  runPrivacyGatedInitialization,
};

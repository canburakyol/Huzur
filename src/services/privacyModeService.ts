import { storageService } from './storageService';
import { logger } from '../utils/logger';

export const PRIVACY_SETTINGS_KEY = 'huzur_settings';

type PrivacySettings = {
  analytics: boolean;
  telemetryEnabled: boolean;
  crashReporting: boolean;
  adsEnabled: boolean;
  personalizedAdsEnabled: boolean;
  zeroTelemetryByDefault: boolean;
  [key: string]: unknown;
};

const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = Object.freeze({
  analytics: false,
  telemetryEnabled: false,
  crashReporting: false,
  adsEnabled: false,
  personalizedAdsEnabled: false,
  zeroTelemetryByDefault: true,
});

const normalizePrivacySettings = (value: unknown = {}): PrivacySettings => {
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const telemetryEnabled = source.telemetryEnabled === true || source.analytics === true;
  const crashReporting = telemetryEnabled && source.crashReporting === true;
  const adsEnabled = source.adsEnabled === true;

  return {
    ...source,
    analytics: telemetryEnabled,
    telemetryEnabled,
    crashReporting,
    adsEnabled,
    personalizedAdsEnabled: adsEnabled && source.personalizedAdsEnabled === true,
    zeroTelemetryByDefault: true,
  } as PrivacySettings;
};

const dispatchPrivacyUpdate = (settings: PrivacySettings): void => {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') {
    return;
  }

  try {
    window.dispatchEvent(new CustomEvent('huzur:privacy-settings-updated', {
      detail: settings,
    }));
  } catch (error) {
    logger.warn('[PrivacyMode] Failed to dispatch privacy update', error);
  }
};

const syncNativeCrashlyticsCollection = (enabled: boolean): void => {
  if (typeof window === 'undefined') {
    return;
  }

  const capacitor = (window as typeof window & {
    Capacitor?: {
      Plugins?: {
        Crashlytics?: {
          setCollectionEnabled?: (options: { enabled: boolean }) => Promise<void>;
        };
      };
    };
  }).Capacitor;

  const crashlytics = capacitor?.Plugins?.Crashlytics;
  if (typeof crashlytics?.setCollectionEnabled !== 'function') {
    return;
  }

  void crashlytics.setCollectionEnabled({ enabled }).catch((error) => {
    logger.warn('[PrivacyMode] Failed to sync native Crashlytics consent', error);
  });
};

export const getPrivacySettingsSync = (): PrivacySettings => {
  const current = storageService.getItem(PRIVACY_SETTINGS_KEY, DEFAULT_PRIVACY_SETTINGS) as PrivacySettings;
  return normalizePrivacySettings(current);
};

export const getPrivacySettings = async (): Promise<PrivacySettings> => {
  const current = await storageService.getItemAsync(PRIVACY_SETTINGS_KEY, DEFAULT_PRIVACY_SETTINGS) as PrivacySettings;
  return normalizePrivacySettings(current);
};

export const updatePrivacySettings = (partial: Partial<PrivacySettings> = {}): PrivacySettings => {
  const current = getPrivacySettingsSync();
  const next = normalizePrivacySettings({
    ...current,
    ...(partial && typeof partial === 'object' ? partial : {}),
  });

  storageService.setItem(PRIVACY_SETTINGS_KEY, next);
  void storageService.setItemAsync(PRIVACY_SETTINGS_KEY, next).catch((error) => {
    logger.warn('[PrivacyMode] Failed to mirror settings into Preferences', error);
  });
  if (current.telemetryEnabled === true || next.telemetryEnabled === true) {
    syncNativeCrashlyticsCollection(next.crashReporting === true);
  }
  dispatchPrivacyUpdate(next);
  return next;
};

export const setTelemetryConsent = (enabled: boolean): PrivacySettings => {
  const current = getPrivacySettingsSync();
  return updatePrivacySettings({
    analytics: enabled === true,
    telemetryEnabled: enabled === true,
    crashReporting: enabled === true ? current.crashReporting === true : false,
  });
};

export const setCrashReportingConsent = (enabled: boolean): PrivacySettings => updatePrivacySettings({
  crashReporting: enabled === true,
});

export const isTelemetryEnabledSync = (): boolean => getPrivacySettingsSync().telemetryEnabled === true;

export const isCrashReportingEnabledSync = (): boolean => {
  const settings = getPrivacySettingsSync();
  return settings.telemetryEnabled === true && settings.crashReporting === true;
};

export default {
  PRIVACY_SETTINGS_KEY,
  getPrivacySettings,
  getPrivacySettingsSync,
  updatePrivacySettings,
  setTelemetryConsent,
  setCrashReportingConsent,
  isTelemetryEnabledSync,
  isCrashReportingEnabledSync,
};

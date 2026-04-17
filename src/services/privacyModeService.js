import { storageService } from './storageService';
import { logger } from '../utils/logger';

export const PRIVACY_SETTINGS_KEY = 'huzur_settings';

const DEFAULT_PRIVACY_SETTINGS = Object.freeze({
  analytics: false,
  telemetryEnabled: false,
  crashReporting: false,
  zeroTelemetryByDefault: true,
});

const normalizePrivacySettings = (value = {}) => {
  const source = value && typeof value === 'object' ? value : {};
  const telemetryEnabled = source.telemetryEnabled === true || source.analytics === true;
  const crashReporting = telemetryEnabled && source.crashReporting === true;

  return {
    ...source,
    analytics: telemetryEnabled,
    telemetryEnabled,
    crashReporting,
    zeroTelemetryByDefault: true,
  };
};

const dispatchPrivacyUpdate = (settings) => {
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

export const getPrivacySettingsSync = () => {
  const current = storageService.getItem(PRIVACY_SETTINGS_KEY, DEFAULT_PRIVACY_SETTINGS);
  return normalizePrivacySettings(current);
};

export const getPrivacySettings = async () => {
  const current = await storageService.getItemAsync(PRIVACY_SETTINGS_KEY, DEFAULT_PRIVACY_SETTINGS);
  return normalizePrivacySettings(current);
};

export const updatePrivacySettings = (partial = {}) => {
  const current = getPrivacySettingsSync();
  const next = normalizePrivacySettings({
    ...current,
    ...(partial && typeof partial === 'object' ? partial : {}),
  });

  storageService.setItem(PRIVACY_SETTINGS_KEY, next);
  void storageService.setItemAsync(PRIVACY_SETTINGS_KEY, next).catch((error) => {
    logger.warn('[PrivacyMode] Failed to mirror settings into Preferences', error);
  });
  dispatchPrivacyUpdate(next);
  return next;
};

export const setTelemetryConsent = (enabled) => {
  const current = getPrivacySettingsSync();
  return updatePrivacySettings({
    analytics: enabled === true,
    telemetryEnabled: enabled === true,
    crashReporting: enabled === true ? current.crashReporting === true : false,
  });
};

export const setCrashReportingConsent = (enabled) => updatePrivacySettings({
  crashReporting: enabled === true,
});

export const isTelemetryEnabledSync = () => getPrivacySettingsSync().telemetryEnabled === true;

export const isCrashReportingEnabledSync = () => {
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

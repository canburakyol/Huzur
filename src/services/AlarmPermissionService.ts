import { Capacitor } from '@capacitor/core';
import PrayerSchedule, { type ExactAlarmPermissionStatus } from '../plugins/PrayerSchedulePlugin';
import { logger } from '../utils/logger';

export type { ExactAlarmPermissionStatus };

const UNKNOWN_EXACT_ALARM_ERROR = 'Unknown exact alarm permission error';

const buildNoopStatus = (): ExactAlarmPermissionStatus => ({
  granted: true,
  canScheduleExactAlarms: true,
  requiresUserApproval: false,
  platform: Capacitor.getPlatform()
});

const isNativeAndroid = (): boolean => Capacitor.getPlatform() === 'android';

export const shouldOpenExactAlarmSettings = (status: ExactAlarmPermissionStatus): boolean => (
  status.platform === 'android'
  && status.requiresUserApproval
  && !status.canScheduleExactAlarms
);

export const getExactAlarmPermissionStatus = async (): Promise<ExactAlarmPermissionStatus> => {
  if (!isNativeAndroid()) {
    return buildNoopStatus();
  }

  try {
    return await PrayerSchedule.getExactAlarmPermissionStatus();
  } catch (error) {
    logger.warn('[AlarmPermission] Failed to read exact alarm permission status', error);
    return {
      ...buildNoopStatus(),
      granted: false,
      canScheduleExactAlarms: false,
      requiresUserApproval: true,
      platform: 'android',
      error: error instanceof Error ? error.message : UNKNOWN_EXACT_ALARM_ERROR
    };
  }
};

export const canScheduleExactAlarms = async (): Promise<boolean> => {
  const status = await getExactAlarmPermissionStatus();
  return status.canScheduleExactAlarms;
};

export const openExactAlarmSettings = async (): Promise<ExactAlarmPermissionStatus> => {
  if (!isNativeAndroid()) {
    return buildNoopStatus();
  }

  try {
    return await PrayerSchedule.openExactAlarmSettings();
  } catch (error) {
    logger.warn('[AlarmPermission] Failed to open exact alarm settings', error);
    return {
      ...buildNoopStatus(),
      granted: false,
      canScheduleExactAlarms: false,
      requiresUserApproval: true,
      platform: 'android',
      error: error instanceof Error ? error.message : UNKNOWN_EXACT_ALARM_ERROR
    };
  }
};

export const ensureExactAlarmPermission = async (): Promise<ExactAlarmPermissionStatus> => {
  const status = await getExactAlarmPermissionStatus();
  if (!shouldOpenExactAlarmSettings(status)) {
    return status;
  }

  return openExactAlarmSettings();
};

export default {
  canScheduleExactAlarms,
  getExactAlarmPermissionStatus,
  ensureExactAlarmPermission,
  openExactAlarmSettings,
  shouldOpenExactAlarmSettings
};

import { registerPlugin, Capacitor } from '@capacitor/core';
import { logger } from '../utils/logger';

export interface ExactAlarmPermissionStatus {
  granted: boolean;
  canScheduleExactAlarms: boolean;
  requiresUserApproval: boolean;
  platform: string;
  sdkInt?: number;
  error?: string;
}

export interface PrayerScheduleResult {
  success: boolean;
  platform: string;
  error?: string;
}

export interface SyncPrayerScheduleOptions {
  timings: Record<string, string>;
  latitude?: number | null;
  longitude?: number | null;
  locationName?: string;
  adhanSound?: string | null;
  prayerNotificationsEnabled?: boolean;
  monthlySnapshots?: unknown[];
  labels?: NativeNotificationLabels;
}

/** Texts the native adhan alarm shows; native code cannot read the app language itself. */
export interface NativeNotificationLabels {
  prayerNames: Record<string, string>;
  /** Contains %s where the prayer name goes. */
  adhanTitle: string;
  adhanChannelName: string;
  adhanChannelDescription: string;
}

export interface PrayerNotificationsEnabledOptions {
  enabled: boolean;
}

export interface PrayerSchedulePlugin {
  syncPrayerSchedule(options: SyncPrayerScheduleOptions): Promise<PrayerScheduleResult>;
  setPrayerNotificationsEnabled(options: PrayerNotificationsEnabledOptions): Promise<PrayerScheduleResult>;
  getExactAlarmPermissionStatus(): Promise<ExactAlarmPermissionStatus>;
  openExactAlarmSettings(): Promise<ExactAlarmPermissionStatus>;
}

const noopPlugin: PrayerSchedulePlugin = {
  async syncPrayerSchedule(): Promise<PrayerScheduleResult> {
    return { success: false, platform: Capacitor.getPlatform(), error: 'Plugin not available' };
  },
  async setPrayerNotificationsEnabled(): Promise<PrayerScheduleResult> {
    return { success: false, platform: Capacitor.getPlatform(), error: 'Plugin not available' };
  },
  async getExactAlarmPermissionStatus(): Promise<ExactAlarmPermissionStatus> {
    return {
      granted: true,
      canScheduleExactAlarms: true,
      requiresUserApproval: false,
      platform: Capacitor.getPlatform()
    };
  },
  async openExactAlarmSettings(): Promise<ExactAlarmPermissionStatus> {
    return this.getExactAlarmPermissionStatus();
  }
};

let PrayerSchedule: PrayerSchedulePlugin;
try {
  if (Capacitor.isPluginAvailable('PrayerSchedule')) {
    PrayerSchedule = registerPlugin<PrayerSchedulePlugin>('PrayerSchedule', {
      web: () => noopPlugin
    });
  } else {
    PrayerSchedule = noopPlugin;
  }
} catch (error) {
  logger.error('[PrayerSchedulePlugin] Failed to register plugin', error);
  PrayerSchedule = noopPlugin;
}

export { PrayerSchedule };
export default PrayerSchedule;

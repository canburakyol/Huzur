import { Capacitor } from '@capacitor/core';
import { ensureExactAlarmPermission } from './AlarmPermissionService';
import { fetchMonthlyPrayerTimes, getNextPrayer } from './prayerService';
import { syncPrayerScheduleCacheToNative } from './storageService';
import { updateWidget } from './widgetService';
import { logger } from '../utils/logger';
import crashlyticsReporter, { buildCrashContext } from '../utils/crashlyticsReporter';

type PrayerTimings = Record<string, string>;

type MonthlySnapshot = {
  year: number;
  month: number;
  timings: unknown[];
};

type SyncPrayerScheduleParams = {
  timings: PrayerTimings;
  latitude?: number | null;
  longitude?: number | null;
  locationName?: string;
  adhanSound?: string | null;
};

type SyncResult = {
  success: boolean;
  error?: string;
  platform?: string;
};

const roundCoordinate = (value: number | null | undefined): number | null => {
  if (!Number.isFinite(value as number)) {
    return null;
  }

  return Number((value as number).toFixed(4));
};

const normalizeMonthlySnapshot = (snapshot: unknown): MonthlySnapshot | null => {
  const snap = snapshot as { timings?: unknown[]; year?: number; month?: number } | null;
  if (!snap?.timings || !Array.isArray(snap.timings)) {
    return null;
  }

  return {
    year: snap.year as number,
    month: snap.month as number,
    timings: snap.timings
  };
};

const collectMonthlySnapshots = async ({
  latitude,
  longitude,
  locationName
}: {
  latitude: number | null;
  longitude: number | null;
  locationName: string | undefined;
}): Promise<MonthlySnapshot[]> => {
  const snapshots: MonthlySnapshot[] = [];
  const currentDate = new Date();
  const nextDate = new Date(currentDate);
  nextDate.setDate(nextDate.getDate() + 1);

  const city = locationName && locationName !== 'Konum' ? locationName : 'Istanbul';

  const currentSnapshot = normalizeMonthlySnapshot(
    await fetchMonthlyPrayerTimes(latitude, longitude, city, 'Turkey', currentDate)
  );
  if (currentSnapshot) {
    snapshots.push(currentSnapshot);
  }

  if (
    nextDate.getMonth() !== currentDate.getMonth()
    || nextDate.getFullYear() !== currentDate.getFullYear()
  ) {
    const nextSnapshot = normalizeMonthlySnapshot(
      await fetchMonthlyPrayerTimes(latitude, longitude, city, 'Turkey', nextDate)
    );
    if (nextSnapshot) {
      snapshots.push(nextSnapshot);
    }
  }

  return snapshots;
};

export const syncPrayerSchedule = async ({
  timings,
  latitude = null,
  longitude = null,
  locationName = 'Huzur',
  adhanSound = null
}: SyncPrayerScheduleParams): Promise<SyncResult> => {
  if (!timings || typeof timings !== 'object') {
    return { success: false, error: 'Prayer timings are required' };
  }

  const nextPrayer = getNextPrayer(timings);
  if (nextPrayer?.key) {
    await updateWidget({
      name: nextPrayer.name,
      time: timings[nextPrayer.key],
      location: locationName || 'Huzur'
    });
  }

  if (Capacitor.getPlatform() === 'web') {
    return { success: false, platform: 'web' };
  }

  try {
    const alarmPermission = await ensureExactAlarmPermission();
    if (!alarmPermission.granted) {
      logger.warn('[PrayerSchedule] Exact alarm permission is not granted; native inexact fallback will be used', {
        platform: alarmPermission.platform,
        sdkInt: alarmPermission.sdkInt,
        requiresUserApproval: alarmPermission.requiresUserApproval
      });
      crashlyticsReporter.logCrash(
        `[PrayerSchedule] exact_alarm_permission_missing sdk=${alarmPermission.sdkInt ?? 'unknown'}`
      );
    }

    const monthlySnapshots = await collectMonthlySnapshots({ latitude, longitude, locationName });
    const result = await syncPrayerScheduleCacheToNative({
      timings,
      latitude: roundCoordinate(latitude),
      longitude: roundCoordinate(longitude),
      locationName,
      adhanSound,
      monthlySnapshots
    });

    crashlyticsReporter.logCrash(
      `[PrayerSchedule] synced success=${Boolean(result?.success)} lat=${roundCoordinate(latitude)} lon=${roundCoordinate(longitude)}`
    );

    return result as SyncResult;
  } catch (error) {
    logger.warn('[PrayerSchedule] Sync failed', error);
    crashlyticsReporter.logExceptionWithContext(
      error as Error,
      buildCrashContext('prayer_schedule_sync', {
        latitude: roundCoordinate(latitude),
        longitude: roundCoordinate(longitude)
      })
    );
    throw error;
  }
};

export default {
  syncPrayerSchedule
};

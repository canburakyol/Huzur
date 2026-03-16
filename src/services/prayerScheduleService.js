import { Capacitor } from '@capacitor/core';
import PrayerSchedule from '../plugins/PrayerSchedulePlugin';
import { fetchMonthlyPrayerTimes, getNextPrayer } from './prayerService';
import { updateWidget } from './widgetService';
import { logger } from '../utils/logger';
import crashlyticsReporter, { buildCrashContext } from '../utils/crashlyticsReporter';

const roundCoordinate = (value) => {
  if (!Number.isFinite(value)) {
    return null;
  }

  return Number(value.toFixed(4));
};

const normalizeMonthlySnapshot = (snapshot) => {
  if (!snapshot?.timings || !Array.isArray(snapshot.timings)) {
    return null;
  }

  return {
    year: snapshot.year,
    month: snapshot.month,
    timings: snapshot.timings
  };
};

const collectMonthlySnapshots = async ({ latitude, longitude, locationName }) => {
  const snapshots = [];
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
}) => {
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
    const monthlySnapshots = await collectMonthlySnapshots({ latitude, longitude, locationName });
    const result = await PrayerSchedule.syncPrayerSchedule({
      timings,
      latitude: roundCoordinate(latitude),
      longitude: roundCoordinate(longitude),
      locationName,
      adhanSound,
      monthlySnapshots
    });

    crashlyticsReporter.logCrash(
      `[PrayerSchedule] synced success=${Boolean(result?.success)} lat=${roundCoordinate(latitude)} lon=${roundCoordinate(longitude)}`
    ).catch(() => {});

    return result;
  } catch (error) {
    logger.warn('[PrayerSchedule] Sync failed', error);
    crashlyticsReporter.logExceptionWithContext(
      error,
      buildCrashContext('prayer_schedule_sync', {
        latitude: roundCoordinate(latitude),
        longitude: roundCoordinate(longitude)
      })
    ).catch(() => {});
    return { success: false, error: error?.message || 'Prayer schedule sync failed' };
  }
};

export default {
  syncPrayerSchedule
};

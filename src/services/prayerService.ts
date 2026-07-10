import { format } from 'date-fns';
import { storageService } from './storageService';
import { logger } from '../utils/logger';
import { offlineCalculatorService } from './offlineCalculatorService';
import { sanitizePrayerTimings, PRAYER_KEYS_ALL } from '../constants/prayerTimes';
import { getTodayDiyanetTimes, fetchMonthlyDiyanetTimes, mapDiyanetToInternalTimings } from './diyanetApiService';
import { findDistrictByName, getSelectedDistrictId } from './diyanetLocationService';

interface PrayerTimings {
  [key: string]: string;
}

interface PrayerDate {
  readable: string;
}

interface PrayerMeta {
  method: {
    name: string;
  };
}

interface PrayerPayload {
  timings: PrayerTimings;
  date?: PrayerDate;
  meta?: PrayerMeta;
  [key: string]: unknown;
}

interface MonthlyPrayerData {
  timings: PrayerPayload[];
  timestamp: number;
  month: number;
  year: number;
  latitude: number;
  longitude: number;
}

interface NextPrayer {
  name: string;
  time: string;
  key: string;
  isTomorrow: boolean;
}

const CACHE_KEY_PREFIX = 'prayerTimes_';
const MONTHLY_CACHE_KEY_PREFIX = 'prayerMonthly_';

const DEFAULT_LAT = 41.0082;
const DEFAULT_LON = 28.9784;

const isValidPrayerTimeValue = (value: unknown): boolean => typeof value === 'string' && /^\d{2}:\d{2}$/.test(value);

const normalizePrayerPayload = (payload: unknown): PrayerPayload | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const sanitizedTimings = sanitizePrayerTimings((payload as PrayerPayload).timings || payload as PrayerTimings);
  const hasAllRequiredTimings = PRAYER_KEYS_ALL.every((key) => isValidPrayerTimeValue(sanitizedTimings?.[key]));

  if (!hasAllRequiredTimings) {
    return null;
  }

  if ((payload as PrayerPayload).timings) {
    return {
      ...payload as PrayerPayload,
      timings: sanitizedTimings as PrayerTimings
    };
  }

  return {
    timings: sanitizedTimings as PrayerTimings
  };
};

/**
 * Fetches monthly prayer times. Tries Diyanet API first, falls back to offline adhan calculation.
 */
export const fetchMonthlyPrayerTimes = async (
  latitude: number | null = null,
  longitude: number | null = null,
  city = 'Istanbul',
  // eslint-disable-next-line no-unused-vars
  _country = 'Turkey',
  targetDate = new Date()
): Promise<MonthlyPrayerData | null> => {
  try {
    const month = targetDate.getMonth() + 1;
    const year = targetDate.getFullYear();
    const lat = latitude || DEFAULT_LAT;
    const lon = longitude || DEFAULT_LON;
    const districtId = findDistrictByName(city)?.districtId || getSelectedDistrictId();
    const monthlyKey = `${MONTHLY_CACHE_KEY_PREFIX}${districtId}_${lat.toFixed(4)}_${lon.toFixed(4)}_${year}_${month}`;

    const existing = storageService.getItem<MonthlyPrayerData>(monthlyKey);
    if (existing && Array.isArray(existing.timings) && existing.timings.length > 0) {
      const isRealDiyanet = existing.timings.every(t => t.meta?.method?.name === 'Diyanet');
      if (isRealDiyanet) {
        return existing;
      }
    }

    // Try Diyanet API first
    try {
      const diyanetDays = await fetchMonthlyDiyanetTimes(districtId);

      if (Array.isArray(diyanetDays) && diyanetDays.length > 0) {
        const timingsArray: PrayerPayload[] = diyanetDays.map((day) => {
          const mapped = mapDiyanetToInternalTimings(day);
          return {
            timings: mapped as unknown as PrayerTimings,
            date: { readable: day.MiladiTarihUzun || day.MiladiTarihKisa },
            meta: { method: { name: 'Diyanet' } },
          };
        });

        const dataToCache: MonthlyPrayerData = {
          timings: timingsArray,
          timestamp: Date.now(),
          month,
          year,
          latitude: lat,
          longitude: lon,
        };

        storageService.setItem(monthlyKey, dataToCache);
        logger.log('[PrayerService] Monthly Diyanet API data cached');
        return dataToCache;
      }
    } catch (diyanetError) {
      logger.warn('[PrayerService] Diyanet monthly fetch failed, falling back to offline:', diyanetError);
    }

    // Fallback: offline adhan calculation
    const daysInMonth = new Date(year, month, 0).getDate();
    const timingsArray: PrayerPayload[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const calculatedTimings = offlineCalculatorService.calculatePrayerTimes(lat, lon, date);

      timingsArray.push({
        timings: calculatedTimings as unknown as PrayerTimings,
        date: { readable: format(date, 'dd MMM yyyy') },
        meta: { method: { name: 'Diyanet (Offline)' } }
      });
    }

    const dataToCache: MonthlyPrayerData = {
      timings: timingsArray,
      timestamp: Date.now(),
      month,
      year,
      latitude: lat,
      longitude: lon
    };

    storageService.setItem(monthlyKey, dataToCache);
    logger.log('[PrayerService] Monthly offline calculation cached');
    return dataToCache;
  } catch (error) {
    logger.error('[PrayerService] Monthly prayer times fetch failed:', error);
  }
  return null;
};

/**
 * Gets today's prayer times. Tries Diyanet API first, falls back to offline adhan calculation.
 */
export const getPrayerTimes = async (latitude: number | null = null, longitude: number | null = null): Promise<PrayerPayload> => {
  const today = format(new Date(), 'dd-MM-yyyy');
  const lat = latitude || DEFAULT_LAT;
  const lon = longitude || DEFAULT_LON;
  const districtId = getSelectedDistrictId();
  const cacheKey = `${CACHE_KEY_PREFIX}${districtId}_${lat.toFixed(4)}_${lon.toFixed(4)}_${today}`;

  try {
    // Check daily cache first (Only accept real Diyanet API cache on success path)
    const cachedData = storageService.getItem<PrayerPayload>(cacheKey);
    const normalizedCachedData = normalizePrayerPayload(cachedData);
    if (normalizedCachedData && normalizedCachedData.meta?.method?.name === 'Diyanet') {
      return normalizedCachedData;
    }

    // Try Diyanet API
    try {
      const diyanetTimings = await getTodayDiyanetTimes(districtId);

      if (diyanetTimings) {
        const now = new Date();
        const result = normalizePrayerPayload({
          timings: diyanetTimings as unknown as PrayerTimings,
          date: { readable: format(now, 'dd MMM yyyy') },
          meta: { method: { name: 'Diyanet' } },
        });

        if (result) {
          logger.log('[PrayerService] Prayer times fetched from Diyanet API');
          storageService.setItem(cacheKey, result);
          cleanupOldDailyCache(cacheKey);
          return result;
        }
      }
    } catch (diyanetError) {
      logger.warn('[PrayerService] Diyanet daily fetch failed, falling back to offline:', diyanetError);
    }

    // Fallback 1: If daily cache exists (even if it is offline calculator 'Diyanet (Offline)'), use it before doing a new calculation
    if (normalizedCachedData) {
      logger.log('[PrayerService] Using cached offline/older times as fallback');
      return normalizedCachedData;
    }

    // Fallback 2: offline adhan calculation
    const now = new Date();
    const calculatedTimes = offlineCalculatorService.calculatePrayerTimes(lat, lon, now);

    if (calculatedTimes) {
      logger.log('[PrayerService] Prayer times calculated OFFLINE via adhan (fallback)');

      const result = normalizePrayerPayload({
        timings: calculatedTimes,
        date: { readable: format(now, 'dd MMM yyyy') },
        meta: { method: { name: 'Diyanet (Offline)' } },
      });

      if (!result) {
        throw new Error('Offline prayer time calculation returned invalid timings');
      }

      storageService.setItem(cacheKey, result);
      cleanupOldDailyCache(cacheKey);
      return result;
    }

    throw new Error('Offline prayer time calculation returned null');
  } catch (error) {
    logger.error('[PrayerService] Prayer times fetch failed:', error);

    // Last resort: try monthly cache
    const now = new Date();
    const dayOfMonth = now.getDate();
    const monthlyKey = `${MONTHLY_CACHE_KEY_PREFIX}${lat.toFixed(4)}_${lon.toFixed(4)}_${now.getFullYear()}_${now.getMonth() + 1}`;
    const monthlyCache = storageService.getItem<MonthlyPrayerData>(monthlyKey);

    if (monthlyCache?.timings?.[dayOfMonth - 1]) {
      const todayData = normalizePrayerPayload(monthlyCache.timings[dayOfMonth - 1]);
      if (todayData) {
        logger.log(`[PrayerService] Using monthly cache fallback for day ${dayOfMonth}`);
        storageService.setItem(cacheKey, todayData);
        return todayData;
      }
    }

    throw new Error('Namaz vakitleri hesaplanamadı. Lütfen uygulamayı yeniden başlatın.');
  }
};

const cleanupOldDailyCache = (currentCacheKey: string): void => {
  try {
    const allKeys = Object.keys(localStorage).filter(
      key => key.startsWith(CACHE_KEY_PREFIX) && key !== currentCacheKey
    );
    allKeys.forEach(key => storageService.removeItem(key));
  } catch (error) {
    logger.error('[PrayerService] Cache cleanup failed', error);
  }
};

export const getNextPrayer = (timings: PrayerTimings | null | undefined, currentTime = new Date()): NextPrayer | null => {
  const normalizedTimings = sanitizePrayerTimings(timings);
  const hasAllRequiredTimings = PRAYER_KEYS_ALL.every((key) => isValidPrayerTimeValue(normalizedTimings?.[key]));
  if (!hasAllRequiredTimings) return null;

  const timeStr = format(currentTime, 'HH:mm');

  const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const prayerNames: Record<string, string> = {
    'Fajr': 'İmsak',
    'Sunrise': 'Güneş',
    'Dhuhr': 'Öğle',
    'Asr': 'İkindi',
    'Maghrib': 'Akşam',
    'Isha': 'Yatsı'
  };

  for (const prayer of prayers) {
    if (normalizedTimings![prayer] > timeStr) {
      return {
        name: prayerNames[prayer],
        time: normalizedTimings![prayer],
        key: prayer,
        isTomorrow: false
      };
    }
  }

  return {
    name: 'İmsak',
    time: normalizedTimings!.Fajr,
    key: 'Fajr',
    isTomorrow: true
  };
};

export default {
  fetchMonthlyPrayerTimes,
  getPrayerTimes,
  getNextPrayer
};

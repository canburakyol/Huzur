import { format } from 'date-fns';
import { storageService } from './storageService';
import { logger } from '../utils/logger';
import { offlineCalculatorService } from './offlineCalculatorService';
import { sanitizePrayerTimings, PRAYER_KEYS_ALL } from '../constants/prayerTimes';

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
      timings: sanitizedTimings
    };
  }

  return {
    timings: sanitizedTimings
  };
};

export const fetchMonthlyPrayerTimes = (
  latitude: number | null = null,
  longitude: number | null = null,
  // eslint-disable-next-line no-unused-vars
  _city = 'Istanbul',
  // eslint-disable-next-line no-unused-vars
  _country = 'Turkey',
  targetDate = new Date()
): MonthlyPrayerData | null => {
  try {
    const month = targetDate.getMonth() + 1;
    const year = targetDate.getFullYear();
    const lat = latitude || DEFAULT_LAT;
    const lon = longitude || DEFAULT_LON;
    const monthlyKey = `${MONTHLY_CACHE_KEY_PREFIX}${lat.toFixed(4)}_${lon.toFixed(4)}_${year}_${month}`;

    const existing = storageService.getItem<MonthlyPrayerData>(monthlyKey);
    if (existing && Array.isArray(existing.timings) && existing.timings.length > 0) {
      return existing;
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    const timingsArray: PrayerPayload[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const calculatedTimings = offlineCalculatorService.calculatePrayerTimes(lat, lon, date);

      timingsArray.push({
        timings: calculatedTimings,
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
    logger.error('[PrayerService] Monthly offline calculation failed:', error);
  }
  return null;
};

export const getPrayerTimes = (latitude: number | null = null, longitude: number | null = null): PrayerPayload => {
  const today = format(new Date(), 'dd-MM-yyyy');
  const lat = latitude || DEFAULT_LAT;
  const lon = longitude || DEFAULT_LON;
  const cacheKey = `${CACHE_KEY_PREFIX}${lat.toFixed(4)}_${lon.toFixed(4)}_${today}`;

  try {
    const cachedData = storageService.getItem<PrayerPayload>(cacheKey);
    const normalizedCachedData = normalizePrayerPayload(cachedData);
    if (normalizedCachedData) {
      return normalizedCachedData;
    }

    if (cachedData) {
      storageService.removeItem(cacheKey);
    }

    const now = new Date();
    const calculatedTimes = offlineCalculatorService.calculatePrayerTimes(lat, lon, now);

    if (calculatedTimes) {
      logger.log('[PrayerService] Prayer times calculated OFFLINE via adhan');

      const result = normalizePrayerPayload({
        timings: calculatedTimes,
        date: { readable: format(now, 'dd MMM yyyy') },
        meta: { method: { name: 'Diyanet (Offline)' } },
      });

      if (!result) {
        throw new Error('Offline prayer time calculation returned invalid timings');
      }

      storageService.setItem(cacheKey, result);

      try {
        const allKeys = Object.keys(localStorage).filter(
          key => key.startsWith(CACHE_KEY_PREFIX) && key !== cacheKey
        );
        allKeys.forEach(key => storageService.removeItem(key));
      } catch (error) {
        logger.error('[PrayerService] Cache cleanup failed', error);
      }

      return result;
    }

    throw new Error('Offline prayer time calculation returned null');
  } catch (error) {
    logger.error('[PrayerService] Offline calculation failed:', error);

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
    if (normalizedTimings[prayer] > timeStr) {
      return {
        name: prayerNames[prayer],
        time: normalizedTimings[prayer],
        key: prayer,
        isTomorrow: false
      };
    }
  }

  return {
    name: 'İmsak',
    time: normalizedTimings.Fajr,
    key: 'Fajr',
    isTomorrow: true
  };
};

export default {
  fetchMonthlyPrayerTimes,
  getPrayerTimes,
  getNextPrayer
};

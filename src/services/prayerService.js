import { format } from 'date-fns';
import { storageService } from './storageService';
import { logger } from '../utils/logger';
import { offlineCalculatorService } from './offlineCalculatorService';
import { sanitizePrayerTimings, PRAYER_KEYS_ALL } from '../constants/prayerTimes';

// Cache key prefixes
const CACHE_KEY_PREFIX = 'prayerTimes_';
const MONTHLY_CACHE_KEY_PREFIX = 'prayerMonthly_';

// Default coordinates for Istanbul
const DEFAULT_LAT = 41.0082;
const DEFAULT_LON = 28.9784;

const isValidPrayerTimeValue = (value) => typeof value === 'string' && /^\d{2}:\d{2}$/.test(value);

const normalizePrayerPayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const sanitizedTimings = sanitizePrayerTimings(payload.timings || payload);
  const hasAllRequiredTimings = PRAYER_KEYS_ALL.every((key) => isValidPrayerTimeValue(sanitizedTimings?.[key]));

  if (!hasAllRequiredTimings) {
    return null;
  }

  if (payload.timings) {
    return {
      ...payload,
      timings: sanitizedTimings
    };
  }

  return {
    timings: sanitizedTimings
  };
};

/**
 * Calculate and cache monthly prayer times OFFLINE (no network).
 * Uses the `adhan` npm package via offlineCalculatorService.
 */
export const fetchMonthlyPrayerTimes = (
  latitude = null,
  longitude = null,
  // eslint-disable-next-line no-unused-vars
  _city = 'Istanbul',
  // eslint-disable-next-line no-unused-vars
  _country = 'Turkey',
  targetDate = new Date()
) => {
  try {
    const month = targetDate.getMonth() + 1;
    const year = targetDate.getFullYear();
    const lat = latitude || DEFAULT_LAT;
    const lon = longitude || DEFAULT_LON;
    const monthlyKey = `${MONTHLY_CACHE_KEY_PREFIX}${lat.toFixed(4)}_${lon.toFixed(4)}_${year}_${month}`;

    // Check if we already have a cached copy
    const existing = storageService.getItem(monthlyKey);
    if (existing && Array.isArray(existing.timings) && existing.timings.length > 0) {
      return existing;
    }

    // Calculate the full month offline using the adhan library
    const daysInMonth = new Date(year, month, 0).getDate();
    const timingsArray = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const calculatedTimings = offlineCalculatorService.calculatePrayerTimes(lat, lon, date);

      timingsArray.push({
        timings: calculatedTimings,
        date: { readable: format(date, 'dd MMM yyyy') },
        meta: { method: { name: 'Diyanet (Offline)' } }
      });
    }

    const dataToCache = {
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

/**
 * Get prayer times — 100% OFFLINE using the `adhan` npm package.
 * No outbound network requests are made.
 *
 * @param {number|null} latitude - User's latitude
 * @param {number|null} longitude - User's longitude
 * @param {string} _city - Unused (kept for API compatibility)
 * @param {string} _country - Unused (kept for API compatibility)
 */
export const getPrayerTimes = (latitude = null, longitude = null) => {
  const today = format(new Date(), 'dd-MM-yyyy');
  const lat = latitude || DEFAULT_LAT;
  const lon = longitude || DEFAULT_LON;
  const cacheKey = `${CACHE_KEY_PREFIX}${lat.toFixed(4)}_${lon.toFixed(4)}_${today}`;

  try {
    // 1. Check daily cache first
    const cachedData = storageService.getItem(cacheKey);
    const normalizedCachedData = normalizePrayerPayload(cachedData);
    if (normalizedCachedData) {
      return normalizedCachedData;
    }

    if (cachedData) {
      storageService.removeItem(cacheKey);
    }

    // 2. Calculate prayer times OFFLINE using the adhan library
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

      // Cache the result for the rest of the day
      storageService.setItem(cacheKey, result);

      // Cleanup old daily caches
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

    // Fallback: check monthly cache
    const now = new Date();
    const dayOfMonth = now.getDate();
    const monthlyKey = `${MONTHLY_CACHE_KEY_PREFIX}${lat.toFixed(4)}_${lon.toFixed(4)}_${now.getFullYear()}_${now.getMonth() + 1}`;
    const monthlyCache = storageService.getItem(monthlyKey);

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

export const getNextPrayer = (timings, currentTime = new Date()) => {
  const normalizedTimings = sanitizePrayerTimings(timings);
  const hasAllRequiredTimings = PRAYER_KEYS_ALL.every((key) => isValidPrayerTimeValue(normalizedTimings?.[key]));
  if (!hasAllRequiredTimings) return null;

  const timeStr = format(currentTime, 'HH:mm');

  const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const prayerNames = {
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

  // If all passed, next is Fajr tomorrow
  return {
    name: 'İmsak',
    time: normalizedTimings.Fajr,
    key: 'Fajr',
    isTomorrow: true
  };
};

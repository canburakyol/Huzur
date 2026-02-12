import axios from 'axios';
import { format } from 'date-fns';
import { storageService } from './storageService';
import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';
import { offlineCalculatorService } from './offlineCalculatorService';

// Use coordinate-based API for accurate location-based prayer times
const API_URL_COORDS = 'https://api.aladhan.com/v1/timings';
const API_URL_CITY = 'https://api.aladhan.com/v1/timingsByCity';
const CACHE_KEY_PREFIX = 'prayerTimes_';
const MONTHLY_CACHE_KEY_PREFIX = 'prayerMonthly_';
const CACHE_MAX_AGE_DAYS = 30;

/**
 * Fetch and cache monthly prayer times for offline use
 * Background background job to ensure we have a full month of data
 */
export const fetchMonthlyPrayerTimes = async (latitude = null, longitude = null, city = 'Istanbul', country = 'Turkey') => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const lat = latitude || DEFAULT_LAT;
    const lon = longitude || DEFAULT_LON;
    const monthlyKey = `${MONTHLY_CACHE_KEY_PREFIX}${lat.toFixed(2)}_${lon.toFixed(2)}_${year}_${month}`;

    let response;
    if (latitude && longitude) {
      response = await axios.get(`https://api.aladhan.com/v1/calendar/${year}/${month}`, {
        params: {
          latitude,
          longitude,
          method: 13, // Diyanet
        },
        timeout: 15000
      });
    } else {
      response = await axios.get(`https://api.aladhan.com/v1/calendarByCity/${year}/${month}`, {
        params: {
          city,
          country,
          method: 13,
        },
        timeout: 15000
      });
    }

    if (response.data && response.data.data) {
      const dataToCache = {
        timings: response.data.data,
        timestamp: Date.now(),
        month,
        year,
        latitude: lat,
        longitude: lon
      };
      storageService.setItem(monthlyKey, dataToCache);
      logger.log('[PrayerService] Monthly cache updated for offline use');
      return dataToCache;
    }
  } catch (error) {
    logger.error('[PrayerService] Monthly fetch failed:', error);
  }
  return null;
};

// Default coordinates for Istanbul
const DEFAULT_LAT = 41.0082;
const DEFAULT_LON = 28.9784;

/**
 * Get prayer times based on coordinates (preferred) or city name (fallback)
 * @param {number|null} latitude - User's latitude
 * @param {number|null} longitude - User's longitude
 * @param {string} city - Fallback city name
 * @param {string} country - Fallback country name
 */
export const getPrayerTimes = async (latitude = null, longitude = null, city = 'Istanbul', country = 'Turkey') => {
  const today = format(new Date(), 'dd-MM-yyyy');
  const lat = latitude || DEFAULT_LAT;
  const lon = longitude || DEFAULT_LON;
  const cacheKey = `${CACHE_KEY_PREFIX}${lat.toFixed(2)}_${lon.toFixed(2)}_${today}`;
  
  const now = new Date();
  const dayOfMonth = now.getDate();
  const monthlyKey = `${MONTHLY_CACHE_KEY_PREFIX}${lat.toFixed(2)}_${lon.toFixed(2)}_${now.getFullYear()}_${now.getMonth() + 1}`;

  try {
    // 1. Günlük cache kontrolü (En taze veri)
    const cachedData = storageService.getItem(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    let response;
    const timestamp = Math.floor(now.getTime() / 1000);
    
    // 2. API İsteği - Bugünün verisini çek
    if (latitude && longitude) {
      response = await axios.get(`${API_URL_COORDS}/${timestamp}`, {
        params: { latitude, longitude, method: 13 },
        timeout: 8000
      });
    } else {
      response = await axios.get(API_URL_CITY, {
        params: { city, country, method: 13, date: today },
        timeout: 8000
      });
    }

    if (response.data && response.data.data) {
      // Background monthly fetch if monthly cache is missing or older than 7 days
      const monthlyData = storageService.getItem(monthlyKey);
      if (!monthlyData || (Date.now() - monthlyData.timestamp > 7 * 24 * 60 * 60 * 1000)) {
        fetchMonthlyPrayerTimes(latitude, longitude, city, country);
      }

      // Cleanup old daily caches using storageService
      try {
        const allKeys = Object.keys(localStorage).filter(
          key => key.startsWith(CACHE_KEY_PREFIX) && key !== cacheKey
        );
        allKeys.forEach(key => storageService.removeItem(key));
      } catch {
        // Silently fail on cache cleanup
      }

      storageService.setItem(cacheKey, response.data.data);
      return response.data.data;
    }
    throw new Error('Geçersiz API yanıtı');
  } catch (error) {
    logger.warn('[PrayerService] API call failed, attempting offline fallback...', error.message);

    // 3. OFFLINE FALLBACK: Monthly cache'den bugünü bul
    const monthlyCache = storageService.getItem(monthlyKey);
    if (monthlyCache && monthlyCache.timings && monthlyCache.timings[dayOfMonth - 1]) {
      const todayData = monthlyCache.timings[dayOfMonth - 1];
      logger.log(`[PrayerService] Using monthly cache fallback for day ${dayOfMonth}`);
      
      // Gelecek sefer için günlük cache'e de yazalım ki offline performansı artsın
      storageService.setItem(cacheKey, todayData);
      
      return todayData.timings || todayData;
    }

    // 4. SON FALLBACK: Matematiksel Hesaplama (Faz 2)
    const calculatedTimes = offlineCalculatorService.calculatePrayerTimes(lat, lon, now);
    if (calculatedTimes) {
      logger.log('[PrayerService] Using MATHEMATICAL CALCULATION fallback');
      const finalData = {
        timings: calculatedTimes,
        date: { readable: format(now, 'dd MMM yyyy') },
        meta: { method: { name: 'Diyanet (Offline Calc)' } },
        isOfflineCalculated: true
      };
      
      // Gelecek sefer için günlük cache'e de yazalım
      storageService.setItem(cacheKey, finalData);
      
      return finalData;
    }

    // 5. Hata mesajları
    if (error.code === 'ECONNABORTED' || error.request) {
      throw new Error('İnternet bağlantısı yok veya servis yanıt vermiyor. Lütfen bağlantınızı kontrol edin.');
    }
    throw error;
  }
};

export const getNextPrayer = (timings) => {
  if (!timings) return null;

  const now = new Date();
  const timeStr = format(now, 'HH:mm');

  const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const prayerNames = {
    'Fajr': 'İmsak',
    'Sunrise': 'Güneş',
    'Dhuhr': 'Öğle',
    'Asr': 'İkindi',
    'Maghrib': 'Akşam',
    'Isha': 'Yatsı'
  };

  for (let prayer of prayers) {
    if (timings[prayer] > timeStr) {
      return {
        name: prayerNames[prayer],
        time: timings[prayer],
        key: prayer,
        isTomorrow: false
      };
    }
  }

  // If all passed, next is Fajr tomorrow
  return {
    name: 'İmsak',
    time: timings['Fajr'],
    key: 'Fajr',
    isTomorrow: true
  };
};

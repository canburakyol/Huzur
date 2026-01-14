import axios from 'axios';
import { format } from 'date-fns';
import { storageService } from './storageService';
import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';

// Use coordinate-based API for accurate location-based prayer times
const API_URL_COORDS = 'https://api.aladhan.com/v1/timings';
const API_URL_CITY = 'https://api.aladhan.com/v1/timingsByCity';
const CACHE_KEY_PREFIX = 'prayerTimes_';
const FALLBACK_CACHE_KEY = 'prayerTimes_fallback';
const CACHE_MAX_AGE_HOURS = 48; // Fallback cache valid for 48 hours

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
  try {
    const today = format(new Date(), 'dd-MM-yyyy');
    const timestamp = Math.floor(Date.now() / 1000); // Unix timestamp for API
    
    // Create cache key based on coordinates (rounded to 2 decimals for cache efficiency)
    const lat = latitude || DEFAULT_LAT;
    const lon = longitude || DEFAULT_LON;
    const cacheKey = `${CACHE_KEY_PREFIX}${lat.toFixed(2)}_${lon.toFixed(2)}_${today}`;

    // 1. Günlük cache kontrolü
    const cachedData = storageService.getItem(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    let response;
    
    // 2. API İsteği - Prefer coordinates if available
    if (latitude && longitude) {
      // Use coordinate-based endpoint for accurate location
      response = await axios.get(`${API_URL_COORDS}/${timestamp}`, {
        params: {
          latitude,
          longitude,
          method: 13, // Diyanet İşleri Başkanlığı
        },
        timeout: 10000
      });
      logger.log('[PrayerService] Fetched times by coordinates');
    } else {
      // Fallback to city-based endpoint
      response = await axios.get(API_URL_CITY, {
        params: {
          city,
          country,
          method: 13,
          date: today
        },
        timeout: 10000
      });
      logger.log('[PrayerService] Fetched times by city:', city);
    }

    if (response.data && response.data.data) {
      // 3. Eski günlük cache'leri temizle
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(CACHE_KEY_PREFIX) && key !== cacheKey && key !== FALLBACK_CACHE_KEY) {
          storageService.removeItem(key);
        }
      });

      // 4. Günlük cache kaydet
      storageService.setItem(cacheKey, response.data.data);

      // 5. Fallback cache kaydet (timestamp ile)
      const fallbackData = {
        data: response.data.data,
        timestamp: Date.now(),
        latitude: lat,
        longitude: lon,
        date: today
      };
      storageService.setItem(FALLBACK_CACHE_KEY, fallbackData);

      return response.data.data;
    }
    throw new Error('Geçersiz API yanıtı');
  } catch (error) {
    console.error("Error fetching prayer times:", error);

    // 6. OFFLINE FALLBACK: Son geçerli cache'i kullan
    const fallback = storageService.getItem(FALLBACK_CACHE_KEY);
    if (fallback) {
      try {
        const ageHours = (Date.now() - fallback.timestamp) / (1000 * 60 * 60);

        if (ageHours < CACHE_MAX_AGE_HOURS) {
          logger.log(`Using fallback cache from ${Math.round(ageHours)} hours ago`);
          return fallback.data;
        }
      } catch (e) {
        console.error('Fallback parse error:', e);
      }
    }

    // 7. Hata mesajları
    if (error.code === 'ECONNABORTED') {
      throw new Error('İstek zaman aşımına uğradı. Lütfen tekrar deneyin.');
    }
    if (error.request) {
      throw new Error('İnternet bağlantısı yok. Lütfen bağlantınızı kontrol edin.');
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

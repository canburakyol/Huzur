import { useState, useEffect, useCallback, useRef } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { storageService } from '../services/storageService';
import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';

const DEFAULT_LAT = 41.0082;
const DEFAULT_LON = 28.9784;
const DEFAULT_LOCATION_NAME = 'İstanbul';
const LOCATION_WEATHER_CACHE_PREFIX = 'location_weather_cache_';
const LOCATION_WEATHER_CACHE_TTL_MS = 30 * 60 * 1000;

const buildLocationCacheKey = (lat, lon) => {
  return `${LOCATION_WEATHER_CACHE_PREFIX}${Number(lat).toFixed(3)}_${Number(lon).toFixed(3)}`;
};

const getCachedLocationSnapshot = (lat, lon) => {
  try {
    const cached = storageService.getItem(buildLocationCacheKey(lat, lon));
    if (!cached || typeof cached !== 'object') {
      return null;
    }

    const ageMs = Date.now() - Number(cached.timestamp || 0);
    if (!Number.isFinite(ageMs) || ageMs < 0 || ageMs > LOCATION_WEATHER_CACHE_TTL_MS) {
      return null;
    }

    return cached;
  } catch {
    return null;
  }
};

const setCachedLocationSnapshot = (lat, lon, payload) => {
  try {
    storageService.setItem(buildLocationCacheKey(lat, lon), {
      ...payload,
      timestamp: Date.now()
    });
  } catch {
    // no-op
  }
};

/**
 * Location Consent and Weather Hook
 * Handles Google Play Prominent Disclosure requirement for location permission
 *
 * @param {Function} onLocationUpdate - Callback when location is obtained
 * @returns {Object} Location consent state and functions
 */
export const useLocationConsent = (onLocationUpdate) => {
  const [weather, setWeather] = useState(null);
  const [locationName, setLocationName] = useState('Konum...');
  const [showLocationPrompt, setShowLocationPrompt] = useState(() => {
    return !storageService.getString(STORAGE_KEYS.LOCATION_CONSENT);
  });
  const [locationConsentGiven, setLocationConsentGiven] = useState(() => {
    return storageService.getString(STORAGE_KEYS.LOCATION_CONSENT) === 'true';
  });
  const lastForwardedLocationRef = useRef('');

  const forwardLocationUpdate = useCallback((latitude, longitude) => {
    if (!onLocationUpdate) {
      return;
    }

    const signature = `${Number(latitude).toFixed(4)}:${Number(longitude).toFixed(4)}`;
    if (lastForwardedLocationRef.current === signature) {
      return;
    }

    lastForwardedLocationRef.current = signature;
    onLocationUpdate({ latitude, longitude });
  }, [onLocationUpdate]);

  const fetchWeatherData = useCallback(async (lat, lon, isDefault = false) => {
    const cachedSnapshot = getCachedLocationSnapshot(lat, lon);
    if (cachedSnapshot) {
      setWeather(cachedSnapshot.weather || null);
      setLocationName(cachedSnapshot.locationName || (isDefault ? DEFAULT_LOCATION_NAME : 'Konum'));
      return cachedSnapshot;
    }

    try {
      const weatherPromise = fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
      ).then(async (response) => {
        const weatherData = await response.json();
        return weatherData.current_weather || null;
      });

      const locationPromise = isDefault
        ? Promise.resolve(DEFAULT_LOCATION_NAME)
        : fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=tr`
          ).then(async (response) => {
            const locationData = await response.json();
            return locationData.city || locationData.locality || locationData.principalSubdivision || 'Konum';
          });

      const [weatherResult, locationResult] = await Promise.allSettled([weatherPromise, locationPromise]);

      const nextWeather = weatherResult.status === 'fulfilled' ? weatherResult.value : null;
      const nextLocationName = locationResult.status === 'fulfilled'
        ? locationResult.value
        : (isDefault ? DEFAULT_LOCATION_NAME : 'Konum');

      setWeather(nextWeather);
      setLocationName(nextLocationName);
      setCachedLocationSnapshot(lat, lon, {
        weather: nextWeather,
        locationName: nextLocationName
      });

      if (!isDefault && nextLocationName) {
        logger.log('[useLocationConsent] Detected city:', nextLocationName);
      }

      return { weather: nextWeather, locationName: nextLocationName };
    } catch (error) {
      logger.error('[useLocationConsent] Weather/Location error:', error);
      return null;
    }
  }, []);

  const handleLocationConsent = useCallback((accepted) => {
    return new Promise((resolve) => {
      setShowLocationPrompt(false);

      if (accepted) {
        storageService.setString(STORAGE_KEYS.LOCATION_CONSENT, 'true');
        setLocationConsentGiven(true);

        Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }).then((position) => {
          const { latitude, longitude } = position.coords;
          logger.log('[useLocationConsent] Location obtained:', latitude, longitude);
          window.debugLat = latitude;
          window.debugLon = longitude;

          void fetchWeatherData(latitude, longitude);
          forwardLocationUpdate(latitude, longitude);
          resolve({ latitude, longitude });
        }).catch((error) => {
          logger.warn('[useLocationConsent] Location permission denied/error after consent:', error);
          void fetchWeatherData(DEFAULT_LAT, DEFAULT_LON, true);
          window.debugLat = DEFAULT_LAT;
          window.debugLon = DEFAULT_LON;
          forwardLocationUpdate(DEFAULT_LAT, DEFAULT_LON);
          resolve({ latitude: DEFAULT_LAT, longitude: DEFAULT_LON });
        });
      } else {
        storageService.setString(STORAGE_KEYS.LOCATION_CONSENT, 'declined');
        void fetchWeatherData(DEFAULT_LAT, DEFAULT_LON, true);
        forwardLocationUpdate(DEFAULT_LAT, DEFAULT_LON);
        resolve({ latitude: DEFAULT_LAT, longitude: DEFAULT_LON });
      }
    });
  }, [fetchWeatherData, forwardLocationUpdate]);

  useEffect(() => {
    const storedConsent = storageService.getString(STORAGE_KEYS.LOCATION_CONSENT);

    if (!storedConsent) {
      void fetchWeatherData(DEFAULT_LAT, DEFAULT_LON, true);
      forwardLocationUpdate(DEFAULT_LAT, DEFAULT_LON);
      return;
    }

    if (storedConsent === 'true') {
      Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000
      }).then((position) => {
        const { latitude, longitude } = position.coords;
        logger.log('[useLocationConsent] Initial location obtained:', latitude, longitude);
        window.debugLat = latitude;
        window.debugLon = longitude;
        void fetchWeatherData(latitude, longitude);
        forwardLocationUpdate(latitude, longitude);
      }).catch((error) => {
        logger.warn('[useLocationConsent] Initial location error:', error);
        window.debugLat = DEFAULT_LAT;
        window.debugLon = DEFAULT_LON;
        forwardLocationUpdate(DEFAULT_LAT, DEFAULT_LON);
      });
      return;
    }

    void fetchWeatherData(DEFAULT_LAT, DEFAULT_LON, true);
    window.debugLat = DEFAULT_LAT;
    window.debugLon = DEFAULT_LON;
    forwardLocationUpdate(DEFAULT_LAT, DEFAULT_LON);
  }, [fetchWeatherData, forwardLocationUpdate]);

  return {
    weather,
    locationName,
    showLocationPrompt,
    locationConsentGiven,
    handleLocationConsent
  };
};

export default useLocationConsent;

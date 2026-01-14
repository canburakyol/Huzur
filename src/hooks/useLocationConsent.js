import { useState, useEffect, useCallback } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { storageService } from '../services/storageService';
import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';

// Default coordinates for Istanbul
const DEFAULT_LAT = 41.0082;
const DEFAULT_LON = 28.9784;

/**
 * Location Consent and Weather Hook
 * Handles Google Play Prominent Disclosure requirement for location permission
 * 
 * @param {Function} onLocationUpdate - Callback when location is obtained
 * @returns {Object} Location consent state and functions
 */
export const useLocationConsent = (onLocationUpdate) => {
  const [weather, setWeather] = useState(null);
  const [locationName, setLocationName] = useState('İstanbul');
  // Initialize showLocationPrompt based on stored consent (prevents cascading render)
  const [showLocationPrompt, setShowLocationPrompt] = useState(() => {
    return !storageService.getString(STORAGE_KEYS.LOCATION_CONSENT_GIVEN);
  });
  const [locationConsentGiven, setLocationConsentGiven] = useState(() => {
    return storageService.getString(STORAGE_KEYS.LOCATION_CONSENT_GIVEN) === 'true';
  });

  // Fetch weather data
  const fetchWeatherData = useCallback(async (lat, lon, isDefault = false) => {
    try {
      // Weather (OpenMeteo - Free)
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
      );
      const weatherData = await weatherRes.json();
      setWeather(weatherData.current_weather);

      if (!isDefault) {
        // Location Name (BigDataCloud - Free)
        const locRes = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=tr`
        );
        const locData = await locRes.json();
        setLocationName(locData.city || locData.locality || 'Konum');
      }
    } catch (error) {
      logger.error('[useLocationConsent] Weather/Location error:', error);
    }
  }, []);

  // Handle location consent from user
  const handleLocationConsent = useCallback((accepted) => {
    setShowLocationPrompt(false);
    
    if (accepted) {
      storageService.setString(STORAGE_KEYS.LOCATION_CONSENT_GIVEN, 'true');
      setLocationConsentGiven(true);

      // Request location after consent
      Geolocation.getCurrentPosition({
        enableHighAccuracy: false, // Battery optimization: Use low accuracy by default
        timeout: 15000,
        maximumAge: 30000 // Accept cached location up to 30s old
      }).then((position) => {
        const { latitude, longitude } = position.coords;
        logger.log('[useLocationConsent] Location obtained:', latitude, longitude);
        window.debugLat = latitude;
        window.debugLon = longitude;

        fetchWeatherData(latitude, longitude).catch(err => logger.error(err));
        // Notify parent about location update
        if (onLocationUpdate) {
          onLocationUpdate({ latitude, longitude });
        }
      }).catch((error) => {
        logger.warn('[useLocationConsent] Location permission denied/error after consent:', error);
        // Fallback to Istanbul
        fetchWeatherData(DEFAULT_LAT, DEFAULT_LON, true);
        window.debugLat = DEFAULT_LAT;
        window.debugLon = DEFAULT_LON;
        if (onLocationUpdate) onLocationUpdate({ latitude: DEFAULT_LAT, longitude: DEFAULT_LON });
      });
    } else {
      storageService.setString(STORAGE_KEYS.LOCATION_CONSENT_GIVEN, 'declined');
      // Fallback for declined consent
      fetchWeatherData(DEFAULT_LAT, DEFAULT_LON, true);
      if (onLocationUpdate) onLocationUpdate({ latitude: DEFAULT_LAT, longitude: DEFAULT_LON });
    }
  }, [fetchWeatherData, onLocationUpdate]);

  // Initial location check - fetch weather based on consent status
  useEffect(() => {
    const storedConsent = storageService.getString(STORAGE_KEYS.LOCATION_CONSENT_GIVEN);

    if (!storedConsent) {
      // First-time users - showLocationPrompt is already true from initial state
      // Use fallback location until consent is given (but still load prayer times)
      // eslint-disable-next-line
      fetchWeatherData(DEFAULT_LAT, DEFAULT_LON, true);
      // Load prayer times with default location so app doesn't stay stuck on loading
      if (onLocationUpdate) {
        onLocationUpdate({ latitude: DEFAULT_LAT, longitude: DEFAULT_LON });
      }
    } else if (storedConsent === 'true') {
      Geolocation.getCurrentPosition({
        enableHighAccuracy: false, // Battery optimization
        timeout: 15000,
        maximumAge: 30000
      }).then((position) => {
        const { latitude, longitude } = position.coords;
        logger.log('[useLocationConsent] Initial location obtained:', latitude, longitude);
        window.debugLat = latitude;
        window.debugLon = longitude;
        fetchWeatherData(latitude, longitude);
        // Notify parent about location update
        if (onLocationUpdate) {
          onLocationUpdate({ latitude, longitude });
        }
      }).catch((error) => {
        logger.warn('[useLocationConsent] Initial location error:', error);
        window.debugLat = DEFAULT_LAT;
        window.debugLon = DEFAULT_LON;
        if (onLocationUpdate) onLocationUpdate({ latitude: DEFAULT_LAT, longitude: DEFAULT_LON });
      });
    } else {
      // Fallback to Istanbul (First time or Declined)
      fetchWeatherData(DEFAULT_LAT, DEFAULT_LON, true);
      window.debugLat = DEFAULT_LAT;
      window.debugLon = DEFAULT_LON;
      
      // Initialize with default location so the app can load
      if (onLocationUpdate) {
        onLocationUpdate({ latitude: DEFAULT_LAT, longitude: DEFAULT_LON });
      }
    }
  }, [fetchWeatherData, onLocationUpdate]);

  return {
    weather,
    locationName,
    showLocationPrompt,
    locationConsentGiven,
    handleLocationConsent
  };
};

export default useLocationConsent;

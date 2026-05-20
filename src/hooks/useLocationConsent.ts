import { useState, useEffect, useCallback, useRef } from "react";
import { Geolocation } from "@capacitor/geolocation";
import { storageService } from "../services/storageService";
import { STORAGE_KEYS } from "../constants";
import { logger } from "../utils/logger";

interface WeatherData {
  temperature: number;
  [key: string]: unknown;
}

interface LocationCoords {
  latitude: number;
  longitude: number;
  locationName?: string;
  city?: string;
  name?: string;
}

interface LocationSnapshot {
  weather: WeatherData | null;
  locationName: string;
  timestamp: number;
}

interface UseLocationConsentResult {
  weather: WeatherData | null;
  locationName: string;
  showLocationPrompt: boolean;
  locationConsentGiven: boolean;
  handleLocationConsent: (accepted: boolean) => Promise<LocationCoords>;
}

const DEFAULT_LAT = 41.0082;
const DEFAULT_LON = 28.9784;
const DEFAULT_LOCATION_NAME = "Istanbul";
const LOCATION_WEATHER_CACHE_PREFIX = "location_weather_cache_";
const LOCATION_LAST_COORDS_KEY = "location_last_coords";
const LOCATION_WEATHER_CACHE_TTL_MS = 30 * 60 * 1000;
const LOCATION_REQUEST_TIMEOUT_MS = 5000;

declare global {
  interface Window {
    debugLat?: number;
    debugLon?: number;
  }
}

const buildLocationCacheKey = (lat: number, lon: number): string => {
  return `${LOCATION_WEATHER_CACHE_PREFIX}${Number(lat).toFixed(3)}_${Number(lon).toFixed(3)}`;
};

const getStoredLastCoords = (): LocationCoords | null => {
  const coords = storageService.getItem<LocationCoords>(LOCATION_LAST_COORDS_KEY);
  if (!Number.isFinite(coords?.latitude) || !Number.isFinite(coords?.longitude)) {
    return null;
  }

  return coords;
};

const setStoredLastCoords = (latitude: number, longitude: number): void => {
  storageService.setItem(LOCATION_LAST_COORDS_KEY, {
    latitude,
    longitude,
  });
};

const getCachedLocationSnapshot = (lat: number, lon: number): LocationSnapshot | null => {
  try {
    const cached = storageService.getItem<LocationSnapshot>(buildLocationCacheKey(lat, lon));
    if (!cached || typeof cached !== "object") {
      return null;
    }

    const ageMs = Date.now() - Number(cached.timestamp || 0);
    if (!Number.isFinite(ageMs) || ageMs < 0 || ageMs > LOCATION_WEATHER_CACHE_TTL_MS) {
      return null;
    }

    return cached;
  } catch (error) {
    logger.error("[useLocationConsent] Failed to read cached location snapshot", error);
    return null;
  }
};

const setCachedLocationSnapshot = (lat: number, lon: number, payload: Omit<LocationSnapshot, "timestamp">): void => {
  try {
    storageService.setItem(buildLocationCacheKey(lat, lon), {
      ...payload,
      timestamp: Date.now(),
    });
  } catch (error) {
    logger.error("[useLocationConsent] Failed to persist cached location snapshot", error);
  }
};

const setDebugLocation = (latitude: number, longitude: number): void => {
  if (!import.meta.env.DEV) return;

  window.debugLat = latitude;
  window.debugLon = longitude;
};

const fetchJsonWithTimeout = async (url: string, timeoutMs = LOCATION_REQUEST_TIMEOUT_MS): Promise<Record<string, unknown>> => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } finally {
    window.clearTimeout(timeoutId);
  }
};

export const useLocationConsent = (onLocationUpdate?: (coords: LocationCoords) => void): UseLocationConsentResult => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [locationName, setLocationName] = useState("Konum...");
  const [showLocationPrompt, setShowLocationPrompt] = useState(() => {
    return !storageService.getString(STORAGE_KEYS.LOCATION_CONSENT);
  });
  const [locationConsentGiven, setLocationConsentGiven] = useState(() => {
    return storageService.getString(STORAGE_KEYS.LOCATION_CONSENT) === "true";
  });
  const lastForwardedLocationRef = useRef("");

  const forwardLocationUpdate = useCallback(
    (latitude: number, longitude: number) => {
      if (!onLocationUpdate) return;

      const signature = `${Number(latitude).toFixed(4)}:${Number(longitude).toFixed(4)}`;
      if (lastForwardedLocationRef.current === signature) return;

      lastForwardedLocationRef.current = signature;
      onLocationUpdate({ latitude, longitude });
    },
    [onLocationUpdate]
  );

  const fetchWeatherData = useCallback(async (lat: number, lon: number, isDefault = false): Promise<LocationSnapshot | null> => {
    const cachedSnapshot = getCachedLocationSnapshot(lat, lon);
    if (cachedSnapshot) {
      setWeather(cachedSnapshot.weather || null);
      setLocationName(cachedSnapshot.locationName || (isDefault ? DEFAULT_LOCATION_NAME : "Konum"));
      return cachedSnapshot;
    }

    try {
      const weatherPromise = fetchJsonWithTimeout(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
      ).then((weatherData) => (weatherData.current_weather as WeatherData) || null);

      const locationPromise = isDefault
        ? Promise.resolve(DEFAULT_LOCATION_NAME)
        : fetchJsonWithTimeout(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=tr`
          ).then((locationData) => {
            return (locationData.city || locationData.locality || locationData.principalSubdivision || "Konum") as string;
          });

      const [weatherResult, locationResult] = await Promise.allSettled([weatherPromise, locationPromise]);
      const nextWeather = weatherResult.status === "fulfilled" ? weatherResult.value : null;
      const nextLocationName = locationResult.status === "fulfilled" ? locationResult.value : isDefault ? DEFAULT_LOCATION_NAME : "Konum";

      setWeather(nextWeather);
      setLocationName(nextLocationName);
      setCachedLocationSnapshot(lat, lon, {
        weather: nextWeather,
        locationName: nextLocationName,
      });

      if (!isDefault && nextLocationName) {
        logger.log("[useLocationConsent] Detected city:", nextLocationName);
      }

      if (weatherResult.status === "rejected") {
        logger.warn("[useLocationConsent] Weather request failed:", weatherResult.reason);
      }

      if (locationResult.status === "rejected") {
        logger.warn("[useLocationConsent] Reverse geocode request failed:", locationResult.reason);
      }

      return { weather: nextWeather, locationName: nextLocationName, timestamp: Date.now() };
    } catch (error) {
      logger.error("[useLocationConsent] Weather/Location error:", error);
      const fallbackLocationName = cachedSnapshot?.locationName || (isDefault ? DEFAULT_LOCATION_NAME : "Konum");
      setWeather(cachedSnapshot?.weather || null);
      setLocationName(fallbackLocationName);
      return null;
    }
  }, []);

  const handleLocationConsent = useCallback(
    (accepted: boolean): Promise<LocationCoords> => {
      return new Promise((resolve) => {
        setShowLocationPrompt(false);

        if (accepted) {
          storageService.setString(STORAGE_KEYS.LOCATION_CONSENT, "true");
          setLocationConsentGiven(true);

          Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 30000,
          })
            .then((position) => {
              const { latitude, longitude } = position.coords;
              logger.log("[useLocationConsent] Location obtained:", latitude, longitude);
              setDebugLocation(latitude, longitude);
              setStoredLastCoords(latitude, longitude);

              void fetchWeatherData(latitude, longitude);
              forwardLocationUpdate(latitude, longitude);
              resolve({ latitude, longitude });
            })
            .catch((error) => {
              logger.warn("[useLocationConsent] Location permission denied/error after consent:", error);
              void fetchWeatherData(DEFAULT_LAT, DEFAULT_LON, true);
              setDebugLocation(DEFAULT_LAT, DEFAULT_LON);
              forwardLocationUpdate(DEFAULT_LAT, DEFAULT_LON);
              resolve({ latitude: DEFAULT_LAT, longitude: DEFAULT_LON });
            });
        } else {
          storageService.setString(STORAGE_KEYS.LOCATION_CONSENT, "declined");
          void fetchWeatherData(DEFAULT_LAT, DEFAULT_LON, true);
          forwardLocationUpdate(DEFAULT_LAT, DEFAULT_LON);
          resolve({ latitude: DEFAULT_LAT, longitude: DEFAULT_LON });
        }
      });
    },
    [fetchWeatherData, forwardLocationUpdate]
  );

  useEffect(() => {
    let cancelled = false;

    const loadDefaultLocation = async () => {
      setDebugLocation(DEFAULT_LAT, DEFAULT_LON);
      forwardLocationUpdate(DEFAULT_LAT, DEFAULT_LON);
      await Promise.resolve();
      if (cancelled) return;

      await fetchWeatherData(DEFAULT_LAT, DEFAULT_LON, true);
    };

    const storedConsent = storageService.getString(STORAGE_KEYS.LOCATION_CONSENT);

    if (!storedConsent) {
      void loadDefaultLocation();
      return () => {
        cancelled = true;
      };
    }

    if (storedConsent === "true") {
      const lastCoords = getStoredLastCoords();
      if (lastCoords) {
        setDebugLocation(lastCoords.latitude, lastCoords.longitude);
        forwardLocationUpdate(lastCoords.latitude, lastCoords.longitude);
        void fetchWeatherData(lastCoords.latitude, lastCoords.longitude);
      } else {
        setDebugLocation(DEFAULT_LAT, DEFAULT_LON);
        forwardLocationUpdate(DEFAULT_LAT, DEFAULT_LON);
        void fetchWeatherData(DEFAULT_LAT, DEFAULT_LON, true);
      }

      Geolocation.getCurrentPosition({
        enableHighAccuracy: false,
        timeout: 6000,
        maximumAge: 30000,
      })
        .then((position) => {
          const { latitude, longitude } = position.coords;
          logger.log("[useLocationConsent] Initial location obtained:", latitude, longitude);
          if (cancelled) return;

          setDebugLocation(latitude, longitude);
          setStoredLastCoords(latitude, longitude);
          void fetchWeatherData(latitude, longitude);
          forwardLocationUpdate(latitude, longitude);
        })
        .catch((error) => {
          logger.warn("[useLocationConsent] Initial location error:", error);
        });

      return () => {
        cancelled = true;
      };
    }

    void loadDefaultLocation();
    return () => {
      cancelled = true;
    };
  }, [fetchWeatherData, forwardLocationUpdate]);

  return {
    weather,
    locationName,
    showLocationPrompt,
    locationConsentGiven,
    handleLocationConsent,
  };
};

export default useLocationConsent;

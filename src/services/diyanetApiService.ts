import { logger } from '../utils/logger';
import { storageService } from './storageService';

// --- Types ---

export interface DiyanetRawPrayerDay {
  Imsak: string;
  Gunes: string;
  Ogle: string;
  Ikindi: string;
  Aksam: string;
  Yatsi: string;
  MiladiTarihKisa: string;
  MiladiTarihKisaIso8601: string | null;
  MiladiTarihUzun: string;
  MiladiTarihUzunIso8601: string | null;
  HicriTarihKisa: string;
  HicriTarihUzun: string;
  GunesDogus: string;
  GunesBatis: string;
  KibleSaati: string;
  GreenwichOrtalamaZamani: number;
  AyinSekliURL: string;
  [key: string]: unknown;
}

export interface DiyanetCountry {
  UlkeID: string;
  UlkeAdi: string;
  UlkeAdiEn: string;
}

export interface DiyanetCity {
  SehirID: string;
  SehirAdi: string;
  SehirAdiEn: string;
}

export interface DiyanetDistrict {
  IlceID: string;
  IlceAdi: string;
  IlceAdiEn: string;
}

interface NormalizedTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
}

export interface DiyanetMonthlyCache {
  districtId: string;
  timestamp: number;
  days: DiyanetRawPrayerDay[];
}

// --- Constants ---

const BASE_URL = 'https://ezanvakti.emushaf.net';
const MONTHLY_CACHE_PREFIX = 'diyanet_monthly_';
const FETCH_TIMEOUT_MS = 10_000;

// --- Helpers ---

/**
 * Maps Diyanet's Turkish field names to the app's internal English field names.
 */
export const mapDiyanetToInternalTimings = (day: DiyanetRawPrayerDay): NormalizedTimings => ({
  Fajr: day.Imsak,
  Sunrise: day.Gunes,
  Dhuhr: day.Ogle,
  Asr: day.Ikindi,
  Maghrib: day.Aksam,
  Isha: day.Yatsi,
  Imsak: day.Imsak,
});

/**
 * Parses Diyanet's date format "dd.MM.yyyy" into a Date object.
 */
const parseDiyanetDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  const parts = dateStr.split('.');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts.map(Number);
  if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) return null;
  return new Date(year, month - 1, day);
};

/**
 * Fetches JSON from a URL with a timeout.
 */
const fetchWithTimeout = async <T>(url: string, timeoutMs = FETCH_TIMEOUT_MS): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Diyanet API error: ${response.status} ${response.statusText}`);
    }
    return await response.json() as T;
  } finally {
    clearTimeout(timeoutId);
  }
};

// --- Cache Helpers ---

const getMonthCacheKey = (districtId: string): string => {
  const now = new Date();
  return `${MONTHLY_CACHE_PREFIX}${districtId}_${now.getFullYear()}_${now.getMonth() + 1}`;
};

const getCachedMonthlyData = (districtId: string): DiyanetMonthlyCache | null => {
  const key = getMonthCacheKey(districtId);
  const cached = storageService.getItem<DiyanetMonthlyCache>(key);
  if (!cached || !Array.isArray(cached.days) || cached.days.length === 0) {
    return null;
  }
  return cached;
};

const setCachedMonthlyData = (districtId: string, days: DiyanetRawPrayerDay[]): void => {
  const key = getMonthCacheKey(districtId);
  const data: DiyanetMonthlyCache = {
    districtId,
    timestamp: Date.now(),
    days,
  };
  storageService.setItem(key, data);
};

// --- Public API ---

/**
 * Fetches all countries from Diyanet API.
 */
export const fetchCountries = async (): Promise<DiyanetCountry[]> => {
  return fetchWithTimeout<DiyanetCountry[]>(`${BASE_URL}/ulkeler`);
};

/**
 * Fetches cities for a given country ID.
 */
export const fetchCities = async (countryId: string): Promise<DiyanetCity[]> => {
  return fetchWithTimeout<DiyanetCity[]>(`${BASE_URL}/sehirler/${countryId}`);
};

/**
 * Fetches districts for a given city ID.
 */
export const fetchDistricts = async (cityId: string): Promise<DiyanetDistrict[]> => {
  return fetchWithTimeout<DiyanetDistrict[]>(`${BASE_URL}/ilceler/${cityId}`);
};

/**
 * Fetches monthly prayer times for a district ID.
 * Uses cache-first strategy: returns cached data if available for current month.
 */
export const fetchMonthlyDiyanetTimes = async (districtId: string): Promise<DiyanetRawPrayerDay[]> => {
  // Check cache first
  const cached = getCachedMonthlyData(districtId);
  if (cached) {
    logger.log(`[DiyanetAPI] Monthly data served from cache for district ${districtId}`);
    return cached.days;
  }

  // Fetch from API
  logger.log(`[DiyanetAPI] Fetching monthly data from API for district ${districtId}`);
  const days = await fetchWithTimeout<DiyanetRawPrayerDay[]>(`${BASE_URL}/vakitler/${districtId}`);

  if (!Array.isArray(days) || days.length === 0) {
    throw new Error(`Diyanet API returned empty data for district ${districtId}`);
  }

  // Validate first entry has expected fields
  const sample = days[0];
  if (!sample.Imsak || !sample.Ogle || !sample.Aksam) {
    throw new Error('Diyanet API response is missing expected prayer time fields');
  }

  // Cache the result
  setCachedMonthlyData(districtId, days);
  logger.log(`[DiyanetAPI] Cached ${days.length} days for district ${districtId}`);

  return days;
};

/**
 * Gets today's prayer times from Diyanet API (from monthly cache).
 * Returns null if no matching day found.
 */
export const getTodayDiyanetTimes = async (districtId: string): Promise<NormalizedTimings | null> => {
  try {
    const monthlyData = await fetchMonthlyDiyanetTimes(districtId);
    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();

    const todayEntry = monthlyData.find((day) => {
      const parsed = parseDiyanetDate(day.MiladiTarihKisa);
      return (
        parsed !== null &&
        parsed.getDate() === todayDay &&
        parsed.getMonth() === todayMonth &&
        parsed.getFullYear() === todayYear
      );
    });

    if (!todayEntry) {
      logger.warn(`[DiyanetAPI] No matching day found for today in monthly data`);
      return null;
    }

    return mapDiyanetToInternalTimings(todayEntry);
  } catch (error) {
    logger.error('[DiyanetAPI] Failed to get today\'s times:', error);
    return null;
  }
};

/**
 * Gets a specific day's prayer times from cached monthly data.
 */
export const getDayDiyanetTimes = async (
  districtId: string,
  targetDate: Date
): Promise<NormalizedTimings | null> => {
  try {
    const monthlyData = await fetchMonthlyDiyanetTimes(districtId);
    const targetDay = targetDate.getDate();
    const targetMonth = targetDate.getMonth();
    const targetYear = targetDate.getFullYear();

    const dayEntry = monthlyData.find((day) => {
      const parsed = parseDiyanetDate(day.MiladiTarihKisa);
      return (
        parsed !== null &&
        parsed.getDate() === targetDay &&
        parsed.getMonth() === targetMonth &&
        parsed.getFullYear() === targetYear
      );
    });

    if (!dayEntry) return null;

    return mapDiyanetToInternalTimings(dayEntry);
  } catch (error) {
    logger.error('[DiyanetAPI] Failed to get day times:', error);
    return null;
  }
};

export default {
  fetchCountries,
  fetchCities,
  fetchDistricts,
  fetchMonthlyDiyanetTimes,
  getTodayDiyanetTimes,
  getDayDiyanetTimes,
  mapDiyanetToInternalTimings,
};

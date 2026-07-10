import { Capacitor } from "@capacitor/core";
import { STORAGE_KEYS } from "../constants";
import PrayerSchedule, {
  type PrayerScheduleResult,
  type SyncPrayerScheduleOptions,
} from "../plugins/PrayerSchedulePlugin";
import { logger } from "../utils/logger";
import secureStorage from "./persistentStorage";
import {
  createSQLiteAdapter,
  type SQLiteEntity,
  type SQLiteListOptions,
  type SQLiteRecordId,
} from "./sqliteAdapter";

const STORAGE_DATABASE = "huzur_storage";
const STORAGE_KEY_VALUE_TABLE = "key_value_store";
const PRAYER_TIMES_CACHE_PREFIX = "prayerTimes_";
const PRAYER_MONTHLY_CACHE_PREFIX = "prayerMonthly_";
const NATIVE_PRAYER_SYNC_DEBOUNCE_MS = 600;

type StoredKeyValue<T = unknown> = SQLiteEntity & {
  value: T;
};

type PrayerTimings = Record<string, string>;

type PrayerPayload = {
  timings?: PrayerTimings;
  [key: string]: unknown;
};

type MonthlyPrayerPayload = {
  timings?: unknown[];
  year?: number;
  month?: number;
  [key: string]: unknown;
};

type MonthlySnapshot = {
  year: number;
  month: number;
  timings: unknown[];
};

type PendingPrayerSync = SyncPrayerScheduleOptions & {
  monthlySnapshots?: MonthlySnapshot[];
};

const storageDatabase = createSQLiteAdapter({
  database: STORAGE_DATABASE,
  tables: [{ name: STORAGE_KEY_VALUE_TABLE }],
});

let pendingPrayerSync: PendingPrayerSync | null = null;
let pendingPrayerSyncTimer: ReturnType<typeof setTimeout> | null = null;
let lastPrayerSyncSignature = "";
let inFlightPrayerSyncSignature = "";
let inFlightPrayerSync: Promise<PrayerScheduleResult> | null = null;

const getPlatform = (): string => {
  try {
    return Capacitor.getPlatform();
  } catch {
    return "web";
  }
};

const isNativePrayerScheduleAvailable = (): boolean => {
  try {
    return Capacitor.getPlatform() !== "web" && Capacitor.isPluginAvailable("PrayerSchedule");
  } catch {
    return false;
  }
};

const parsePrayerCacheCoordinates = (key: string): { latitude: number | null; longitude: number | null } => {
  const match = key.match(/^prayer(?:Times|Monthly)_(-?\d+(?:\.\d+)?)_(-?\d+(?:\.\d+)?).*$/);
  if (!match) {
    return { latitude: null, longitude: null };
  }

  const latitude = Number(match[1]);
  const longitude = Number(match[2]);
  return {
    latitude: Number.isFinite(latitude) ? Number(latitude.toFixed(4)) : null,
    longitude: Number.isFinite(longitude) ? Number(longitude.toFixed(4)) : null,
  };
};

const normalizePrayerTimings = (value: unknown): PrayerTimings | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const payload = value as PrayerPayload;
  const candidate = payload.timings && typeof payload.timings === "object" ? payload.timings : payload;
  const timings = Object.fromEntries(
    Object.entries(candidate).filter(([, time]) => typeof time === "string" && /^\d{2}:\d{2}$/.test(time))
  ) as PrayerTimings;

  return Object.keys(timings).length > 0 ? timings : null;
};

const normalizeMonthlySnapshot = (key: string, value: unknown): MonthlySnapshot | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const payload = value as MonthlyPrayerPayload;
  if (!Array.isArray(payload.timings) || payload.timings.length === 0) {
    return null;
  }

  const keyMatch = key.match(/^prayerMonthly_-?\d+(?:\.\d+)?_-?\d+(?:\.\d+)?_(\d{4})_(\d{1,2})$/);
  const year = Number(payload.year ?? keyMatch?.[1]);
  const month = Number(payload.month ?? keyMatch?.[2]);

  if (!Number.isInteger(year) || !Number.isInteger(month) || year <= 0 || month <= 0) {
    return null;
  }

  return {
    year,
    month,
    timings: payload.timings,
  };
};

const mergeMonthlySnapshots = (
  current: MonthlySnapshot[] = [],
  next: MonthlySnapshot[] = []
): MonthlySnapshot[] => {
  const byMonth = new Map<string, MonthlySnapshot>();
  [...current, ...next].forEach((snapshot) => {
    byMonth.set(`${snapshot.year}-${snapshot.month}`, snapshot);
  });
  return [...byMonth.values()];
};

const buildPrayerSyncSignature = (payload: PendingPrayerSync): string => JSON.stringify({
  timings: payload.timings,
  latitude: payload.latitude ?? null,
  longitude: payload.longitude ?? null,
  locationName: payload.locationName ?? "",
  adhanSound: payload.adhanSound ?? null,
  prayerNotificationsEnabled: payload.prayerNotificationsEnabled ?? null,
  monthlySnapshots: payload.monthlySnapshots ?? [],
});

const hasPrayerTimings = (timings: PrayerTimings | undefined): timings is PrayerTimings =>
  !!timings && Object.keys(timings).length > 0;

const mergePrayerSyncPayload = (base: PendingPrayerSync | null, next: PendingPrayerSync): PendingPrayerSync => ({
  timings: hasPrayerTimings(next.timings) ? next.timings : base?.timings || {},
  latitude: next.latitude ?? base?.latitude ?? null,
  longitude: next.longitude ?? base?.longitude ?? null,
  locationName: next.locationName || base?.locationName || "Huzur",
  adhanSound: next.adhanSound ?? base?.adhanSound ?? null,
  prayerNotificationsEnabled: next.prayerNotificationsEnabled ?? base?.prayerNotificationsEnabled,
  monthlySnapshots: mergeMonthlySnapshots(base?.monthlySnapshots, next.monthlySnapshots),
});

const clearPendingPrayerSyncTimer = (): void => {
  if (pendingPrayerSyncTimer) {
    clearTimeout(pendingPrayerSyncTimer);
    pendingPrayerSyncTimer = null;
  }
};

export const syncPrayerScheduleCacheToNative = async (
  payload: PendingPrayerSync
): Promise<PrayerScheduleResult> => {
  clearPendingPrayerSyncTimer();
  pendingPrayerSync = null;

  if (!payload.timings || Object.keys(payload.timings).length === 0) {
    return { success: false, platform: getPlatform(), error: "Prayer timings are required" };
  }

  if (!isNativePrayerScheduleAvailable()) {
    return { success: false, platform: getPlatform() };
  }

  const signature = buildPrayerSyncSignature(payload);
  if (signature === lastPrayerSyncSignature) {
    return { success: true, platform: getPlatform() };
  }

  if (signature === inFlightPrayerSyncSignature && inFlightPrayerSync) {
    return inFlightPrayerSync;
  }

  inFlightPrayerSyncSignature = signature;
  inFlightPrayerSync = PrayerSchedule.syncPrayerSchedule(payload)
    .then((result) => {
      if (result?.success) {
        lastPrayerSyncSignature = signature;
      }
      return result;
    })
    .finally(() => {
      inFlightPrayerSync = null;
      inFlightPrayerSyncSignature = "";
    });

  return inFlightPrayerSync;
};

const flushQueuedPrayerSync = (): void => {
  const payload = pendingPrayerSync;
  pendingPrayerSync = null;
  pendingPrayerSyncTimer = null;

  if (payload) {
    void syncPrayerScheduleCacheToNative(payload).catch((error) => {
      logger.warn("[StorageService] Native prayer schedule cache sync failed", error);
    });
  }
};

const queuePrayerScheduleCacheSync = (key: string, value: unknown): void => {
  if (!isNativePrayerScheduleAvailable()) {
    return;
  }

  const isDailyPrayerCache = key.startsWith(PRAYER_TIMES_CACHE_PREFIX);
  const isMonthlyPrayerCache = key.startsWith(PRAYER_MONTHLY_CACHE_PREFIX);
  if (!isDailyPrayerCache && !isMonthlyPrayerCache) {
    return;
  }

  const coordinates = parsePrayerCacheCoordinates(key);
  const nextPayload: PendingPrayerSync = {
    timings: {},
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    locationName: "Huzur",
    monthlySnapshots: [],
  };

  if (isDailyPrayerCache) {
    const timings = normalizePrayerTimings(value);
    if (!timings) {
      return;
    }
    nextPayload.timings = timings;
  }

  if (isMonthlyPrayerCache) {
    const snapshot = normalizeMonthlySnapshot(key, value);
    if (!snapshot) {
      return;
    }
    nextPayload.monthlySnapshots = [snapshot];
  }

  pendingPrayerSync = mergePrayerSyncPayload(pendingPrayerSync, nextPayload);
  if (!pendingPrayerSync.timings || Object.keys(pendingPrayerSync.timings).length === 0) {
    return;
  }

  clearPendingPrayerSyncTimer();
  pendingPrayerSyncTimer = setTimeout(flushQueuedPrayerSync, NATIVE_PRAYER_SYNC_DEBOUNCE_MS);
};

export const getItem = <T = unknown>(key: string, defaultValue: T | null = null): T | null => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    logger.error(`[StorageService] Error reading ${key}`, error);
    return defaultValue;
  }
};

export const setItem = (key: string, value: unknown): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    queuePrayerScheduleCacheSync(key, value);
    return true;
  } catch (error) {
    logger.error(`[StorageService] Error writing key ${key}`, error);
    return false;
  }
};

export const removeItem = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    logger.error(`[StorageService] Error removing key ${key}`, error);
    return false;
  }
};

export const getString = (key: string, defaultValue = ""): string => {
  try {
    return localStorage.getItem(key) || defaultValue;
  } catch (error) {
    logger.error(`[StorageService] Error reading string ${key}`, error);
    return defaultValue;
  }
};

export const setString = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    logger.error(`[StorageService] Error writing string key ${key}`, error);
    return false;
  }
};

export const getBoolean = (key: string, defaultValue = false): boolean => {
  const value = getString(key);
  if (value === "") return defaultValue;
  return value === "true";
};

export const setBoolean = (key: string, value: boolean): boolean => {
  return setString(key, value ? "true" : "false");
};

export const getNumber = (key: string, defaultValue = 0): number => {
  const value = getString(key);
  if (value === "") return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

export const setNumber = (key: string, value: number): boolean => {
  return setString(key, String(value));
};

export const clearAll = (): boolean => {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    logger.error("[StorageService] Error clearing storage", error);
    return false;
  }
};

export const hasKey = (key: string): boolean => {
  return localStorage.getItem(key) !== null;
};

export const getItemAsync = async <T = unknown>(key: string, defaultValue: T | null = null): Promise<T | null> => {
  return secureStorage.getItem<T>(key, defaultValue);
};

export const setItemAsync = async (key: string, value: unknown): Promise<boolean> => {
  return secureStorage.setItem(key, value);
};

export const removeItemAsync = async (key: string): Promise<boolean> => {
  return secureStorage.removeItem(key);
};

export const getStringAsync = async (key: string, defaultValue = ""): Promise<string> => {
  return secureStorage.getString(key, defaultValue);
};

export const setStringAsync = async (key: string, value: string): Promise<boolean> => {
  return secureStorage.setString(key, value);
};

export const getBooleanAsync = async (key: string, defaultValue = false): Promise<boolean> => {
  return secureStorage.getBoolean(key, defaultValue);
};

export const setBooleanAsync = async (key: string, value: boolean): Promise<boolean> => {
  return secureStorage.setBoolean(key, value);
};

export const getNumberAsync = async (key: string, defaultValue = 0): Promise<number> => {
  return secureStorage.getNumber(key, defaultValue);
};

export const setNumberAsync = async (key: string, value: number): Promise<boolean> => {
  return secureStorage.setNumber(key, value);
};

export const clearAllAsync = async (): Promise<boolean> => {
  return secureStorage.clearAll();
};

export const hasKeyAsync = async (key: string): Promise<boolean> => {
  return secureStorage.hasKey(key);
};

export const setPersistentItem = async <T = unknown>(key: string, value: T): Promise<boolean> => {
  try {
    await storageDatabase.upsert<StoredKeyValue<T>>(STORAGE_KEY_VALUE_TABLE, {
      id: key,
      value,
    });
    return true;
  } catch (error) {
    logger.error(`[StorageService] Error writing persistent key ${key}`, error);
    return false;
  }
};

export const getPersistentItem = async <T = unknown>(key: string, defaultValue: T | null = null): Promise<T | null> => {
  try {
    const record = await storageDatabase.getById<StoredKeyValue<T>>(STORAGE_KEY_VALUE_TABLE, key);
    return record ? record.value : defaultValue;
  } catch (error) {
    logger.error(`[StorageService] Error reading persistent key ${key}`, error);
    return defaultValue;
  }
};

export const removePersistentItem = async (key: string): Promise<boolean> => {
  try {
    return await storageDatabase.delete(STORAGE_KEY_VALUE_TABLE, key);
  } catch (error) {
    logger.error(`[StorageService] Error removing persistent key ${key}`, error);
    return false;
  }
};

export const clearPersistentItems = async (): Promise<boolean> => {
  try {
    await storageDatabase.clearTable(STORAGE_KEY_VALUE_TABLE);
    return true;
  } catch (error) {
    logger.error("[StorageService] Error clearing persistent storage", error);
    return false;
  }
};

export const hasPersistentKey = async (key: string): Promise<boolean> => {
  try {
    return (await storageDatabase.getById(STORAGE_KEY_VALUE_TABLE, key)) !== null;
  } catch (error) {
    logger.error(`[StorageService] Error checking persistent key ${key}`, error);
    return false;
  }
};

export const upsertRecord = async <T extends SQLiteEntity>(table: string, record: T): Promise<T | null> => {
  try {
    return await storageDatabase.upsert<T>(table, record);
  } catch (error) {
    logger.error(`[StorageService] Error upserting ${table}`, error);
    return null;
  }
};

export const getRecord = async <T extends SQLiteEntity>(
  table: string,
  id: SQLiteRecordId,
  defaultValue: T | null = null
): Promise<T | null> => {
  try {
    return (await storageDatabase.getById<T>(table, id)) ?? defaultValue;
  } catch (error) {
    logger.error(`[StorageService] Error reading ${table}`, error);
    return defaultValue;
  }
};

export const getRecords = async <T extends SQLiteEntity>(
  table: string,
  options: SQLiteListOptions = {}
): Promise<T[]> => {
  try {
    return await storageDatabase.getAll<T>(table, options);
  } catch (error) {
    logger.error(`[StorageService] Error listing ${table}`, error);
    return [];
  }
};

export const deleteRecord = async (table: string, id: SQLiteRecordId): Promise<boolean> => {
  try {
    return await storageDatabase.delete(table, id);
  } catch (error) {
    logger.error(`[StorageService] Error deleting ${table}`, error);
    return false;
  }
};

export const clearRecords = async (table: string): Promise<boolean> => {
  try {
    await storageDatabase.clearTable(table);
    return true;
  } catch (error) {
    logger.error(`[StorageService] Error clearing ${table}`, error);
    return false;
  }
};

export const storageService = {
  getItem,
  setItem,
  removeItem,
  getString,
  setString,
  getBoolean,
  setBoolean,
  getNumber,
  setNumber,
  clearAll,
  hasKey,
  getItemAsync,
  setItemAsync,
  removeItemAsync,
  getStringAsync,
  setStringAsync,
  getBooleanAsync,
  setBooleanAsync,
  getNumberAsync,
  setNumberAsync,
  clearAllAsync,
  hasKeyAsync,
  setPersistentItem,
  getPersistentItem,
  removePersistentItem,
  clearPersistentItems,
  hasPersistentKey,
  upsertRecord,
  getRecord,
  getRecords,
  deleteRecord,
  clearRecords,
};

export default storageService;

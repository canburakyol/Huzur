/**
 * Storage Service
 * Centralized localStorage management with error handling
 * Prepared for future migration to Capacitor Preferences
 * 
 * Benefits:
 * - Centralized error handling
 * - Type-safe JSON parsing
 * - Easy migration path to async storage
 * - Consistent API across the app
 */

import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';

/**
 * Get item from storage with JSON parsing and error handling
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist or parsing fails
 * @returns {*} Parsed value or default
 */
export const getItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch {
    logger.warn(`[StorageService] Error reading ${key}`);
    return defaultValue;
  }
};

/**
 * Set item in storage with JSON stringification
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {boolean} Success status
 */
export const setItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    logger.warn('[StorageService] Error writing key');
    return false;
  }
};

/**
 * Remove item from storage
 * @param {string} key - Storage key
 * @returns {boolean} Success status
 */
export const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    logger.warn('[StorageService] Error removing key');
    return false;
  }
};

/**
 * Get raw string value (no JSON parsing)
 * @param {string} key - Storage key
 * @param {string} defaultValue - Default value
 * @returns {string} Value or default
 */
export const getString = (key, defaultValue = '') => {
  try {
    return localStorage.getItem(key) || defaultValue;
  } catch {
    logger.warn(`[StorageService] Error reading string ${key}`);
    return defaultValue;
  }
};

/**
 * Set raw string value (no JSON stringification)
 * @param {string} key - Storage key
 * @param {string} value - Value to store
 * @returns {boolean} Success status
 */
export const setString = (key, value) => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    logger.warn('[StorageService] Error writing string key');
    return false;
  }
};

/**
 * Get boolean value from storage
 * @param {string} key - Storage key
 * @param {boolean} defaultValue - Default value
 * @returns {boolean} Boolean value
 */
export const getBoolean = (key, defaultValue = false) => {
  const value = getString(key);
  if (value === '') return defaultValue;
  return value === 'true';
};

/**
 * Set boolean value in storage
 * @param {string} key - Storage key  
 * @param {boolean} value - Boolean value
 * @returns {boolean} Success status
 */
export const setBoolean = (key, value) => {
  return setString(key, value ? 'true' : 'false');
};

/**
 * Get number value from storage
 * @param {string} key - Storage key
 * @param {number} defaultValue - Default value
 * @returns {number} Number value
 */
export const getNumber = (key, defaultValue = 0) => {
  const value = getString(key);
  if (value === '') return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Set number value in storage
 * @param {string} key - Storage key
 * @param {number} value - Number value
 * @returns {boolean} Success status
 */
export const setNumber = (key, value) => {
  return setString(key, String(value));
};

/**
 * Clear all app-related storage (use with caution)
 * @returns {boolean} Success status
 */
export const clearAll = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch {
    logger.warn('[StorageService] Error clearing storage');
    return false;
  }
};

/**
 * Check if a key exists in storage
 * @param {string} key - Storage key
 * @returns {boolean} Whether key exists
 */
export const hasKey = (key) => {
  return localStorage.getItem(key) !== null;
};

import secureStorage from './secureStorage';

// ... (existing sync methods remain unchanged)

// ============================================================
// ASYNC METHODS (Capacitor Preferences / Secure Storage)
// ============================================================

export const getItemAsync = async (key, defaultValue = null) => {
  return await secureStorage.getItem(key, defaultValue);
};

export const setItemAsync = async (key, value) => {
  return await secureStorage.setItem(key, value);
};

export const removeItemAsync = async (key) => {
  return await secureStorage.removeItem(key);
};

export const getStringAsync = async (key, defaultValue = '') => {
  return await secureStorage.getString(key, defaultValue);
};

export const setStringAsync = async (key, value) => {
  return await secureStorage.setString(key, value);
};

export const getBooleanAsync = async (key, defaultValue = false) => {
  return await secureStorage.getBoolean(key, defaultValue);
};

export const setBooleanAsync = async (key, value) => {
  return await secureStorage.setBoolean(key, value);
};

export const getNumberAsync = async (key, defaultValue = 0) => {
  return await secureStorage.getNumber(key, defaultValue);
};

export const setNumberAsync = async (key, value) => {
  return await secureStorage.setNumber(key, value);
};

export const clearAllAsync = async () => {
  return await secureStorage.clearAll();
};

export const hasKeyAsync = async (key) => {
  return await secureStorage.hasKey(key);
};

export const storageService = {
  // Sync (Legacy - localStorage)
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

  // Async (Secure - Capacitor Preferences)
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
  hasKeyAsync
};

export default storageService;

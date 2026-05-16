import { Preferences } from '@capacitor/preferences';
import { logger } from '../utils/logger';

/**
 * Persistent cache service backed by Capacitor Preferences.
 * 
 * ⚠️ DEPRECATED NAMING: This file is named "secureStorage" for historical
 * reasons but it does NOT provide encryption or real security. It uses
 * Capacitor Preferences which stores data in plain text.
 * 
 * For true encrypted storage, use @capacitor-community/secure-storage-plugin.
 * 
 * The integrity checksum stored with Pro status is ONLY for detecting
 * accidental cache corruption (e.g., partial writes, JSON parse errors).
 * It is NOT a security measure. Real Pro verification happens server-side
 * via the checkProStatus Firebase Function.
 */

const SECURE_STORAGE_KEYS = {
  PRO_STATUS: 'huzur_pro_status_secure',
  AUTH_TOKEN: 'huzur_auth_token',
  USER_ID: 'huzur_user_id'
};

/**
 * Generate a simple checksum for detecting accidental cache corruption.
 * This is NOT cryptographic security — it only detects partial writes
 * or accidental data modification. Real Pro verification is server-side.
 */
const _generateCorruptionChecksum = (state) => {
  const payload = [
    state.active === true,
    state.expiresAt || '',
    state.source || state.verifiedBy || '',
    state.verifiedAt || '',
    state.lastCheckAt || '',
    state.verificationState || ''
  ].join('|');

  // Simple FNV-1a hash for corruption detection (not security)
  let hash = 0x811c9dc5;
  for (let i = 0; i < payload.length; i++) {
    hash ^= payload.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16);
};

export const secureStorage = {
  async setString(key, value) {
    try {
      await Preferences.set({ key, value });
      return true;
    } catch (error) {
      logger.error('[SecureStorage] setString error', error);
      return false;
    }
  },

  async getString(key, defaultValue = null) {
    try {
      const { value } = await Preferences.get({ key });
      return value !== null ? value : defaultValue;
    } catch (error) {
      logger.error('[SecureStorage] getString error', error);
      return defaultValue;
    }
  },

  async setItem(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      await Preferences.set({ key, value: jsonValue });
      return true;
    } catch (error) {
      logger.error('[SecureStorage] setItem error', error);
      return false;
    }
  },

  async getItem(key, defaultValue = null) {
    try {
      const { value } = await Preferences.get({ key });
      if (value === null) return defaultValue;
      return JSON.parse(value);
    } catch (error) {
      logger.error('[SecureStorage] getItem error', error);
      return defaultValue;
    }
  },

  async setBoolean(key, value) {
    return this.setString(key, value ? 'true' : 'false');
  },

  async getBoolean(key, defaultValue = false) {
    const value = await this.getString(key);
    if (value === null) return defaultValue;
    return value === 'true';
  },

  async setNumber(key, value) {
    return this.setString(key, value.toString());
  },

  async getNumber(key, defaultValue = 0) {
    const value = await this.getString(key);
    if (value === null) return defaultValue;
    const num = parseFloat(value);
    return Number.isNaN(num) ? defaultValue : num;
  },

  async removeItem(key) {
    try {
      await Preferences.remove({ key });
      return true;
    } catch (error) {
      logger.error('[SecureStorage] removeItem error', error);
      return false;
    }
  },

  async clearAll() {
    try {
      await Preferences.clear();
      return true;
    } catch (error) {
      logger.error('[SecureStorage] clearAll error', error);
      return false;
    }
  },

  async hasKey(key) {
    try {
      const { value } = await Preferences.get({ key });
      return value !== null;
    } catch (error) {
      logger.error('[SecureStorage] hasKey error', error);
      return false;
    }
  },

  async keys() {
    try {
      const { keys } = await Preferences.keys();
      return keys;
    } catch (error) {
      logger.error('[SecureStorage] keys error', error);
      return [];
    }
  },

  async setProStatus(activeOrState, expiresAt = null, source = 'revenuecat') {
    try {
      const state = typeof activeOrState === 'object' && activeOrState !== null
        ? activeOrState
        : {
            active: activeOrState,
            expiresAt,
            source
          };

      const status = {
        active: state.active === true,
        expiresAt: state.expiresAt || null,
        source: state.source || state.verifiedBy || source,
        verifiedBy: state.source || state.verifiedBy || source,
        verifiedAt: state.verifiedAt || null,
        lastCheckAt: state.lastCheckAt || null,
        verificationState: state.verificationState || (state.active ? 'verified' : 'inactive'),
        updatedAt: new Date().toISOString()
      };

      // Corruption checksum only (NOT security — real verification is server-side)
      status._checksum = _generateCorruptionChecksum(status);
      await this.setItem(SECURE_STORAGE_KEYS.PRO_STATUS, status);
      return true;
    } catch (error) {
      logger.error('[SecureStorage] setProStatus error', error);
      return false;
    }
  },

  async getProStatus() {
    try {
      const status = await this.getItem(SECURE_STORAGE_KEYS.PRO_STATUS);
      if (!status) return null;

      if (status.expiresAt && new Date(status.expiresAt) < new Date()) {
        await this.removeItem(SECURE_STORAGE_KEYS.PRO_STATUS);
        return {
          active: false,
          expiresAt: status.expiresAt,
          source: status.source || status.verifiedBy,
          verifiedBy: status.verifiedBy,
          verifiedAt: status.verifiedAt || status.updatedAt || null,
          lastCheckAt: status.lastCheckAt || status.updatedAt || null,
          verificationState: 'expired',
          isValid: true
        };
      }

      // Check corruption checksum (NOT security — just detects accidental corruption)
      const expectedChecksum = _generateCorruptionChecksum(status);
      const isValid = status._checksum === expectedChecksum || status._integrity === expectedChecksum;

      return {
        active: status.active === true,
        expiresAt: status.expiresAt || null,
        source: status.source || status.verifiedBy,
        verifiedBy: status.verifiedBy,
        verifiedAt: status.verifiedAt || status.updatedAt || null,
        lastCheckAt: status.lastCheckAt || status.updatedAt || null,
        verificationState: status.verificationState || (status.active ? 'verified' : 'inactive'),
        isValid
      };
    } catch (error) {
      logger.error('[SecureStorage] getProStatus error', error);
      return null;
    }
  },

  async clearProStatus() {
    return await this.removeItem(SECURE_STORAGE_KEYS.PRO_STATUS);
  }
};

export { SECURE_STORAGE_KEYS };

export default secureStorage;

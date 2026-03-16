import { Preferences } from '@capacitor/preferences';
import { logger } from '../utils/logger';

/**
 * Persistent cache service backed by Capacitor Preferences.
 * This is useful for consistent native/web persistence, but it is not a
 * dedicated encrypted vault and should be treated as app cache, not as a
 * standalone security boundary.
 */

const SECURE_STORAGE_KEYS = {
  PRO_STATUS: 'huzur_pro_status_secure',
  AUTH_TOKEN: 'huzur_auth_token',
  USER_ID: 'huzur_user_id'
};

export const secureStorage = {
  async setString(key, value) {
    try {
      await Preferences.set({ key, value });
      return true;
    } catch {
      logger.error('[SecureStorage] setString error');
      return false;
    }
  },

  async getString(key, defaultValue = null) {
    try {
      const { value } = await Preferences.get({ key });
      return value !== null ? value : defaultValue;
    } catch {
      logger.error('[SecureStorage] getString error');
      return defaultValue;
    }
  },

  async setItem(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      await Preferences.set({ key, value: jsonValue });
      return true;
    } catch {
      logger.error('[SecureStorage] setItem error');
      return false;
    }
  },

  async getItem(key, defaultValue = null) {
    try {
      const { value } = await Preferences.get({ key });
      if (value === null) return defaultValue;
      return JSON.parse(value);
    } catch {
      logger.error('[SecureStorage] getItem error');
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
    } catch {
      logger.error('[SecureStorage] removeItem error');
      return false;
    }
  },

  async clearAll() {
    try {
      await Preferences.clear();
      return true;
    } catch {
      logger.error('[SecureStorage] clearAll error');
      return false;
    }
  },

  async hasKey(key) {
    try {
      const { value } = await Preferences.get({ key });
      return value !== null;
    } catch {
      return false;
    }
  },

  async keys() {
    try {
      const { keys } = await Preferences.keys();
      return keys;
    } catch {
      logger.error('[SecureStorage] keys error');
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

      status._integrity = await this._generateIntegrityHash(status);
      await this.setItem(SECURE_STORAGE_KEYS.PRO_STATUS, status);
      return true;
    } catch {
      logger.error('[SecureStorage] setProStatus error');
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

      const expectedHash = await this._generateIntegrityHash(status);
      const isValid = status._integrity === expectedHash;

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
    } catch {
      logger.error('[SecureStorage] getProStatus error');
      return null;
    }
  },

  async clearProStatus() {
    return await this.removeItem(SECURE_STORAGE_KEYS.PRO_STATUS);
  },

  async _generateIntegrityHash(stateOrActive, expiresAt, source) {
    const state = typeof stateOrActive === 'object' && stateOrActive !== null
      ? stateOrActive
      : {
          active: stateOrActive,
          expiresAt,
          source
        };

    const salt = [72, 122, 114, 80, 114, 111, 73, 110, 116, 71, 114, 100]
      .map((code) => String.fromCharCode(code))
      .join('');

    const payload = [
      state.active === true,
      state.expiresAt || '',
      state.source || state.verifiedBy || '',
      state.verifiedAt || '',
      state.lastCheckAt || '',
      state.verificationState || '',
      salt
    ].join('|');

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(payload);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
    } catch {
      let hash = 0x811c9dc5;
      for (let index = 0; index < payload.length; index += 1) {
        hash ^= payload.charCodeAt(index);
        hash = Math.imul(hash, 0x01000193);
      }
      return (hash >>> 0).toString(16);
    }
  }
};

export { SECURE_STORAGE_KEYS };

export default secureStorage;

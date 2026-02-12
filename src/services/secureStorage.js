import { Preferences } from '@capacitor/preferences';
import { logger } from '../utils/logger';

/**
 * Secure Storage Service
 * Capacitor Preferences API kullanır (localStorage yerine)
 * - Android: EncryptedSharedPreferences
 * - iOS: Keychain
 * - Web: localStorage (fallback)
 * 
 * SECURITY: Use for sensitive data like Pro status, auth tokens
 */

// Storage keys for sensitive data
const SECURE_STORAGE_KEYS = {
  PRO_STATUS: 'huzur_pro_status_secure',
  AUTH_TOKEN: 'huzur_auth_token',
  USER_ID: 'huzur_user_id'
};

export const secureStorage = {
  /**
   * String değer kaydet
   */
  async setString(key, value) {
    try {
      await Preferences.set({ key, value });
      return true;
    } catch {
      logger.error('[SecureStorage] setString error');
      return false;
    }
  },

  /**
   * String değer oku
   */
  async getString(key, defaultValue = null) {
    try {
      const { value } = await Preferences.get({ key });
      return value !== null ? value : defaultValue;
    } catch {
      logger.error('[SecureStorage] getString error');
      return defaultValue;
    }
  },

  /**
   * Object/Array kaydet (JSON)
   */
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

  /**
   * Object/Array oku (JSON)
   */
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

  /**
   * Boolean kaydet
   */
  async setBoolean(key, value) {
    return this.setString(key, value ? 'true' : 'false');
  },

  /**
   * Boolean oku
   */
  async getBoolean(key, defaultValue = false) {
    const value = await this.getString(key);
    if (value === null) return defaultValue;
    return value === 'true';
  },

  /**
   * Number kaydet
   */
  async setNumber(key, value) {
    return this.setString(key, value.toString());
  },

  /**
   * Number oku
   */
  async getNumber(key, defaultValue = 0) {
    const value = await this.getString(key);
    if (value === null) return defaultValue;
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
  },

  /**
   * Değer sil
   */
  async removeItem(key) {
    try {
      await Preferences.remove({ key });
      return true;
    } catch {
      logger.error('[SecureStorage] removeItem error');
      return false;
    }
  },

  /**
   * Tüm değerleri sil
   */
  async clearAll() {
    try {
      await Preferences.clear();
      return true;
    } catch {
      logger.error('[SecureStorage] clearAll error');
      return false;
    }
  },

  /**
   * Key var mı kontrol et
   */
  async hasKey(key) {
    try {
      const { value } = await Preferences.get({ key });
      return value !== null;
    } catch {
      return false;
    }
  },

  /**
   * Tüm key'leri listele
   */
  async keys() {
    try {
      const { keys } = await Preferences.keys();
      return keys;
    } catch {
      logger.error('[SecureStorage] keys error');
      return [];
    }
  },

  // ============================================================
  // PRO STATUS SPECIFIC METHODS (Enhanced Security)
  // ============================================================

  /**
   * Pro status kaydet (güvenli)
   * @param {boolean} active - Pro aktif mi
   * @param {string|null} expiresAt - ISO tarih veya null
   * @param {string|null} verifiedBy - Doğrulama kaynağı (revenuecat, manual)
   */
  async setProStatus(active, expiresAt = null, verifiedBy = 'revenuecat') {
    try {
      const integrity = await this._generateIntegrityHash(active, expiresAt, verifiedBy);
      const status = {
        active,
        expiresAt,
        verifiedBy,
        updatedAt: new Date().toISOString(),
        _integrity: integrity
      };
      await this.setItem(SECURE_STORAGE_KEYS.PRO_STATUS, status);
      return true;
    } catch {
      logger.error('[SecureStorage] setProStatus error');
      return false;
    }
  },

  /**
   * Pro status oku (güvenli)
   * @returns {{active: boolean, expiresAt: string|null, isValid: boolean}|null}
   */
  async getProStatus() {
    try {
      const status = await this.getItem(SECURE_STORAGE_KEYS.PRO_STATUS);
      if (!status) return null;

      // Expiry kontrolü
      if (status.expiresAt && new Date(status.expiresAt) < new Date()) {
        await this.removeItem(SECURE_STORAGE_KEYS.PRO_STATUS);
        return { active: false, expiresAt: null, isValid: false };
      }

      // Integrity check (SHA-256)
      const expectedHash = await this._generateIntegrityHash(
        status.active, 
        status.expiresAt, 
        status.verifiedBy
      );
      const isValid = status._integrity === expectedHash;

      return {
        active: status.active === true && isValid,
        expiresAt: status.expiresAt,
        verifiedBy: status.verifiedBy,
        isValid
      };
    } catch {
      logger.error('[SecureStorage] getProStatus error');
      return null;
    }
  },

  /**
   * Pro status sil
   */
  async clearProStatus() {
    return await this.removeItem(SECURE_STORAGE_KEYS.PRO_STATUS);
  },

  /**
   * SHA-256 based integrity hash (tamper detection)
   * Note: Client-side security layer; full security requires server-side validation via RevenueCat
   */
  async _generateIntegrityHash(active, expiresAt, verifiedBy) {
    // Salt is NOT from VITE_ env (those get bundled into JS). 
    // This constant is obfuscated by Terser in production builds.
    const _s = [72, 122, 114, 80, 114, 111, 73, 110, 116, 71, 114, 100].map(c => String.fromCharCode(c)).join('');
    const payload = `${active}|${expiresAt}|${verifiedBy}|${_s}`;

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(payload);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback for environments without SubtleCrypto (very old WebViews)
      let hash = 0x811c9dc5;
      for (let i = 0; i < payload.length; i++) {
        hash ^= payload.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
      }
      return (hash >>> 0).toString(16);
    }
  }
};

// Export keys for external use
export { SECURE_STORAGE_KEYS };

export default secureStorage;

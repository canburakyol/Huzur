import { Preferences } from '@capacitor/preferences';

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
    } catch (error) {
      console.error(`[SecureStorage] setString error for key ${key}:`, error);
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
    } catch (error) {
      console.error(`[SecureStorage] getString error for key ${key}:`, error);
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
    } catch (error) {
      console.error(`[SecureStorage] setItem error for key ${key}:`, error);
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
    } catch (error) {
      console.error(`[SecureStorage] getItem error for key ${key}:`, error);
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
    } catch (error) {
      console.error(`[SecureStorage] removeItem error for key ${key}:`, error);
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
    } catch (error) {
      console.error('[SecureStorage] clearAll error:', error);
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
    } catch (error) {
      console.error('[SecureStorage] keys error:', error);
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
      const status = {
        active,
        expiresAt,
        verifiedBy,
        updatedAt: new Date().toISOString(),
        // Integrity check için hash (basit)
        _integrity: this._generateIntegrityHash(active, expiresAt, verifiedBy)
      };
      await this.setItem(SECURE_STORAGE_KEYS.PRO_STATUS, status);
      return true;
    } catch (error) {
      console.error('[SecureStorage] setProStatus error:', error);
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

      // Integrity check
      const expectedHash = this._generateIntegrityHash(
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
    } catch (error) {
      console.error('[SecureStorage] getProStatus error:', error);
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
   * Basit integrity hash (temper detection)
   * Not: Bu client-side güvenlik, tam güvenlik için server-side validation gerekir
   */
  _generateIntegrityHash(active, expiresAt, verifiedBy) {
    // Basit string concatenation hash
    const str = `${active}-${expiresAt}-${verifiedBy}-${import.meta.env.VITE_APP_SECRET || 'huzur-default'}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }
};

// Export keys for external use
export { SECURE_STORAGE_KEYS };

export default secureStorage;

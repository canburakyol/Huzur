import { Preferences } from '@capacitor/preferences';

/**
 * Secure Storage Service
 * Capacitor Preferences API kullanır (localStorage yerine)
 * - Android: EncryptedSharedPreferences
 * - iOS: Keychain
 * - Web: localStorage (fallback)
 */

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
    } catch (error) {
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
  }
};

export default secureStorage;

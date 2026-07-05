import { Capacitor } from "@capacitor/core";
import { SecureStorage } from "@aparajita/capacitor-secure-storage";
import { Preferences } from "@capacitor/preferences";
import { logger } from "../utils/logger";

export const SECURE_STORAGE_KEYS = {
  PRO_STATUS: "huzur_pro_status_secure",
  AUTH_TOKEN: "huzur_auth_token",
  USER_ID: "huzur_user_id",
} as const;

interface ProStatusState {
  active: boolean;
  expiresAt: string | null;
  source?: string;
  verifiedBy?: string;
  verifiedAt?: string | null;
  lastCheckAt?: string | null;
  verificationState?: string;
  updatedAt?: string;
  _checksum?: string;
  _integrity?: string;
}

const KNOWN_SECURE_KEYS = [
  ...Object.values(SECURE_STORAGE_KEYS),
  "huzur_daily_limits",
] as const;

const isNativePlatform = (): boolean => {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

const getSecureStorageString = async (key: string): Promise<string | null> => {
  if (!isNativePlatform()) {
    return getLegacyPreference(key);
  }

  try {
    return await SecureStorage.getItem(key);
  } catch {
    return null;
  }
};

const setSecureStorageString = async (key: string, value: string): Promise<void> => {
  if (!isNativePlatform()) {
    await Preferences.set({ key, value });
    return;
  }

  await SecureStorage.setItem(key, value);
};

const removeSecureStorageString = async (key: string): Promise<void> => {
  if (!isNativePlatform()) {
    await Preferences.remove({ key });
    return;
  }

  try {
    await SecureStorage.removeItem(key);
  } catch {
    // Best-effort cleanup.
  }
};

const listSecureStorageKeys = async (): Promise<string[]> => {
  if (!isNativePlatform()) {
    return listLegacyPreferenceKeys();
  }

  try {
    return await SecureStorage.keys();
  } catch {
    return [];
  }
};

const getLegacyPreference = async (key: string): Promise<string | null> => {
  const { value } = await Preferences.get({ key });
  return value;
};

const listLegacyPreferenceKeys = async (): Promise<string[]> => {
  try {
    const { keys } = await Preferences.keys();
    return keys;
  } catch {
    return [];
  }
};

const migrateLegacyValue = async (
  key: string,
  legacyValue: string,
  cleanup: () => Promise<void>
): Promise<void> => {
  await setSecureStorageString(key, legacyValue);
  const migratedValue = await getSecureStorageString(key);
  if (migratedValue !== legacyValue) {
    throw new Error(`Secure migration verification failed for ${key}`);
  }

  await cleanup();
};

const migrateLegacyStorageKey = async (key: string): Promise<void> => {
  const secureValue = await getSecureStorageString(key);
  if (secureValue !== null) {
    return;
  }

  const legacyValue = await getLegacyPreference(key);
  if (typeof legacyValue !== "string") {
    return;
  }

  await migrateLegacyValue(key, legacyValue, () => Preferences.remove({ key }));
};

const setStoredString = async (key: string, value: string): Promise<void> => {
  await migrateLegacyStorageKey(key);
  await setSecureStorageString(key, value);
  if (isNativePlatform()) {
    await Preferences.remove({ key });
  }
};

const getStoredString = async (key: string): Promise<string | null> => {
  await migrateLegacyStorageKey(key);
  if (!isNativePlatform()) {
    return getLegacyPreference(key);
  }
  return getSecureStorageString(key);
};

const removeStoredString = async (key: string): Promise<void> => {
  await removeSecureStorageString(key);
  await Preferences.remove({ key });
};

const listStoredKeys = async (): Promise<string[]> => {
  return listSecureStorageKeys();
};

const _generateCorruptionChecksum = async (state: ProStatusState): Promise<string> => {
  const payload = [
    state.active === true,
    state.expiresAt || "",
    state.source || state.verifiedBy || "",
    state.verifiedAt || "",
    state.lastCheckAt || "",
    state.verificationState || "",
  ].join("|");

  try {
    const encoder = new TextEncoder();
    // Device-derived key: not stored alongside the data, harder to tamper offline.
    const keyMaterial = encoder.encode(`huzur_integrity_${navigator.userAgent.length}`);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyMaterial,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(payload));
    return Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    // Fallback for environments without SubtleCrypto (very rare on modern Android WebView)
    let hash = 0x811c9dc5;
    for (let i = 0; i < payload.length; i++) {
      hash ^= payload.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16);
  }
};

export const secureStorage = {
  async setString(key: string, value: string): Promise<boolean> {
    try {
      await setStoredString(key, value);
      return true;
    } catch (error) {
      logger.error("[SecureStorage] setString error", error);
      return false;
    }
  },

  async getString(key: string, defaultValue: string | null = null): Promise<string | null> {
    try {
      const value = await getStoredString(key);
      return value !== null ? value : defaultValue;
    } catch (error) {
      logger.error("[SecureStorage] getString error", error);
      return defaultValue;
    }
  },

  async setItem<T>(key: string, value: T): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(value);
      await setStoredString(key, jsonValue);
      return true;
    } catch (error) {
      logger.error("[SecureStorage] setItem error", error);
      return false;
    }
  },

  async getItem<T>(key: string, defaultValue: T | null = null): Promise<T | null> {
    try {
      const value = await getStoredString(key);
      if (value === null) return defaultValue;
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error("[SecureStorage] getItem error", error);
      return defaultValue;
    }
  },

  async setBoolean(key: string, value: boolean): Promise<boolean> {
    return this.setString(key, value ? "true" : "false");
  },

  async getBoolean(key: string, defaultValue = false): Promise<boolean> {
    const value = await this.getString(key);
    if (value === null) return defaultValue;
    return value === "true";
  },

  async setNumber(key: string, value: number): Promise<boolean> {
    return this.setString(key, value.toString());
  },

  async getNumber(key: string, defaultValue = 0): Promise<number> {
    const value = await this.getString(key);
    if (value === null) return defaultValue;
    const num = parseFloat(value);
    return Number.isNaN(num) ? defaultValue : num;
  },

  async removeItem(key: string): Promise<boolean> {
    try {
      await removeStoredString(key);
      return true;
    } catch (error) {
      logger.error("[SecureStorage] removeItem error", error);
      return false;
    }
  },

  async clearAll(): Promise<boolean> {
    try {
      const [keys, legacySecureKeys, legacyPreferenceKeys] = await Promise.all([
        listStoredKeys(),
        listSecureStorageKeys(),
        listLegacyPreferenceKeys(),
      ]);
      const secureKeys = new Set<string>([
        ...KNOWN_SECURE_KEYS,
        ...keys.filter((key) => key.startsWith("huzur_")),
        ...legacySecureKeys.filter((key) => key.startsWith("huzur_")),
        ...legacyPreferenceKeys.filter((key) => key.startsWith("huzur_")),
      ]);
      await Promise.all([...secureKeys].map((key) => removeStoredString(key)));
      return true;
    } catch (error) {
      logger.error("[SecureStorage] clearAll error", error);
      return false;
    }
  },

  async hasKey(key: string): Promise<boolean> {
    try {
      const value = await getStoredString(key);
      return value !== null;
    } catch (error) {
      logger.error("[SecureStorage] hasKey error", error);
      return false;
    }
  },

  async keys(): Promise<string[]> {
    try {
      return listStoredKeys();
    } catch (error) {
      logger.error("[SecureStorage] keys error", error);
      return [];
    }
  },

  async setProStatus(
    activeOrState: boolean | ProStatusState,
    expiresAt: string | null = null,
    source = "revenuecat"
  ): Promise<boolean> {
    try {
      const state =
        typeof activeOrState === "object" && activeOrState !== null
          ? activeOrState
          : {
              active: activeOrState,
              expiresAt,
              source,
            };

      const status: ProStatusState = {
        active: state.active === true,
        expiresAt: state.expiresAt || null,
        source: state.source || state.verifiedBy || source,
        verifiedBy: state.source || state.verifiedBy || source,
        verifiedAt: state.verifiedAt || null,
        lastCheckAt: state.lastCheckAt || null,
        verificationState: state.verificationState || (state.active ? "verified" : "inactive"),
        updatedAt: new Date().toISOString(),
      };

      status._checksum = await _generateCorruptionChecksum(status);
      await this.setItem(SECURE_STORAGE_KEYS.PRO_STATUS, status);
      return true;
    } catch (error) {
      logger.error("[SecureStorage] setProStatus error", error);
      return false;
    }
  },

  async getProStatus(): Promise<{
    active: boolean;
    expiresAt: string | null;
    source: string | undefined;
    verifiedBy: string | undefined;
    verifiedAt: string | null;
    lastCheckAt: string | null;
    verificationState: string;
    isValid: boolean;
  } | null> {
    try {
      const status = await this.getItem<ProStatusState>(SECURE_STORAGE_KEYS.PRO_STATUS);
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
          verificationState: "expired",
          isValid: true,
        };
      }

      const expectedChecksum = await _generateCorruptionChecksum(status);
      const isValid = status._checksum === expectedChecksum || status._integrity === expectedChecksum;

      return {
        active: status.active === true,
        expiresAt: status.expiresAt || null,
        source: status.source || status.verifiedBy,
        verifiedBy: status.verifiedBy,
        verifiedAt: status.verifiedAt || status.updatedAt || null,
        lastCheckAt: status.lastCheckAt || status.updatedAt || null,
        verificationState: status.verificationState || (status.active ? "verified" : "inactive"),
        isValid,
      };
    } catch (error) {
      logger.error("[SecureStorage] getProStatus error", error);
      return null;
    }
  },

  async clearProStatus(): Promise<boolean> {
    return await this.removeItem(SECURE_STORAGE_KEYS.PRO_STATUS);
  },
};

export default secureStorage;

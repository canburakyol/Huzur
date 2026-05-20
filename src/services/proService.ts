import { storageService } from "./storageService";
import { secureStorage } from "./persistentStorage";
import { STORAGE_KEYS } from "../constants";
import { logger } from "../utils/logger";
import crashlyticsReporter from "../utils/crashlyticsReporter";
import { useAppStore } from "../stores/useAppStore";

interface FreeLimits {
  nuzul_ai: number;
  tajweed_ai: number;
  word_analysis: number;
  word_by_word: number;
  memorize_surahs: number;
  hatim_count: number;
  amel_history_days: number;
  themes: number;
}

interface ProState {
  active: boolean;
  expiresAt: string | null;
  verifiedAt: string | null;
  lastCheckAt: string | null;
  source: string;
  verificationState: string;
}

interface LimitCheck {
  allowed: boolean;
  remaining: number;
  max: number;
  isPro: boolean;
}

interface DailyLimitStatus {
  isPro: boolean;
  nuzul_ai: { used: number; max: number; remaining: number };
  tajweed_ai: { used: number; max: number; remaining: number };
}

interface ProDetails {
  active: boolean;
  source: string;
  expiresAt: string | null;
  verificationState: string;
  remaining: {
    ms: number;
    hours: number;
    minutes: number;
    isExpiringSoon: boolean;
  };
}

interface PersistOptions {
  persistSecure?: boolean;
  announce?: boolean;
  verifiedAt?: string;
  lastCheckAt?: string;
  verificationState?: string;
  reason?: string;
}

const FREE_LIMITS: FreeLimits = {
  nuzul_ai: 2,
  tajweed_ai: 1,
  word_analysis: 3,
  word_by_word: 4,
  memorize_surahs: 5,
  hatim_count: 1,
  amel_history_days: 7,
  themes: 3,
};

export const FREE_WORD_BY_WORD_SURAHS = [1, 112, 113, 114];

const FREE_MEMORIZE_SURAHS = [1, 112, 113, 114, 111];
const TRUSTED_STATUS_CACHE_MS = 15 * 60 * 1000;
const NEGATIVE_VERIFICATION_STATES = new Set(["inactive", "negative", "expired", "integrity_failed"]);
const TRUSTED_ACTIVE_SOURCES = new Set([
  "checkProStatus",
  "syncProStatus",
  "revenuecat",
  "referral_reward",
]);
const DEFAULT_PRO_STATE: ProState = Object.freeze({
  active: false,
  expiresAt: null,
  verifiedAt: null,
  lastCheckAt: null,
  source: "none",
  verificationState: "inactive",
});

let lastTrustedCheckAt = 0;
let lastTrustedResult: boolean | null = null;

const getTodayString = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

const toIsoOrNull = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null;
};

const sanitizeVerificationState = (verificationState: string | undefined, active: boolean): string => {
  if (typeof verificationState === "string" && verificationState.trim()) {
    return verificationState.trim();
  }
  return active ? "verified" : "inactive";
};

const normalizeProState = (candidate: Partial<ProState> | null, fallback: ProState = DEFAULT_PRO_STATE): ProState => {
  if (!candidate || typeof candidate !== "object") {
    return { ...fallback };
  }

  const expiresAt = toIsoOrNull(candidate.expiresAt ?? null);
  const verifiedAt = toIsoOrNull(candidate.verifiedAt || candidate.updatedAt);
  const lastCheckAt = toIsoOrNull(candidate.lastCheckAt || candidate.updatedAt);
  const source =
    typeof candidate.source === "string" && candidate.source
      ? candidate.source
      : typeof candidate.verifiedBy === "string" && candidate.verifiedBy
      ? candidate.verifiedBy
      : fallback.source;

  let active = candidate.active === true;
  let verificationState = sanitizeVerificationState(candidate.verificationState, active);

  if (expiresAt && Date.parse(expiresAt) <= Date.now()) {
    active = false;
    verificationState = "expired";
  }

  if (active && !TRUSTED_ACTIVE_SOURCES.has(source)) {
    active = false;
    verificationState = "untrusted_source";
  }

  if (NEGATIVE_VERIFICATION_STATES.has(verificationState)) {
    active = false;
  }

  return {
    active,
    expiresAt,
    verifiedAt,
    lastCheckAt,
    source,
    verificationState,
  };
};

const getStoredProState = (): ProState => normalizeProState(storageService.getItem<ProState>(STORAGE_KEYS.PRO_STATUS, null), DEFAULT_PRO_STATE);

const setTrustedResult = (result: boolean | null): void => {
  lastTrustedResult = result;
  lastTrustedCheckAt = Date.now();
};

const emitProStatusChanged = (state: ProState): void => {
  try {
    useAppStore.getState().setIsProUser(isProStateActive(state));
  } catch {
    if (typeof window === "undefined" || typeof window.dispatchEvent !== "function") {
      return;
    }
    window.dispatchEvent(
      new CustomEvent("proStatusChanged", {
        detail: {
          active: isProStateActive(state),
          state,
        },
      })
    );
  }
};

const persistLocalState = (state: ProState): void => {
  storageService.setItem(STORAGE_KEYS.PRO_STATUS, state);
};

const persistProState = async (state: Partial<ProState>, { persistSecure = true, announce = true }: PersistOptions = {}): Promise<ProState> => {
  const normalized = normalizeProState(state);

  if (persistSecure) {
    if (normalized.verificationState === "integrity_failed") {
      await secureStorage.clearProStatus();
    } else {
      await secureStorage.setProStatus(normalized);
    }
  }

  persistLocalState(normalized);

  if (announce) {
    emitProStatusChanged(normalized);
  }

  return normalized;
};

export const isProStateActive = (state: ProState | null): boolean => {
  const normalized = normalizeProState(state, DEFAULT_PRO_STATE);

  if (normalized.active !== true) return false;

  if (normalized.expiresAt && Date.parse(normalized.expiresAt) <= Date.now()) return false;

  return !NEGATIVE_VERIFICATION_STATES.has(normalized.verificationState);
};

export const getProStateSnapshot = (): ProState => {
  const state = getStoredProState();
  if (state.expiresAt && Date.parse(state.expiresAt) <= Date.now() && state.verificationState !== "expired") {
    const expiredState = normalizeProState({
      ...state,
      active: false,
      verificationState: "expired",
      lastCheckAt: new Date().toISOString(),
    });
    persistLocalState(expiredState);
    return expiredState;
  }

  return state;
};

export const isPro = (): boolean => {
  try {
    return isProStateActive(getProStateSnapshot());
  } catch (error) {
    logger.error("[ProService] isPro failed", error);
    return false;
  }
};

const getTrustedProStatus = async (): Promise<boolean> => {
  if (lastTrustedResult !== null && Date.now() - lastTrustedCheckAt <= TRUSTED_STATUS_CACHE_MS) {
    return lastTrustedResult;
  }

  const verifiedActive = await verifyProStatus();
  if (verifiedActive) {
    setTrustedResult(true);
    return true;
  }

  try {
    const { syncProStatusFromServer } = await import("./subscriptionSyncService");
    const serverResult = await syncProStatusFromServer();
    if (serverResult && typeof serverResult.isPro === "boolean") {
      const active = isPro();
      setTrustedResult(active);
      return active;
    }
  } catch (error) {
    logger.warn("[ProService] Server authoritative sync unavailable", error);
  }

  setTrustedResult(false);
  return false;
};

export const verifyProStatus = async (): Promise<boolean> => {
  const localState = getProStateSnapshot();

  try {
    const secureState = await secureStorage.getProStatus();

    if (!secureState) {
      crashlyticsReporter.logCrash("[ProService] secure cache missing, using local snapshot");
      return isProStateActive(localState);
    }

    if (!secureState.isValid) {
      const tamperedState = normalizeProState({
        ...localState,
        active: false,
        source: secureState.source || secureState.verifiedBy || localState.source,
        verificationState: "integrity_failed",
        lastCheckAt: new Date().toISOString(),
      });

      await persistProState(tamperedState, { persistSecure: false });
      await secureStorage.clearProStatus();
      setTrustedResult(false);
      crashlyticsReporter.logCrash("[ProService] integrity check failed");
      return false;
    }

    const normalized = normalizeProState({
      ...localState,
      ...secureState,
      source: secureState.source || secureState.verifiedBy || localState.source,
      lastCheckAt: new Date().toISOString(),
    });

    await persistProState(normalized, { persistSecure: false });
    const active = isProStateActive(normalized);
    setTrustedResult(active);
    crashlyticsReporter.logCrash(`[ProService] verify source=${normalized.source} active=${active} state=${normalized.verificationState}`);
    return active;
  } catch (error) {
    logger.warn("[ProService] verifyProStatus failed", error);
    return isProStateActive(localState);
  }
};

export const setProStatus = async (
  active: boolean,
  expiresAt: string | null = null,
  source = "revenuecat_sdk",
  options: PersistOptions = {}
): Promise<void> => {
  try {
    const nowIso = new Date().toISOString();
    const currentState = getProStateSnapshot();
    const nextState = normalizeProState({
      ...currentState,
      active,
      expiresAt,
      verifiedAt: options.verifiedAt || nowIso,
      lastCheckAt: options.lastCheckAt || nowIso,
      source,
      verificationState: options.verificationState || (active ? "verified" : options.reason || "negative"),
    });

    await persistProState(nextState);
    setTrustedResult(isProStateActive(nextState));

    crashlyticsReporter.logCrash(`[ProService] set status source=${source} active=${nextState.active} state=${nextState.verificationState}`);
  } catch (error) {
    logger.warn("[ProService] Error setting pro status", error);
  }
};

interface DailyLimits {
  date: string;
  nuzul_ai: number;
  tajweed_ai: number;
  word_analysis: number;
}

const getDailyLimits = async (): Promise<DailyLimits> => {
  try {
    const today = getTodayString();
    const data = await secureStorage.getItem<DailyLimits>("huzur_daily_limits");

    if (data && data.date === today) {
      return data;
    }

    return {
      date: today,
      nuzul_ai: 0,
      tajweed_ai: 0,
      word_analysis: 0,
    };
  } catch (error) {
    logger.error("[ProService] getUsageStats failed", error);
    return { date: getTodayString(), nuzul_ai: 0, tajweed_ai: 0, word_analysis: 0 };
  }
};

const saveDailyLimits = async (limits: DailyLimits): Promise<void> => {
  try {
    await secureStorage.setItem("huzur_daily_limits", limits);
  } catch (error) {
    logger.warn("[ProService] Error saving daily limits", error);
  }
};

export const checkLimit = async (feature: keyof FreeLimits): Promise<LimitCheck> => {
  if (await getTrustedProStatus()) {
    return {
      allowed: true,
      remaining: Infinity,
      max: Infinity,
      isPro: true,
    };
  }

  const limits = await getDailyLimits();
  const used = (limits as Record<string, number>)[feature] || 0;
  const max = FREE_LIMITS[feature] || 0;
  const remaining = Math.max(0, max - used);

  return {
    allowed: remaining > 0,
    remaining,
    max,
    isPro: false,
  };
};

export const consumeLimit = async (feature: keyof FreeLimits): Promise<boolean> => {
  if (await getTrustedProStatus()) {
    return true;
  }

  const check = await checkLimit(feature);
  if (!check.allowed) {
    return false;
  }

  const limits = await getDailyLimits();
  (limits as Record<string, number>)[feature] = ((limits as Record<string, number>)[feature] || 0) + 1;
  await saveDailyLimits(limits);

  return true;
};

export const useLimit = consumeLimit;

export const canAccessWordByWord = (surahNumber: number): boolean => {
  if (isPro()) return true;
  return FREE_WORD_BY_WORD_SURAHS.includes(surahNumber);
};

export const canAccessMemorize = (surahNumber: number): boolean => {
  if (isPro()) return true;
  return FREE_MEMORIZE_SURAHS.includes(surahNumber);
};

interface ProFeature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export const PRO_FEATURES: ProFeature[] = [
  { id: "unlimited_ai", icon: "\u{1F916}", title: "Sınırsız AI Rehber", description: "Nüzul sebebi ve tecvid asistanına sınırsız soru" },
  { id: "all_surahs", icon: "\u{1F4D6}", title: "Tüm Sureler", description: "114 surenin tamamında kelime analizi ve hafızlık" },
  { id: "no_ads", icon: "\u{1F6AB}", title: "Reklamsız Deneyim", description: "Odaklanmanızı bozacak hiçbir reklam yok" },
  { id: "themes", icon: "\u{1F3A8}", title: "Premium Temalar", description: "Huzur veren özel tasarım ve renk seçenekleri" },
  { id: "history", icon: "\u{1F4CA}", title: "Sınırsız Geçmiş", description: "Amel defteri ve gelişim istatistiklerine tam erişim" },
  { id: "support", icon: "\u{1F4AC}", title: "Öncelikli Destek", description: "Sorularınız için hızlı destek" },
];

export const getDailyLimitStatus = async (): Promise<DailyLimitStatus> => {
  const limits = await getDailyLimits();
  const pro = await getTrustedProStatus();

  return {
    isPro: pro,
    nuzul_ai: {
      used: limits.nuzul_ai || 0,
      max: pro ? Infinity : FREE_LIMITS.nuzul_ai,
      remaining: pro ? Infinity : Math.max(0, FREE_LIMITS.nuzul_ai - (limits.nuzul_ai || 0)),
    },
    tajweed_ai: {
      used: limits.tajweed_ai || 0,
      max: pro ? Infinity : FREE_LIMITS.tajweed_ai,
      remaining: pro ? Infinity : Math.max(0, FREE_LIMITS.tajweed_ai - (limits.tajweed_ai || 0)),
    },
  };
};

export const getProSource = (): string => {
  try {
    const state = getProStateSnapshot();
    return state.source || "none";
  } catch (error) {
    logger.error("[ProService] getProSource failed", error);
    return "none";
  }
};

export const getProDetails = (): ProDetails => {
  try {
    const state = getProStateSnapshot();
    const active = isProStateActive(state);
    const now = Date.now();
    const expiresAt = state.expiresAt ? Date.parse(state.expiresAt) : null;
    const remainingMs = expiresAt && active ? Math.max(0, expiresAt - now) : 0;
    const remainingHours = remainingMs > 0 ? Math.floor(remainingMs / (1000 * 60 * 60)) : 0;
    const remainingMinutes = remainingMs > 0 ? Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60)) : 0;

    return {
      active,
      source: state.source || "none",
      expiresAt: state.expiresAt,
      verificationState: state.verificationState,
      remaining: {
        ms: remainingMs,
        hours: remainingHours,
        minutes: remainingMinutes,
        isExpiringSoon: remainingMs > 0 && remainingMs < 6 * 60 * 60 * 1000,
      },
    };
  } catch (error) {
    logger.error("[ProService] getProDetails failed", error);
    return {
      active: false,
      source: "none",
      expiresAt: null,
      verificationState: "inactive",
      remaining: { ms: 0, hours: 0, minutes: 0, isExpiringSoon: false },
    };
  }
};

export default {
  isPro,
  isProStateActive,
  getProStateSnapshot,
  getProSource,
  getProDetails,
  verifyProStatus,
  setProStatus,
  checkLimit,
  consumeLimit,
  useLimit,
  canAccessWordByWord,
  canAccessMemorize,
  getDailyLimitStatus,
  PRO_FEATURES,
  FREE_WORD_BY_WORD_SURAHS,
};

import { doc, getDoc } from 'firebase/firestore';
import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';
import { getDb } from './firebase';
import { storageService } from './storageService';

interface AiGlobalReleaseStatus {
  status: 'healthy' | 'watch' | 'critical';
  updatedAt: string | null;
  fallbackRate: number;
  lowTrustRate: number;
  criticalIncidentCount24h: number;
  staleSurfaceCount: number;
  weeklyCronHealthy: boolean;
  topProvider: string;
  topRiskSurface: string | null;
  recommendedAction: string;
}

interface GetStatusOptions {
  forceRefresh?: boolean;
}

const CACHE_TTL_MS = 5 * 60 * 1000;

export const DEFAULT_AI_GLOBAL_RELEASE_STATUS: AiGlobalReleaseStatus = {
  status: 'watch',
  updatedAt: null,
  fallbackRate: 0,
  lowTrustRate: 0,
  criticalIncidentCount24h: 0,
  staleSurfaceCount: 0,
  weeklyCronHealthy: true,
  topProvider: 'fallback',
  topRiskSurface: null,
  recommendedAction: 'Global AI release health henuz olusmadi.',
};

const normalizePercent = (value: unknown): number => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(1, numeric));
};

const normalizeDateTimeValue = (value: unknown): string | null => {
  if (!value) return null;
  if (typeof value === 'string') return value.slice(0, 80);
  if (typeof (value as { toDate?: () => Date }).toDate === 'function') return (value as { toDate: () => Date }).toDate().toISOString();
  if (typeof (value as { toMillis?: () => number }).toMillis === 'function') return new Date((value as { toMillis: () => number }).toMillis()).toISOString();
  return null;
};

const normalizeAiGlobalReleaseStatus = (value: unknown = {}): AiGlobalReleaseStatus => {
  const safe = value && typeof value === 'object' ? value as Record<string, unknown> : {};

  return {
    status: ['healthy', 'watch', 'critical'].includes(safe.status as string) ? safe.status as 'healthy' | 'watch' | 'critical' : 'watch',
    updatedAt: normalizeDateTimeValue(safe.updatedAt),
    fallbackRate: normalizePercent(safe.fallbackRate),
    lowTrustRate: normalizePercent(safe.lowTrustRate),
    criticalIncidentCount24h: Number.isFinite(Number(safe.criticalIncidentCount24h))
      ? Math.max(0, Number(safe.criticalIncidentCount24h))
      : 0,
    staleSurfaceCount: Number.isFinite(Number(safe.staleSurfaceCount))
      ? Math.max(0, Number(safe.staleSurfaceCount))
      : 0,
    weeklyCronHealthy: safe.weeklyCronHealthy !== false,
    topProvider: typeof safe.topProvider === 'string' ? safe.topProvider.slice(0, 40) : 'fallback',
    topRiskSurface: typeof safe.topRiskSurface === 'string' ? safe.topRiskSurface.slice(0, 60) : null,
    recommendedAction: typeof safe.recommendedAction === 'string'
      ? safe.recommendedAction.slice(0, 220)
      : DEFAULT_AI_GLOBAL_RELEASE_STATUS.recommendedAction,
  };
};

export const getCachedAiGlobalReleaseStatus = (): AiGlobalReleaseStatus => (
  normalizeAiGlobalReleaseStatus(
    storageService.getItem(STORAGE_KEYS.AI_GLOBAL_RELEASE_STATUS_CACHE, DEFAULT_AI_GLOBAL_RELEASE_STATUS)
  )
);

export const getAiGlobalReleaseStatus = async ({ forceRefresh = false }: GetStatusOptions = {}): Promise<AiGlobalReleaseStatus> => {
  const cachedAt = storageService.getNumber(STORAGE_KEYS.AI_GLOBAL_RELEASE_STATUS_CACHE_AT, 0);
  const now = Date.now();

  if (!forceRefresh && cachedAt > 0 && now - cachedAt < CACHE_TTL_MS) {
    return getCachedAiGlobalReleaseStatus();
  }

  try {
    const database = await getDb();
    const snapshot = await getDoc(doc(database, 'ops', 'aiReleaseStatus'));
    const value = normalizeAiGlobalReleaseStatus(snapshot.exists() ? snapshot.data() : DEFAULT_AI_GLOBAL_RELEASE_STATUS);
    storageService.setItem(STORAGE_KEYS.AI_GLOBAL_RELEASE_STATUS_CACHE, value);
    storageService.setNumber(STORAGE_KEYS.AI_GLOBAL_RELEASE_STATUS_CACHE_AT, now);
    return value;
  } catch (error) {
    logger.warn('[AiGlobalReleaseStatus] Falling back to cached status', error);
    return getCachedAiGlobalReleaseStatus();
  }
};

export default {
  DEFAULT_AI_GLOBAL_RELEASE_STATUS,
  getCachedAiGlobalReleaseStatus,
  getAiGlobalReleaseStatus,
};

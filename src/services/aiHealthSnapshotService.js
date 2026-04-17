import { doc, getDoc } from 'firebase/firestore';
import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';
import { getCurrentUserIdEnsured } from './authService';
import { db } from './firebase';
import { storageService } from './storageService';

const CACHE_TTL_MS = 5 * 60 * 1000;
const DEFAULT_AI_HEALTH = {
  latestAssistantSnapshot: null,
  latestHomeRankingSnapshot: null,
  latestWeeklyInsightSnapshot: null,
  latestPushHintSnapshot: null,
  latestAiHealthAt: null,
};

export const normalizeDateTimeValue = (value) => {
  if (!value) return null;
  if (typeof value === 'string') {
    return value.slice(0, 80);
  }
  if (typeof value?.toDate === 'function') {
    return value.toDate().toISOString();
  }
  if (typeof value?.toMillis === 'function') {
    return new Date(value.toMillis()).toISOString();
  }
  if (Number.isFinite(Number(value))) {
    return new Date(Number(value)).toISOString();
  }
  return null;
};

const sanitizeSource = (value) => {
  if (!value || typeof value !== 'object') return null;
  return {
    sourceId: typeof value.sourceId === 'string' ? value.sourceId.slice(0, 120) : null,
    label: typeof value.label === 'string' ? value.label.slice(0, 120) : 'Genel rehberlik',
    type: typeof value.type === 'string' ? value.type.slice(0, 40) : 'context',
    reviewStatus: typeof value.reviewStatus === 'string' ? value.reviewStatus.slice(0, 40) : 'unreviewed',
    confidence: ['high', 'medium', 'low'].includes(value.confidence) ? value.confidence : 'medium',
    origin: typeof value.origin === 'string' ? value.origin.slice(0, 60) : 'context',
  };
};

const sanitizeSnapshot = (value) => {
  if (!value || typeof value !== 'object') return null;

  return {
    kind: typeof value.kind === 'string' ? value.kind.slice(0, 40) : 'unknown',
    provider: typeof value.provider === 'string' ? value.provider.slice(0, 40) : 'fallback',
    confidence: ['high', 'medium', 'low'].includes(value.confidence) ? value.confidence : null,
    reviewStatus: typeof value.reviewStatus === 'string' ? value.reviewStatus.slice(0, 40) : 'unreviewed',
    trustScore: Number.isFinite(Number(value.trustScore)) ? Number(value.trustScore) : null,
    sourceCount: Number.isFinite(Number(value.sourceCount)) ? Number(value.sourceCount) : 0,
    updatedAtIso: normalizeDateTimeValue(value.updatedAtIso),
    riskBand: typeof value.riskBand === 'string' ? value.riskBand.slice(0, 40) : null,
    reason: typeof value.reason === 'string' ? value.reason.slice(0, 60) : null,
    safetyCategory: typeof value.safetyCategory === 'string' ? value.safetyCategory.slice(0, 60) : null,
    moduleCount: Number.isFinite(Number(value.moduleCount)) ? Number(value.moduleCount) : null,
    notificationType: typeof value.notificationType === 'string' ? value.notificationType.slice(0, 40) : null,
    sources: Array.isArray(value.sources) ? value.sources.map(sanitizeSource).filter(Boolean).slice(0, 3) : [],
  };
};

const normalizeAiHealth = (value) => {
  const safe = value && typeof value === 'object' ? value : {};
  return {
    latestAssistantSnapshot: sanitizeSnapshot(safe.latestAssistantSnapshot),
    latestHomeRankingSnapshot: sanitizeSnapshot(safe.latestHomeRankingSnapshot),
    latestWeeklyInsightSnapshot: sanitizeSnapshot(safe.latestWeeklyInsightSnapshot),
    latestPushHintSnapshot: sanitizeSnapshot(safe.latestPushHintSnapshot),
    latestAiHealthAt: normalizeDateTimeValue(safe.latestAiHealthAt),
  };
};

export const getCachedAiHealthSnapshots = () => (
  normalizeAiHealth(storageService.getItem(STORAGE_KEYS.AI_HEALTH_CACHE, DEFAULT_AI_HEALTH))
);

export const getAiHealthSnapshots = async ({ forceRefresh = false } = {}) => {
  const cachedAt = storageService.getNumber(STORAGE_KEYS.AI_HEALTH_CACHE_AT, 0);
  const now = Date.now();

  if (!forceRefresh && cachedAt > 0 && now - cachedAt < CACHE_TTL_MS) {
    return getCachedAiHealthSnapshots();
  }

  try {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) {
      return getCachedAiHealthSnapshots();
    }

    const snapshot = await getDoc(doc(db, 'users', userId, 'aiProfile', 'profile'));
    const data = normalizeAiHealth(snapshot.exists() ? snapshot.data() : DEFAULT_AI_HEALTH);
    storageService.setItem(STORAGE_KEYS.AI_HEALTH_CACHE, data);
    storageService.setNumber(STORAGE_KEYS.AI_HEALTH_CACHE_AT, now);
    return data;
  } catch (error) {
    logger.warn('[AIHealthSnapshotService] Falling back to cached health', error);
    return getCachedAiHealthSnapshots();
  }
};

export const getAiHealthSnapshot = async (kind, options = {}) => {
  const health = await getAiHealthSnapshots(options);

  switch (kind) {
    case 'assistant':
      return health.latestAssistantSnapshot;
    case 'home_ranking':
      return health.latestHomeRankingSnapshot;
    case 'weekly_insight':
      return health.latestWeeklyInsightSnapshot;
    case 'push_hint':
      return health.latestPushHintSnapshot;
    default:
      return null;
  }
};

export default {
  getAiHealthSnapshots,
  getAiHealthSnapshot,
  getCachedAiHealthSnapshots,
};

import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';
import { getCurrentUserIdEnsured } from './authService';
import { getDb } from './firebase';
import { storageService } from './storageService';

interface AiHealthSource {
  sourceId: string | null;
  label: string;
  type: string;
  reviewStatus: string;
  confidence: string;
  origin: string;
}

interface AiHealthSnapshot {
  kind: string;
  provider: string;
  confidence: string | null;
  reviewStatus: string;
  trustScore: number | null;
  sourceCount: number;
  updatedAtIso: string | null;
  riskBand: string | null;
  reason: string | null;
  safetyCategory: string | null;
  moduleCount: number | null;
  notificationType: string | null;
  sources: AiHealthSource[];
}

interface AiHealthData {
  latestAssistantSnapshot: AiHealthSnapshot | null;
  latestHomeRankingSnapshot: AiHealthSnapshot | null;
  latestWeeklyInsightSnapshot: AiHealthSnapshot | null;
  latestPushHintSnapshot: AiHealthSnapshot | null;
  latestAiHealthAt: string | null;
}

interface GetAiHealthOptions {
  forceRefresh?: boolean;
}

const CACHE_TTL_MS = 5 * 60 * 1000;
const DEFAULT_AI_HEALTH: AiHealthData = {
  latestAssistantSnapshot: null,
  latestHomeRankingSnapshot: null,
  latestWeeklyInsightSnapshot: null,
  latestPushHintSnapshot: null,
  latestAiHealthAt: null,
};

export const normalizeDateTimeValue = (value: unknown): string | null => {
  if (!value) return null;
  if (typeof value === 'string') {
    return value.slice(0, 80);
  }
  if (typeof (value as { toDate?: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  if (typeof (value as { toMillis?: () => number }).toMillis === 'function') {
    return new Date((value as { toMillis: () => number }).toMillis()).toISOString();
  }
  if (Number.isFinite(Number(value))) {
    return new Date(Number(value)).toISOString();
  }
  return null;
};

const sanitizeSource = (value: unknown): AiHealthSource | null => {
  if (!value || typeof value !== 'object') return null;
  const obj = value as Record<string, unknown>;
  return {
    sourceId: typeof obj.sourceId === 'string' ? obj.sourceId.slice(0, 120) : null,
    label: typeof obj.label === 'string' ? obj.label.slice(0, 120) : 'Genel rehberlik',
    type: typeof obj.type === 'string' ? obj.type.slice(0, 40) : 'context',
    reviewStatus: typeof obj.reviewStatus === 'string' ? obj.reviewStatus.slice(0, 40) : 'unreviewed',
    confidence: ['high', 'medium', 'low'].includes(obj.confidence as string) ? obj.confidence as string : 'medium',
    origin: typeof obj.origin === 'string' ? obj.origin.slice(0, 60) : 'context',
  };
};

const sanitizeSnapshot = (value: unknown): AiHealthSnapshot | null => {
  if (!value || typeof value !== 'object') return null;
  const obj = value as Record<string, unknown>;

  return {
    kind: typeof obj.kind === 'string' ? obj.kind.slice(0, 40) : 'unknown',
    provider: typeof obj.provider === 'string' ? obj.provider.slice(0, 40) : 'fallback',
    confidence: ['high', 'medium', 'low'].includes(obj.confidence as string) ? obj.confidence as string : null,
    reviewStatus: typeof obj.reviewStatus === 'string' ? obj.reviewStatus.slice(0, 40) : 'unreviewed',
    trustScore: Number.isFinite(Number(obj.trustScore)) ? Number(obj.trustScore) : null,
    sourceCount: Number.isFinite(Number(obj.sourceCount)) ? Number(obj.sourceCount) : 0,
    updatedAtIso: normalizeDateTimeValue(obj.updatedAtIso),
    riskBand: typeof obj.riskBand === 'string' ? obj.riskBand.slice(0, 40) : null,
    reason: typeof obj.reason === 'string' ? obj.reason.slice(0, 60) : null,
    safetyCategory: typeof obj.safetyCategory === 'string' ? obj.safetyCategory.slice(0, 60) : null,
    moduleCount: Number.isFinite(Number(obj.moduleCount)) ? Number(obj.moduleCount) : null,
    notificationType: typeof obj.notificationType === 'string' ? obj.notificationType.slice(0, 40) : null,
    sources: Array.isArray(obj.sources) ? obj.sources.map(sanitizeSource).filter((s): s is AiHealthSource => Boolean(s)).slice(0, 3) : [],
  };
};

const normalizeAiHealth = (value: unknown): AiHealthData => {
  const safe = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return {
    latestAssistantSnapshot: sanitizeSnapshot(safe.latestAssistantSnapshot),
    latestHomeRankingSnapshot: sanitizeSnapshot(safe.latestHomeRankingSnapshot),
    latestWeeklyInsightSnapshot: sanitizeSnapshot(safe.latestWeeklyInsightSnapshot),
    latestPushHintSnapshot: sanitizeSnapshot(safe.latestPushHintSnapshot),
    latestAiHealthAt: normalizeDateTimeValue(safe.latestAiHealthAt),
  };
};

export const getCachedAiHealthSnapshots = (): AiHealthData => (
  normalizeAiHealth(storageService.getItem(STORAGE_KEYS.AI_HEALTH_CACHE, DEFAULT_AI_HEALTH))
);

export const getAiHealthSnapshots = async ({ forceRefresh = false }: GetAiHealthOptions = {}): Promise<AiHealthData> => {
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

    const database = await getDb();
    const snapshot = await getDoc(doc(database, 'users', userId, 'aiProfile', 'profile'));
    const data = normalizeAiHealth(snapshot.exists() ? snapshot.data() : DEFAULT_AI_HEALTH);
    storageService.setItem(STORAGE_KEYS.AI_HEALTH_CACHE, data);
    storageService.setNumber(STORAGE_KEYS.AI_HEALTH_CACHE_AT, now);
    return data;
  } catch (error) {
    logger.warn('[AIHealthSnapshotService] Falling back to cached health', error);
    return getCachedAiHealthSnapshots();
  }
};

export const getAiHealthSnapshot = async (kind: string, options: GetAiHealthOptions = {}): Promise<AiHealthSnapshot | null> => {
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

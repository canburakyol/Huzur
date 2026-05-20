import { doc, getDoc } from 'firebase/firestore';
import { getDb } from './firebase';
import { STORAGE_KEYS } from '../constants';
import { storageService } from './storageService';
import { logger } from '../utils/logger';

interface AiFlags {
  assistant_v2_enabled: boolean;
  home_ranking_v2_enabled: boolean;
  weekly_insights_v1_enabled: boolean;
  push_personalization_v1_enabled: boolean;
  social_ai_hints_v1_enabled: boolean;
  ai_ops_rollup_v1_enabled: boolean;
  remote_onboarding_v1_enabled: boolean;
  premium_moments_v1_enabled: boolean;
}

interface GetFlagsOptions {
  forceRefresh?: boolean;
}

const FLAG_DOC_PATH = ['config', 'aiFlags'] as const;
const CACHE_TTL_MS = 5 * 60 * 1000;

export const DEFAULT_AI_FLAGS: AiFlags = {
  assistant_v2_enabled: false,
  home_ranking_v2_enabled: false,
  weekly_insights_v1_enabled: false,
  push_personalization_v1_enabled: false,
  social_ai_hints_v1_enabled: false,
  ai_ops_rollup_v1_enabled: false,
  remote_onboarding_v1_enabled: false,
  premium_moments_v1_enabled: false,
};

const normalizeFlags = (value: unknown): AiFlags => {
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};

  return {
    assistant_v2_enabled: source.assistant_v2_enabled === true,
    home_ranking_v2_enabled: source.home_ranking_v2_enabled === true,
    weekly_insights_v1_enabled: source.weekly_insights_v1_enabled === true,
    push_personalization_v1_enabled: source.push_personalization_v1_enabled === true,
    social_ai_hints_v1_enabled: source.social_ai_hints_v1_enabled === true,
    ai_ops_rollup_v1_enabled: source.ai_ops_rollup_v1_enabled === true,
    remote_onboarding_v1_enabled: source.remote_onboarding_v1_enabled === true,
    premium_moments_v1_enabled: source.premium_moments_v1_enabled === true,
  };
};

export const getCachedAiFlags = (): AiFlags => {
  const cached = storageService.getItem(STORAGE_KEYS.AI_FLAGS_CACHE, DEFAULT_AI_FLAGS);
  return normalizeFlags(cached);
};

export const getAiFeatureFlags = async ({ forceRefresh = false }: GetFlagsOptions = {}): Promise<AiFlags> => {
  const cachedAt = storageService.getNumber(STORAGE_KEYS.AI_FLAGS_CACHE_AT, 0);
  const now = Date.now();

  if (!forceRefresh && cachedAt > 0 && now - cachedAt < CACHE_TTL_MS) {
    return getCachedAiFlags();
  }

  try {
    const database = await getDb();
    const snapshot = await getDoc(doc(database, ...FLAG_DOC_PATH));
    const flags = normalizeFlags(snapshot.exists() ? snapshot.data() : DEFAULT_AI_FLAGS);
    storageService.setItem(STORAGE_KEYS.AI_FLAGS_CACHE, flags);
    storageService.setNumber(STORAGE_KEYS.AI_FLAGS_CACHE_AT, now);
    return flags;
  } catch (error) {
    logger.warn('[AIFlags] Falling back to cached flags', error);
    return getCachedAiFlags();
  }
};

export const isAiFeatureEnabled = async (flagKey: keyof AiFlags): Promise<boolean> => {
  const flags = await getAiFeatureFlags();
  return flags?.[flagKey] === true;
};

export default {
  DEFAULT_AI_FLAGS,
  getCachedAiFlags,
  getAiFeatureFlags,
  isAiFeatureEnabled,
};

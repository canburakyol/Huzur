import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { STORAGE_KEYS } from '../constants';
import { storageService } from './storageService';
import { logger } from '../utils/logger';

const FLAG_DOC_PATH = ['config', 'aiFlags'];
const CACHE_TTL_MS = 5 * 60 * 1000;

export const DEFAULT_AI_FLAGS = {
  assistant_v2_enabled: false,
  home_ranking_v2_enabled: false,
  weekly_insights_v1_enabled: false,
  push_personalization_v1_enabled: false,
  social_ai_hints_v1_enabled: false,
  ai_ops_rollup_v1_enabled: false,
  remote_onboarding_v1_enabled: false,
  premium_moments_v1_enabled: false,
};

const normalizeFlags = (value) => {
  const source = value && typeof value === 'object' ? value : {};

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

export const getCachedAiFlags = () => {
  const cached = storageService.getItem(STORAGE_KEYS.AI_FLAGS_CACHE, DEFAULT_AI_FLAGS);
  return normalizeFlags(cached);
};

export const getAiFeatureFlags = async ({ forceRefresh = false } = {}) => {
  const cachedAt = storageService.getNumber(STORAGE_KEYS.AI_FLAGS_CACHE_AT, 0);
  const now = Date.now();

  if (!forceRefresh && cachedAt > 0 && now - cachedAt < CACHE_TTL_MS) {
    return getCachedAiFlags();
  }

  try {
    const snapshot = await getDoc(doc(db, ...FLAG_DOC_PATH));
    const flags = normalizeFlags(snapshot.exists() ? snapshot.data() : DEFAULT_AI_FLAGS);
    storageService.setItem(STORAGE_KEYS.AI_FLAGS_CACHE, flags);
    storageService.setNumber(STORAGE_KEYS.AI_FLAGS_CACHE_AT, now);
    return flags;
  } catch (error) {
    logger.warn('[AIFlags] Falling back to cached flags', error);
    return getCachedAiFlags();
  }
};

export const isAiFeatureEnabled = async (flagKey) => {
  const flags = await getAiFeatureFlags();
  return flags?.[flagKey] === true;
};

export default {
  DEFAULT_AI_FLAGS,
  getCachedAiFlags,
  getAiFeatureFlags,
  isAiFeatureEnabled,
};

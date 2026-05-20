import { doc, getDoc } from 'firebase/firestore';
import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';
import { getDb } from './firebase';
import { storageService } from './storageService';

const CACHE_TTL_MS = 5 * 60 * 1000;
const ALLOWED_STEPS = ['language', 'permissions', 'goal', 'preview'];

type OnboardingConfig = {
  flowVersion: string;
  enabled: boolean;
  steps: string[];
  headlineVariant: string;
  permissionEmphasis: string;
  goalDefault: string;
  premiumTeaserEnabled: boolean;
};

export const DEFAULT_ONBOARDING_CONFIG: OnboardingConfig = {
  flowVersion: 'v1',
  enabled: false,
  steps: ['language', 'goal', 'preview'],
  headlineVariant: 'calm',
  permissionEmphasis: 'balanced',
  goalDefault: 'prayer_rhythm',
  premiumTeaserEnabled: false,
};

const sanitizeSteps = (steps: unknown): string[] => {
  if (!Array.isArray(steps)) return DEFAULT_ONBOARDING_CONFIG.steps;
  const normalized = steps
    .map((item) => (typeof item === 'string' ? item.trim().toLowerCase() : null))
    .filter((item): item is string => item !== null && ALLOWED_STEPS.includes(item));

  const deduped = normalized.length > 0 ? [...new Set(normalized)] : DEFAULT_ONBOARDING_CONFIG.steps;
  return deduped.includes('preview') ? deduped : [...deduped, 'preview'];
};

export const normalizeOnboardingConfig = (value: unknown = {}): OnboardingConfig => {
  const safe = value && typeof value === 'object' ? value as Record<string, unknown> : {};

  return {
    flowVersion: typeof safe.flowVersion === 'string' ? safe.flowVersion.slice(0, 40) : DEFAULT_ONBOARDING_CONFIG.flowVersion,
    enabled: safe.enabled === true,
    steps: sanitizeSteps(safe.steps),
    headlineVariant: typeof safe.headlineVariant === 'string' ? safe.headlineVariant.slice(0, 40) : DEFAULT_ONBOARDING_CONFIG.headlineVariant,
    permissionEmphasis: typeof safe.permissionEmphasis === 'string' ? safe.permissionEmphasis.slice(0, 40) : DEFAULT_ONBOARDING_CONFIG.permissionEmphasis,
    goalDefault: typeof safe.goalDefault === 'string' ? safe.goalDefault.slice(0, 40) : DEFAULT_ONBOARDING_CONFIG.goalDefault,
    premiumTeaserEnabled: safe.premiumTeaserEnabled === true,
  };
};

export const getCachedOnboardingConfig = (): OnboardingConfig => (
  normalizeOnboardingConfig(storageService.getItem(STORAGE_KEYS.ONBOARDING_CONFIG_CACHE, DEFAULT_ONBOARDING_CONFIG))
);

export const getOnboardingConfig = async ({ forceRefresh = false }: { forceRefresh?: boolean } = {}): Promise<OnboardingConfig> => {
  const cachedAt = storageService.getNumber(STORAGE_KEYS.ONBOARDING_CONFIG_CACHE_AT, 0);
  const now = Date.now();

  if (!forceRefresh && cachedAt > 0 && now - cachedAt < CACHE_TTL_MS) {
    return getCachedOnboardingConfig();
  }

  try {
    const database = await getDb();
    const snapshot = await getDoc(doc(database, 'config', 'onboardingExperience'));
    const config = normalizeOnboardingConfig(snapshot.exists() ? snapshot.data() : DEFAULT_ONBOARDING_CONFIG);
    storageService.setItem(STORAGE_KEYS.ONBOARDING_CONFIG_CACHE, config);
    storageService.setNumber(STORAGE_KEYS.ONBOARDING_CONFIG_CACHE_AT, now);
    return config;
  } catch (error) {
    logger.warn('[OnboardingConfig] Falling back to cached config', error);
    return getCachedOnboardingConfig();
  }
};

export default {
  DEFAULT_ONBOARDING_CONFIG,
  normalizeOnboardingConfig,
  getCachedOnboardingConfig,
  getOnboardingConfig,
};

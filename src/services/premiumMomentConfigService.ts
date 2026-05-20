import { doc, getDoc } from 'firebase/firestore';
import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';
import { getDb } from './firebase';
import { storageService } from './storageService';

const CACHE_TTL_MS = 5 * 60 * 1000;

type PreferredPackages = Record<string, string>;
type CopyVariants = Record<string, string>;

type PremiumMomentsConfig = {
  enabled: boolean;
  preferredPackages: PreferredPackages;
  copyVariants: CopyVariants;
};

export const DEFAULT_PREMIUM_MOMENTS_CONFIG: PremiumMomentsConfig = {
  enabled: true,
  preferredPackages: {
    assistant_success: 'yearly',
    weekly_report: 'yearly',
    home_recovery_support: 'monthly',
    onboarding_complete: 'yearly',
  },
  copyVariants: {
    assistant_success: 'ai_guidance',
    weekly_report: 'weekly_depth',
    home_recovery_support: 'quiet_support',
    onboarding_complete: 'family_rhythm',
  },
};

export const normalizePremiumMomentsConfig = (value: Partial<PremiumMomentsConfig> = {}): PremiumMomentsConfig => {
  const safe = value && typeof value === 'object' ? value : {};

  return {
    enabled: safe.enabled !== false,
    preferredPackages: {
      ...DEFAULT_PREMIUM_MOMENTS_CONFIG.preferredPackages,
      ...(safe.preferredPackages && typeof safe.preferredPackages === 'object' ? safe.preferredPackages : {}),
    },
    copyVariants: {
      ...DEFAULT_PREMIUM_MOMENTS_CONFIG.copyVariants,
      ...(safe.copyVariants && typeof safe.copyVariants === 'object' ? safe.copyVariants : {}),
    },
  };
};

export const getCachedPremiumMomentsConfig = (): PremiumMomentsConfig => (
  normalizePremiumMomentsConfig(
    storageService.getItem(STORAGE_KEYS.PREMIUM_MOMENTS_CONFIG_CACHE, DEFAULT_PREMIUM_MOMENTS_CONFIG) as Partial<PremiumMomentsConfig>
  )
);

export const getPremiumMomentsConfig = async ({ forceRefresh = false }: { forceRefresh?: boolean } = {}): Promise<PremiumMomentsConfig> => {
  const cachedAt = storageService.getNumber(STORAGE_KEYS.PREMIUM_MOMENTS_CONFIG_CACHE_AT, 0);
  const now = Date.now();

  if (!forceRefresh && cachedAt > 0 && now - cachedAt < CACHE_TTL_MS) {
    return getCachedPremiumMomentsConfig();
  }

  try {
    const database = await getDb();
    const snapshot = await getDoc(doc(database, 'config', 'premiumMoments'));
    const config = normalizePremiumMomentsConfig(snapshot.exists() ? snapshot.data() as Partial<PremiumMomentsConfig> : DEFAULT_PREMIUM_MOMENTS_CONFIG);
    storageService.setItem(STORAGE_KEYS.PREMIUM_MOMENTS_CONFIG_CACHE, config);
    storageService.setNumber(STORAGE_KEYS.PREMIUM_MOMENTS_CONFIG_CACHE_AT, now);
    return config;
  } catch (error) {
    logger.warn('[PremiumMomentsConfig] Falling back to cached config', error);
    return getCachedPremiumMomentsConfig();
  }
};

export default {
  DEFAULT_PREMIUM_MOMENTS_CONFIG,
  normalizePremiumMomentsConfig,
  getCachedPremiumMomentsConfig,
  getPremiumMomentsConfig,
};

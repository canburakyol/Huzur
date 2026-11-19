import { STORAGE_KEYS } from '../constants';
import { getStoredPrimaryGoal } from '../utils/primaryGoal';
import { logger } from '../utils/logger';
import { getExperimentVariant } from './experimentService';
import { getRecoveryLoopPlan } from './recoveryLoopService';
import { storageService } from './storageService';
import { DEFAULT_PREMIUM_MOMENTS_CONFIG, getCachedPremiumMomentsConfig } from './premiumMomentConfigService';
import { useAppStore } from '../stores/useAppStore';
import i18n from '../i18n';

const pt = (key: string, fallback: string): string => i18n.t(`premiumMoment.${key}`, { defaultValue: fallback });

const PREMIUM_SURFACES = new Set([
  'home_recovery_support',
  'weekly_report',
  'assistant_success',
  'onboarding_complete',
]);

type CopyVariant = 'weekly_depth' | 'family_rhythm' | 'quiet_support' | 'ai_guidance';
type MomentType = 'home_recovery_support' | 'weekly_report' | 'assistant_success' | 'onboarding_complete';
type RecommendedPackage = 'yearly' | 'monthly' | null;

type MomentCopy = {
  headline: string;
  description: string;
};

type PremiumMomentContext = {
  isPro?: boolean;
  primaryGoal?: string | null;
  recoveryBand?: string | null;
  assistantUsage?: number | null;
  weeklyInsightState?: { hasInsight?: boolean } | null;
  familyState?: { hasFamily?: boolean } | null;
  source?: string;
  momentType?: string;
  config?: PremiumMomentsConfig | null;
};

type PremiumMomentsConfig = {
  enabled?: boolean;
  preferredPackages?: Record<string, string>;
  copyVariants?: Record<string, string>;
};

type PremiumMoment = {
  momentType: string;
  source: string;
  headline: string;
  description: string;
  recommendedPackage: RecommendedPackage;
  copyVariant: string;
  showUpgrade: boolean;
  recoveryBand?: string;
  primaryGoal?: string;
};

const buildMomentCopy = (momentType: string, copyVariant: string): MomentCopy => {
  switch (copyVariant) {
    case 'weekly_depth':
      return {
        headline: pt('weeklyDepth.headline', 'Haftalık özeti daha derin gör'),
        description: pt('weeklyDepth.description', 'Daha derin haftalık içgörü, sakin takip ve net sonraki adımlar Pro ile açılır.'),
      };
    case 'family_rhythm':
      return {
        headline: pt('familyRhythm.headline', 'Ailece ritim kuran akışı aç'),
        description: pt('familyRhythm.description', 'Aile ritmini, ortak hedefleri ve daha derin rehberliği tek yerde toparla.'),
      };
    case 'quiet_support':
      return {
        headline: pt('quietSupport.headline', 'Sessiz premium desteği aç'),
        description: pt('quietSupport.description', 'Zorlanan günlerde daha sakin, kişisel ve derin bir destek katmanı açabilirsin.'),
      };
    case 'ai_guidance':
    default:
      return momentType === 'assistant_success'
        ? {
            headline: pt('aiGuidanceAssistant.headline', 'Daha derin AI rehberliği aç'),
            description: pt('aiGuidanceAssistant.description', 'Huzur Rehberi ile daha derin yönlendirmeler, takip odaklı adımlar ve sakin premium destek al.'),
          }
        : {
            headline: pt('aiGuidance.headline', 'Daha derin rehberliği aç'),
            description: pt('aiGuidance.description', 'AI rehberlik, haftalık içgörüler ve ritim desteğiyle daha derin bir akışa geç.'),
          };
  }
};

export const getPremiumMoment = ({
  isPro = false,
  primaryGoal = null,
  recoveryBand = null,
  assistantUsage = null,
  weeklyInsightState = null,
  familyState = null,
  source = 'direct',
  momentType = 'assistant_success',
  config = getCachedPremiumMomentsConfig(),
}: PremiumMomentContext = {}): PremiumMoment => {
  if (isPro === true) {
    return {
      momentType,
      source,
      headline: '',
      description: '',
      recommendedPackage: null,
      copyVariant: 'none',
      showUpgrade: false,
    };
  }

  const safeType = PREMIUM_SURFACES.has(momentType) ? momentType : 'assistant_success';
  const safeGoal = primaryGoal || getStoredPrimaryGoal();
  const effectiveRecoveryBand = recoveryBand || getRecoveryLoopPlan().riskBand;
  const preferredPackage = config?.preferredPackages?.[safeType] || 'yearly';
  const copyVariant = config?.copyVariants?.[safeType] || 'ai_guidance';
  const baseCopy = buildMomentCopy(safeType, copyVariant);

  let headline = baseCopy.headline;
  let description = baseCopy.description;

  if (safeGoal === 'family_consistency' || familyState?.hasFamily) {
    headline = pt('family.headline', 'Aile ritmi için Pro desteği aç');
    description = pt('family.description', 'Aile hedefleri, haftalık derinlik ve sakin premium destek tek akışta toplansın.');
  } else if (safeGoal === 'quran_learning') {
    headline = pt('quran.headline', 'Kur\'an yolculuğunu derinleştir');
    description = pt('quran.description', 'Daha derin haftalık özetler ve rehberlik ile Kur\'an odağını daha sakin kur.');
  } else if (safeType === 'home_recovery_support' && ['at_risk', 'comeback'].includes(effectiveRecoveryBand)) {
    headline = pt('recovery.headline', 'Bugün için daha derin destek aç');
    description = pt('recovery.description', 'Ritmi yeniden kurarken tek başına kalma; sakin premium rehberlik katmanını aç.');
  } else if (safeType === 'weekly_report' && weeklyInsightState?.hasInsight) {
    headline = pt('weeklyInsight.headline', 'Haftalık ritmini daha net gör');
    description = pt('weeklyInsight.description', 'Haftalık özetinin üstüne daha derin içgörüler ve aile ritmi önerileri eklenir.');
  } else if (safeType === 'assistant_success' && Number(assistantUsage) > 0) {
    headline = pt('assistantUsed.headline', 'Rehberliği derinleştir');
    description = pt('assistantUsed.description', 'Daha uzun hafıza, daha derin takip ve sakin premium destek ile ilerle.');
  }

  return {
    momentType: safeType,
    source,
    headline,
    description,
    recommendedPackage: preferredPackage,
    copyVariant,
    showUpgrade: config?.enabled !== false,
    recoveryBand: effectiveRecoveryBand || 'steady',
    primaryGoal: safeGoal || 'prayer_rhythm',
  };
};

export const getPremiumMomentExperimentVariant = (): string => (
  `${getExperimentVariant('paywall_value_stack_v1')}|${getExperimentVariant('paywall_cta_v1')}`
);

export const buildPremiumMomentAnalyticsPayload = (moment: Partial<PremiumMoment> = {}, extra: Record<string, unknown> = {}): Record<string, unknown> => ({
  source: moment.source || 'direct',
  moment_type: moment.momentType || 'assistant_success',
  experiment_variant: getPremiumMomentExperimentVariant(),
  recommended_package: moment.recommendedPackage || 'yearly',
  recovery_band: moment.recoveryBand || getRecoveryLoopPlan().riskBand || 'steady',
  primary_goal: moment.primaryGoal || getStoredPrimaryGoal(),
  ...(extra && typeof extra === 'object' ? extra : {}),
});

export const getPendingPremiumMoment = (): unknown => (
  storageService.getItem(STORAGE_KEYS.PREMIUM_MOMENT_PENDING, null)
);

export const clearPendingPremiumMoment = (): void => {
  storageService.removeItem(STORAGE_KEYS.PREMIUM_MOMENT_PENDING);
};

export const openPremiumMoment = (context: PremiumMomentContext = {}): PremiumMoment | null => {
  const moment = getPremiumMoment({
    ...context,
    config: context?.config || getCachedPremiumMomentsConfig() || DEFAULT_PREMIUM_MOMENTS_CONFIG,
  });
  if (!moment.showUpgrade) {
    return null;
  }

  storageService.setItem(STORAGE_KEYS.PREMIUM_MOMENT_PENDING, moment);

  try {
    useAppStore.getState().setActiveFeature('pro');
  } catch {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('openFeature', { detail: 'pro' }));
    }
  }

  return moment;
};

export const resolvePremiumMomentFromProps = (value: Record<string, unknown> = {}): Record<string, unknown> => {
  const pending = getPendingPremiumMoment();
  const merged = {
    ...(pending && typeof pending === 'object' ? pending : {}),
    ...(value && typeof value === 'object' ? value : {}),
  };
  logger.log('[PremiumMoment] Resolved moment', merged);
  return merged;
};

export default {
  getPremiumMoment,
  getPremiumMomentExperimentVariant,
  buildPremiumMomentAnalyticsPayload,
  getPendingPremiumMoment,
  clearPendingPremiumMoment,
  openPremiumMoment,
  resolvePremiumMomentFromProps,
};

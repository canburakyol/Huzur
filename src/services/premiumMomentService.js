import { STORAGE_KEYS } from '../constants';
import { getStoredPrimaryGoal } from '../utils/primaryGoal';
import { logger } from '../utils/logger';
import { getExperimentVariant } from './experimentService';
import { getRecoveryLoopPlan } from './recoveryLoopService';
import { storageService } from './storageService';
import { DEFAULT_PREMIUM_MOMENTS_CONFIG, getCachedPremiumMomentsConfig } from './premiumMomentConfigService';

const PREMIUM_SURFACES = new Set([
  'home_recovery_support',
  'weekly_report',
  'assistant_success',
  'onboarding_complete',
]);

const buildMomentCopy = (momentType, copyVariant) => {
  switch (copyVariant) {
    case 'weekly_depth':
      return {
        headline: 'Haftalik ozeti daha derin gor',
        description: 'Daha derin haftalik icgoru, sakin takip ve net sonraki adimlar Pro ile acilir.',
      };
    case 'family_rhythm':
      return {
        headline: 'Ailece ritim kuran akisi ac',
        description: 'Aile ritmini, ortak hedefleri ve daha derin rehberligi tek yerde toparla.',
      };
    case 'quiet_support':
      return {
        headline: 'Sessiz premium destegi ac',
        description: 'Zorlanan gunlerde daha sakin, kisisel ve derin bir destek katmani acabilirsin.',
      };
    case 'ai_guidance':
    default:
      return momentType === 'assistant_success'
        ? {
            headline: 'Daha derin AI rehberligi ac',
            description: 'Huzur Rehberi ile daha derin yonlendirmeler, takip odakli adimlar ve sakin premium destek al.',
          }
        : {
            headline: 'Daha derin rehberligi ac',
            description: 'AI rehberlik, haftalik icgoruler ve ritim destegiyle daha derin bir akisa gec.',
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
} = {}) => {
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
    headline = 'Aile ritmi icin Pro destegi ac';
    description = 'Aile hedefleri, haftalik derinlik ve sakin premium destek tek akista toplansin.';
  } else if (safeGoal === 'quran_learning') {
    headline = 'Kuran yolculugunu derinlestir';
    description = 'Daha derin haftalik ozetler ve rehberlik ile Kuran odagini daha sakin kur.';
  } else if (safeType === 'home_recovery_support' && ['at_risk', 'comeback'].includes(effectiveRecoveryBand)) {
    headline = 'Bugun icin daha derin destek ac';
    description = 'Ritmi yeniden kurarken tek basina kalma; sakin premium rehberlik katmanini ac.';
  } else if (safeType === 'weekly_report' && weeklyInsightState?.hasInsight) {
    headline = 'Haftalik ritmini daha net gor';
    description = 'Haftalik ozetinin ustune daha derin icgoruler ve aile ritmi onerileri eklenir.';
  } else if (safeType === 'assistant_success' && Number(assistantUsage) > 0) {
    headline = 'Rehberligi derinlestir';
    description = 'Daha uzun hafiza, daha derin takip ve sakin premium destek ile ilerle.';
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

export const getPremiumMomentExperimentVariant = () => (
  `${getExperimentVariant('paywall_value_stack_v1')}|${getExperimentVariant('paywall_cta_v1')}`
);

export const buildPremiumMomentAnalyticsPayload = (moment = {}, extra = {}) => ({
  source: moment.source || 'direct',
  moment_type: moment.momentType || 'assistant_success',
  experiment_variant: getPremiumMomentExperimentVariant(),
  recommended_package: moment.recommendedPackage || 'yearly',
  recovery_band: moment.recoveryBand || getRecoveryLoopPlan().riskBand || 'steady',
  primary_goal: moment.primaryGoal || getStoredPrimaryGoal(),
  ...(extra && typeof extra === 'object' ? extra : {}),
});

export const getPendingPremiumMoment = () => (
  storageService.getItem(STORAGE_KEYS.PREMIUM_MOMENT_PENDING, null)
);

export const clearPendingPremiumMoment = () => {
  storageService.removeItem(STORAGE_KEYS.PREMIUM_MOMENT_PENDING);
};

export const openPremiumMoment = (context = {}) => {
  const moment = getPremiumMoment({
    ...context,
    config: context?.config || getCachedPremiumMomentsConfig() || DEFAULT_PREMIUM_MOMENTS_CONFIG,
  });
  if (!moment.showUpgrade) {
    return null;
  }

  storageService.setItem(STORAGE_KEYS.PREMIUM_MOMENT_PENDING, moment);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('openFeature', { detail: 'pro' }));
  }

  return moment;
};

export const resolvePremiumMomentFromProps = (value = {}) => {
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

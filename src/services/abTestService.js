import { storageService } from './storageService';
import { logger } from '../utils/logger';
import { logEvent } from './analyticsService'; // Mevcut analitik servisi olduğunu varsayıyoruz

/**
 * A/B Test Stratejisi:
 * Kullanıcıları belirli test gruplarına (control, variant_a vb.) atar
 * ve bu atamayı local storage'da saklar. Gerçek bir senaryoda bu yapı
 * Firebase Remote Config veya PostHog gibi araçlarla senkronize çalışır.
 */

const AB_TEST_KEY_PREFIX = 'ab_test_';

export const EXPERIMENTS = {
  PAYWALL_REDESIGN: 'exp_paywall_redesign_v1',
  ONBOARDING_GOAL_STEP: 'exp_onboarding_goal_step_v1'
};

/**
 * Kullanıcıyı bir A/B testine dahil eder ve atanmış varyantı döndürür.
 * @param {string} experimentName - Test adı
 * @param {Array<string>} variants - Olası varyantlar (örn. ['control', 'variant_a'])
 * @param {Array<number>} weights - Her varyant için ağırlıklar (0-1 arası, toplamı 1 olmalı)
 * @returns {string} Atanan varyant adı
 */
export const getVariant = (experimentName, variants = ['control', 'variant'], weights = [0.5, 0.5]) => {
  if (!experimentName || variants.length === 0) return variants[0];
  
  const storageKey = `${AB_TEST_KEY_PREFIX}${experimentName}`;
  const existingVariant = storageService.getString(storageKey);

  if (existingVariant && variants.includes(existingVariant)) {
    return existingVariant;
  }

  // Yeni kullanıcı için rastgele varyant seçimi (Ağırlıklı seçim)
  const randomValue = Math.random();
  let cumulativeWeight = 0;
  let selectedVariant = variants[0];

  for (let i = 0; i < variants.length; i++) {
    cumulativeWeight += weights[i] || (1 / variants.length);
    if (randomValue <= cumulativeWeight) {
      selectedVariant = variants[i];
      break;
    }
  }

  // Varyantı sakla
  storageService.setString(storageKey, selectedVariant);
  
  // Analitik loglaması (Test başladı)
  logger.log(`[ABTest] User assigned to ${selectedVariant} for ${experimentName}`);
  try {
    logEvent('experiment_started', {
      experiment_name: experimentName,
      variant_name: selectedVariant
    });
  } catch (error) {
    logger.warn('[ABTest] Analytics log failed for experiment_started', error);
  }

  return selectedVariant;
};

/**
 * Belirli bir davranışın veya dönüşümün (conversion) gerçekleştiğini loglar.
 * @param {string} experimentName - İlgili test adı
 * @param {string} goalName - Gerçekleşen hedef (örn: 'purchased_pro', 'completed_onboarding')
 */
export const trackConversion = (experimentName, goalName) => {
  const storageKey = `${AB_TEST_KEY_PREFIX}${experimentName}`;
  const assignedVariant = storageService.getString(storageKey);

  if (!assignedVariant) {
    logger.warn(`[ABTest] User converted on ${experimentName} but is not in the experiment.`);
    return;
  }

  logger.log(`[ABTest] Conversion success: ${goalName} for ${experimentName} (Variant: ${assignedVariant})`);
  
  try {
    logEvent('experiment_conversion', {
      experiment_name: experimentName,
      variant_name: assignedVariant,
      goal_name: goalName
    });
  } catch (error) {
    logger.warn('[ABTest] Analytics log failed for experiment_conversion', error);
  }
};

export const clearExperiment = (experimentName) => {
  storageService.removeItem(`${AB_TEST_KEY_PREFIX}${experimentName}`);
};

export default {
  EXPERIMENTS,
  getVariant,
  trackConversion,
  clearExperiment
};

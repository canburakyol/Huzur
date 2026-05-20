import { storageService } from './storageService';
import { logger } from '../utils/logger';
import { logEvent } from './analyticsService';

const AB_TEST_KEY_PREFIX = 'ab_test_';

export const EXPERIMENTS = {
  PAYWALL_REDESIGN: 'exp_paywall_redesign_v1',
  ONBOARDING_GOAL_STEP: 'exp_onboarding_goal_step_v1'
} as const;

type ExperimentName = typeof EXPERIMENTS[keyof typeof EXPERIMENTS] | string;

export const getVariant = (experimentName: ExperimentName, variants: string[] = ['control', 'variant'], weights: number[] = [0.5, 0.5]): string => {
  if (!experimentName || variants.length === 0) return variants[0];
  
  const storageKey = `${AB_TEST_KEY_PREFIX}${experimentName}`;
  const existingVariant = storageService.getString(storageKey);

  if (existingVariant && variants.includes(existingVariant)) {
    return existingVariant;
  }

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

  storageService.setString(storageKey, selectedVariant);
  
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

export const trackConversion = (experimentName: ExperimentName, goalName: string): void => {
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

export const clearExperiment = (experimentName: ExperimentName): void => {
  storageService.removeItem(`${AB_TEST_KEY_PREFIX}${experimentName}`);
};

export default {
  EXPERIMENTS,
  getVariant,
  trackConversion,
  clearExperiment
};

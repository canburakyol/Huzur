import { getExperimentVariant } from './experimentService';
import { DEFAULT_ONBOARDING_CONFIG, normalizeOnboardingConfig } from './onboardingConfigService';

const buildStepOrderVariant = (steps = [], variant = 'A') => {
  if (variant !== 'B') {
    return steps;
  }

  const hasLanguage = steps.includes('language');
  const hasPermissions = steps.includes('permissions');
  const hasGoal = steps.includes('goal');

  if (!hasLanguage || !hasPermissions || !hasGoal) {
    return steps;
  }

  const remaining = steps.filter((step) => !['language', 'goal', 'permissions'].includes(step));
  return ['language', 'goal', 'permissions', ...remaining];
};

export const resolveOnboardingExperienceConfig = (
  config = DEFAULT_ONBOARDING_CONFIG,
  explicitVariants = {},
) => {
  const normalized = normalizeOnboardingConfig(config);
  const headlineExperimentVariant = explicitVariants.headlineVariant || getExperimentVariant('onboarding_headline_v1');
  const goalStepExperimentVariant = explicitVariants.goalStepVariant || getExperimentVariant('onboarding_goal_step_v1');

  const headlineVariant = headlineExperimentVariant === 'B'
    && normalized.headlineVariant === DEFAULT_ONBOARDING_CONFIG.headlineVariant
    ? 'direct'
    : normalized.headlineVariant;

  return {
    ...normalized,
    headlineVariant,
    steps: buildStepOrderVariant(normalized.steps, goalStepExperimentVariant),
    experimentContext: {
      onboardingHeadlineVariant: headlineExperimentVariant,
      onboardingGoalStepVariant: goalStepExperimentVariant,
      signature: `${headlineExperimentVariant}|${goalStepExperimentVariant}`,
    },
  };
};

export default {
  resolveOnboardingExperienceConfig,
};

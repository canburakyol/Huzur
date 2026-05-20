import { getExperimentVariant } from './experimentService';
import { DEFAULT_ONBOARDING_CONFIG, normalizeOnboardingConfig, OnboardingConfig } from './onboardingConfigService';

type ExperimentContext = {
  onboardingHeadlineVariant: string;
  onboardingGoalStepVariant: string;
  signature: string;
};

type ResolvedOnboardingConfig = OnboardingConfig & {
  experimentContext: ExperimentContext;
};

const buildStepOrderVariant = (steps: string[], variant: string): string[] => {
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
  config: Partial<OnboardingConfig> = DEFAULT_ONBOARDING_CONFIG,
  explicitVariants: Record<string, string> = {},
): ResolvedOnboardingConfig => {
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

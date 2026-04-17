import { describe, expect, it } from 'vitest';
import { resolveOnboardingExperienceConfig } from './onboardingExperienceService';

describe('onboardingExperienceService', () => {
  it('applies safe headline and step experiments on top of config', () => {
    const resolved = resolveOnboardingExperienceConfig({
      enabled: true,
      steps: ['language', 'permissions', 'goal'],
      headlineVariant: 'calm',
      permissionEmphasis: 'balanced',
    }, {
      headlineVariant: 'B',
      goalStepVariant: 'B',
    });

    expect(resolved.headlineVariant).toBe('direct');
    expect(resolved.steps).toEqual(['language', 'goal', 'permissions']);
    expect(resolved.experimentContext.signature).toBe('B|B');
  });

  it('preserves explicit config choices when experiments stay in control', () => {
    const resolved = resolveOnboardingExperienceConfig({
      enabled: true,
      steps: ['goal', 'language', 'permissions'],
      headlineVariant: 'direct',
    }, {
      headlineVariant: 'A',
      goalStepVariant: 'A',
    });

    expect(resolved.headlineVariant).toBe('direct');
    expect(resolved.steps).toEqual(['goal', 'language', 'permissions']);
    expect(resolved.experimentContext.signature).toBe('A|A');
  });
});

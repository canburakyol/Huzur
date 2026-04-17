import { describe, expect, it } from 'vitest';
import { DEFAULT_ONBOARDING_CONFIG, normalizeOnboardingConfig } from './onboardingConfigService';

describe('onboardingConfigService', () => {
  it('falls back to safe defaults when config is incomplete', () => {
    const config = normalizeOnboardingConfig({});

    expect(config).toEqual(DEFAULT_ONBOARDING_CONFIG);
  });

  it('sanitizes step order and keeps only known onboarding steps', () => {
    const config = normalizeOnboardingConfig({
      enabled: true,
      steps: ['goal', 'language', 'invalid_step', 'permissions', 'goal'],
      headlineVariant: 'direct',
      permissionEmphasis: 'notifications_first',
    });

    expect(config.enabled).toBe(true);
    expect(config.steps).toEqual(['goal', 'language', 'permissions']);
    expect(config.headlineVariant).toBe('direct');
    expect(config.permissionEmphasis).toBe('notifications_first');
  });
});

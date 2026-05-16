import { describe, expect, it } from 'vitest';
import { normalizeHomeExperienceConfig } from './homeExperienceConfigService';

describe('homeExperienceConfigService', () => {
  it('keeps the recovery layout as the default safe experience', () => {
    const config = normalizeHomeExperienceConfig({}, 'A');

    expect(config.variant).toBe('recovery_v1');
    expect(config.quickAccessEnabled).toBe(true);
    expect(config.recoveryCardEnabled).toBe(true);
    expect(config.aiRecommendationEnabled).toBe(true);
  });

  it('maps experiment B to a classic safe layout when remote config is empty', () => {
    const config = normalizeHomeExperienceConfig({}, 'B');

    expect(config.variant).toBe('classic_safe');
    expect(config.quickAccessEnabled).toBe(true);
    expect(config.recoveryCardEnabled).toBe(false);
    expect(config.aiRecommendationEnabled).toBe(false);
  });

  it('treats disabled remote config as a minimal kill-switch layout', () => {
    const config = normalizeHomeExperienceConfig({ enabled: false }, 'A');

    expect(config.variant).toBe('minimal_safe');
    expect(config.priorityCardEnabled).toBe(false);
    expect(config.featureGridEnabled).toBe(true);
    expect(config.dailyQuestsEnabled).toBe(true);
  });

  it('lets remote config override individual sections', () => {
    const config = normalizeHomeExperienceConfig({
      variant: 'recovery_v1',
      aiRecommendationEnabled: false,
      dailyContentEnabled: false,
    }, 'A');

    expect(config.variant).toBe('recovery_v1');
    expect(config.recoveryCardEnabled).toBe(true);
    expect(config.aiRecommendationEnabled).toBe(false);
    expect(config.dailyContentEnabled).toBe(false);
  });
});

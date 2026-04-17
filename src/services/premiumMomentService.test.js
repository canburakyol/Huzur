import { describe, expect, it } from 'vitest';
import { getPremiumMoment } from './premiumMomentService';

describe('premiumMomentService', () => {
  it('returns no upgrade moment for pro users', () => {
    const moment = getPremiumMoment({
      isPro: true,
      source: 'assistant',
      momentType: 'assistant_success',
    });

    expect(moment.showUpgrade).toBe(false);
    expect(moment.recommendedPackage).toBeNull();
  });

  it('builds a recovery-aware home premium moment for free users', () => {
    const moment = getPremiumMoment({
      isPro: false,
      source: 'home',
      momentType: 'home_recovery_support',
      recoveryBand: 'at_risk',
      primaryGoal: 'prayer_rhythm',
    });

    expect(moment.showUpgrade).toBe(true);
    expect(moment.source).toBe('home');
    expect(moment.momentType).toBe('home_recovery_support');
    expect(moment.recommendedPackage).toBe('monthly');
    expect(moment.recoveryBand).toBe('at_risk');
    expect(moment.headline.length).toBeGreaterThan(0);
  });
});

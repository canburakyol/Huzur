import { describe, expect, it } from 'vitest';
import { buildReferralTriggerSurfacePlan } from './referralTriggerSurfaceService';

describe('referralTriggerSurfaceService', () => {
  it('home yuzeyinde reward ready oldugunda plan uretir', () => {
    const plan = buildReferralTriggerSurfacePlan({
      surface: 'home',
      localProgress: {
        invitedByCode: 'HZR123',
        rewards: {
          inviteeUnlockedAt: new Date().toISOString(),
        },
      },
    });

    expect(plan).not.toBeNull();
    expect(plan.triggerId).toBe('reward_ready');
    expect(plan.entrySource).toBe('home_referral_trigger');
  });

  it('weekly report yuzeyinde iyi hafta momenti icin plan uretir', () => {
    const plan = buildReferralTriggerSurfacePlan({
      surface: 'weekly_report',
      localProgress: {},
      weeklyStats: {
        activeDays: 4,
        tasksCompleted: 5,
        xpEarned: 140,
      },
    });

    expect(plan).not.toBeNull();
    expect(plan.triggerId).toBe('weekly_momentum');
  });

  it('assistant yuzeyinde low confidence cevapta plan uretmez', () => {
    const plan = buildReferralTriggerSurfacePlan({
      surface: 'assistant',
      localProgress: {},
      assistantMeta: {
        answered: true,
        confidence: 'low',
      },
    });

    expect(plan).toBeNull();
  });
});

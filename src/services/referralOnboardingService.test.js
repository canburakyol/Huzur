import { describe, expect, it } from 'vitest';
import {
  buildReferralOnboardingAnalyticsPayload,
  buildReferralOnboardingPlan,
} from './referralOnboardingService';

describe('referralOnboardingService', () => {
  it('returns null for non-referred users', () => {
    expect(buildReferralOnboardingPlan({
      localProgress: {},
      serverSnapshot: {},
    })).toBeNull();
  });

  it('builds an active referred onboarding plan with remaining steps', () => {
    const plan = buildReferralOnboardingPlan({
      localProgress: {
        invitedByCode: 'HZRFRIEND1',
        inviteAcceptedAt: '2026-03-27T10:00:00.000Z',
      },
      serverSnapshot: {},
      currentStep: 'permissions',
      selectedGoal: 'family_consistency',
    });

    expect(plan).toMatchObject({
      invitedByCode: 'HZRFRIEND1',
      rewardReady: false,
      remainingCount: 2,
      completedCount: 1,
      badge: '2 kisa adim',
    });
    expect(plan.steps).toHaveLength(3);
  });

  it('builds a reward-ready plan and analytics payload', () => {
    const plan = buildReferralOnboardingPlan({
      localProgress: {
        invitedByCode: 'HZRFRIEND1',
        inviteAcceptedAt: '2026-03-27T10:00:00.000Z',
        onboardingCompletedAt: '2026-03-27T10:05:00.000Z',
        firstIbadahCompletedAt: '2026-03-27T10:10:00.000Z',
        rewards: {
          inviteeUnlockedAt: '2026-03-27T10:10:00.000Z',
        },
      },
      currentStep: 'goal',
      selectedGoal: 'prayer_rhythm',
    });

    expect(plan.rewardReady).toBe(true);
    expect(plan.badge).toBe('Odul acildi');

    const payload = buildReferralOnboardingAnalyticsPayload(plan, {
      step_name: 'goal',
    });

    expect(payload).toMatchObject({
      referred_user: true,
      referral_code: 'HZRFRIEND1',
      referral_reward_ready: true,
      step_name: 'goal',
    });
  });
});

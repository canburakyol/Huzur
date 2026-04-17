import { describe, expect, it } from 'vitest';
import {
  buildReferralAnalyticsPayload,
  buildReferralShareText,
  getReferralGrowthPlan,
  mergeReferralProgress,
} from './referralGrowthService';

describe('referralGrowthService', () => {
  it('merges server reward signals into local progress', () => {
    const merged = mergeReferralProgress(
      {
        ownCode: 'HZRLOCAL1',
        rewards: {
          inviterUnlockedAt: null,
          inviteeUnlockedAt: null,
        },
      },
      {
        inviterSummary: {
          ownCode: 'HZRLOCAL1',
          acceptedCount: 2,
          convertedCount: 1,
          latestInviterRewardAt: '2026-03-27T12:00:00.000Z',
        },
        inviteeSummary: {
          invitedByCode: 'HZRFRIEND1',
          inviteeRewardUnlockedAt: '2026-03-27T13:00:00.000Z',
        },
      }
    );

    expect(merged.rewards.inviterUnlockedAt).toBe('2026-03-27T12:00:00.000Z');
    expect(merged.rewards.inviteeUnlockedAt).toBe('2026-03-27T13:00:00.000Z');
    expect(merged.server.inviterSummary.convertedCount).toBe(1);
  });

  it('builds a blocked plan with waiting counts and campaign context', () => {
    const plan = getReferralGrowthPlan({
      localProgress: {
        ownCode: 'HZRLOCAL1',
        antiAbuse: {
          blockedUntil: '2099-03-27T14:00:00.000Z',
        },
      },
      serverSnapshot: {
        inviterSummary: {
          acceptedCount: 3,
          convertedCount: 1,
        },
      },
      shareVariant: 'C',
      campaign: {
        id: 'ramadan',
        region: 'TR',
        variant: 'local',
      },
    });

    expect(plan.riskState).toBe('blocked');
    expect(plan.waitingCount).toBe(2);
    expect(plan.shareLabel).toBe('Ritmi birlikte baslat');
    expect(plan.supportingNote).toContain('Ramazan');
  });

  it('builds a Turkish share text with code and link', () => {
    const result = buildReferralShareText({
      inviteCode: 'HZRLOCAL1',
      inviteUrl: 'https://huzur.app/invite/HZRLOCAL1',
      variant: 'B',
      lang: 'tr',
      campaign: { id: 'friday' },
    });

    expect(result.title).toBe('Huzur Daveti');
    expect(result.text).toContain('HZRLOCAL1');
    expect(result.text).toContain('https://huzur.app/invite/HZRLOCAL1');
    expect(result.text).toContain('Cuma bereketi');
  });

  it('builds analytics payloads with normalized counts', () => {
    const payload = buildReferralAnalyticsPayload({
      source: 'invite_modal',
      shareVariant: 'B',
      campaign: {
        id: 'evergreen',
        region: 'TR',
        variant: 'local',
      },
      riskState: 'healthy',
      convertedCount: 2,
      waitingCount: 1,
      cameFromInvite: true,
      inviteeRewardReady: true,
      inviterRewardReady: false,
    }, {
      referral_code: 'HZRLOCAL1',
    });

    expect(payload).toMatchObject({
      source: 'invite_modal',
      share_variant: 'B',
      converted_count: 2,
      waiting_count: 1,
      came_from_invite: true,
      invitee_reward_ready: true,
      inviter_reward_ready: false,
      referral_code: 'HZRLOCAL1',
    });
  });
});

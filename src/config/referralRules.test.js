import { describe, it, expect, vi, beforeEach } from 'vitest';
import { evaluateReferralRewardEligibility, isReferralRewardBlocked, REFERRAL_ANTI_ABUSE_RULES, REFERRAL_RULES } from '../config/referralRules';

describe('referralRules', () => {
  describe('REFERRAL_RULES', () => {
    it('should have invitee and inviter rules', () => {
      expect(REFERRAL_RULES.invitee).toBeDefined();
      expect(REFERRAL_RULES.inviter).toBeDefined();
    });

    it('invitee should require inviteAccepted, onboardingCompleted, firstIbadahCompleted', () => {
      expect(REFERRAL_RULES.invitee.requires).toContain('inviteAccepted');
      expect(REFERRAL_RULES.invitee.requires).toContain('onboardingCompleted');
      expect(REFERRAL_RULES.invitee.requires).toContain('firstIbadahCompleted');
    });

    it('inviter should require inviteCreated, inviteeConverted', () => {
      expect(REFERRAL_RULES.inviter.requires).toContain('inviteCreated');
      expect(REFERRAL_RULES.inviter.requires).toContain('inviteeConverted');
    });
  });

  describe('REFERRAL_ANTI_ABUSE_RULES', () => {
    it('should have reasonable time windows', () => {
      expect(REFERRAL_ANTI_ABUSE_RULES.minInviteAcceptanceIntervalMs).toBe(60 * 1000);
      expect(REFERRAL_ANTI_ABUSE_RULES.attemptWindowMs).toBe(10 * 60 * 1000);
      expect(REFERRAL_ANTI_ABUSE_RULES.maxAttemptsPerWindow).toBe(6);
      expect(REFERRAL_ANTI_ABUSE_RULES.maxUniqueCodesPerWindow).toBe(3);
    });
  });

  describe('isReferralRewardBlocked', () => {
    it('should return false when no block', () => {
      const state = { antiAbuse: { blockedUntil: null } };
      expect(isReferralRewardBlocked(state)).toBe(false);
    });

    it('should return false when block expired', () => {
      const pastDate = new Date(Date.now() - 1000).toISOString();
      const state = { antiAbuse: { blockedUntil: pastDate } };
      expect(isReferralRewardBlocked(state)).toBe(false);
    });

    it('should return true when block active', () => {
      const futureDate = new Date(Date.now() + 60000).toISOString();
      const state = { antiAbuse: { blockedUntil: futureDate } };
      expect(isReferralRewardBlocked(state)).toBe(true);
    });

    it('should handle empty state', () => {
      expect(isReferralRewardBlocked(null)).toBe(false);
      expect(isReferralRewardBlocked(undefined)).toBe(false);
      expect(isReferralRewardBlocked({})).toBe(false);
    });
  });

  describe('evaluateReferralRewardEligibility', () => {
    it('should return inviteeEligible true when all conditions met', () => {
      const state = {
        invitedByCode: 'HZR123',
        inviteAcceptedAt: new Date().toISOString(),
        onboardingCompletedAt: new Date().toISOString(),
        firstIbadahCompletedAt: new Date().toISOString(),
        antiAbuse: { blockedUntil: null }
      };
      const result = evaluateReferralRewardEligibility(state);
      expect(result.inviteeEligible).toBe(true);
    });

    it('should return inviteeEligible false when missing onboardingCompletedAt', () => {
      const state = {
        invitedByCode: 'HZR123',
        inviteAcceptedAt: new Date().toISOString(),
        onboardingCompletedAt: null,
        firstIbadahCompletedAt: new Date().toISOString(),
        antiAbuse: { blockedUntil: null }
      };
      const result = evaluateReferralRewardEligibility(state);
      expect(result.inviteeEligible).toBe(false);
    });

    it('should return inviterEligible true when all conditions met', () => {
      const state = {
        ownCode: 'HZR456',
        inviteCreatedAt: new Date().toISOString(),
        inviteeConvertedAt: new Date().toISOString(),
        antiAbuse: { blockedUntil: null }
      };
      const result = evaluateReferralRewardEligibility(state);
      expect(result.inviterEligible).toBe(true);
    });

    it('should return inviterEligible false when missing inviteeConvertedAt', () => {
      const state = {
        ownCode: 'HZR456',
        inviteCreatedAt: new Date().toISOString(),
        inviteeConvertedAt: null,
        antiAbuse: { blockedUntil: null }
      };
      const result = evaluateReferralRewardEligibility(state);
      expect(result.inviterEligible).toBe(false);
    });

    it('should return both false when reward blocked', () => {
      const futureDate = new Date(Date.now() + 60000).toISOString();
      const state = {
        ownCode: 'HZR456',
        inviteCreatedAt: new Date().toISOString(),
        inviteeConvertedAt: new Date().toISOString(),
        invitedByCode: 'HZR123',
        inviteAcceptedAt: new Date().toISOString(),
        onboardingCompletedAt: new Date().toISOString(),
        firstIbadahCompletedAt: new Date().toISOString(),
        antiAbuse: { blockedUntil: futureDate }
      };
      const result = evaluateReferralRewardEligibility(state);
      expect(result.inviteeEligible).toBe(false);
      expect(result.inviterEligible).toBe(false);
    });
  });
});

export const REFERRAL_RULES = {
  invitee: {
    rewardType: 'invitee_starter_pack',
    requires: ['inviteAccepted', 'onboardingCompleted', 'firstIbadahCompleted']
  },
  inviter: {
    rewardType: 'inviter_bonus_credit',
    requires: ['inviteCreated', 'inviteeConverted']
  }
};

export const REFERRAL_ANTI_ABUSE_RULES = {
  minInviteAcceptanceIntervalMs: 60 * 1000,
  attemptWindowMs: 10 * 60 * 1000,
  maxAttemptsPerWindow: 6,
  codeSwitchWindowMs: 24 * 60 * 60 * 1000,
  maxUniqueCodesPerWindow: 3,
  blockDurationMs: 30 * 60 * 1000
};

const parseTimestamp = (value) => {
  const parsed = Date.parse(value || '');
  return Number.isFinite(parsed) ? parsed : null;
};

export const isReferralRewardBlocked = (state, nowMs = Date.now()) => {
  const blockedUntilMs = parseTimestamp(state?.antiAbuse?.blockedUntil);
  return Boolean(blockedUntilMs && nowMs < blockedUntilMs);
};

export const evaluateReferralRewardEligibility = (state, nowMs = Date.now()) => {
  const safe = state || {};
  const rewardBlocked = isReferralRewardBlocked(safe, nowMs);

  const inviteeEligible = Boolean(
    !rewardBlocked &&
      safe.invitedByCode &&
      safe.inviteAcceptedAt &&
      safe.onboardingCompletedAt &&
      safe.firstIbadahCompletedAt
  );

  const inviterEligible = Boolean(
    !rewardBlocked &&
      safe.ownCode &&
      safe.inviteCreatedAt &&
      safe.inviteeConvertedAt
  );

  return {
    inviteeEligible,
    inviterEligible,
    rewardBlocked,
    rewardBlockedUntil: safe?.antiAbuse?.blockedUntil || null
  };
};

export default {
  REFERRAL_RULES,
  REFERRAL_ANTI_ABUSE_RULES,
  isReferralRewardBlocked,
  evaluateReferralRewardEligibility
};


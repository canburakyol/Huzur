export type ReferralRewardRules = {
  invitee: {
    rewardType: string;
    requires: string[];
  };
  inviter: {
    rewardType: string;
    requires: string[];
  };
}

export type ReferralAntiAbuseRules = {
  minInviteAcceptanceIntervalMs: number;
  attemptWindowMs: number;
  maxAttemptsPerWindow: number;
  codeSwitchWindowMs: number;
  maxUniqueCodesPerWindow: number;
  blockDurationMs: number;
}

export type ReferralAntiAbuseState = {
  blockedUntil?: string | null;
}

export type ReferralState = {
  invitedByCode?: string | null;
  inviteAcceptedAt?: string | null;
  onboardingCompletedAt?: string | null;
  firstIbadahCompletedAt?: string | null;
  ownCode?: string | null;
  inviteCreatedAt?: string | null;
  inviteeConvertedAt?: string | null;
  antiAbuse?: ReferralAntiAbuseState;
}

export type ReferralEligibilityResult = {
  inviteeEligible: boolean;
  inviterEligible: boolean;
  rewardBlocked: boolean;
  rewardBlockedUntil: string | null;
}

export const REFERRAL_RULES: ReferralRewardRules = {
  invitee: {
    rewardType: 'invitee_starter_pack',
    requires: ['inviteAccepted', 'onboardingCompleted', 'firstIbadahCompleted']
  },
  inviter: {
    rewardType: 'inviter_bonus_credit',
    requires: ['inviteCreated', 'inviteeConverted']
  }
};

export const REFERRAL_ANTI_ABUSE_RULES: ReferralAntiAbuseRules = {
  minInviteAcceptanceIntervalMs: 60 * 1000,
  attemptWindowMs: 10 * 60 * 1000,
  maxAttemptsPerWindow: 6,
  codeSwitchWindowMs: 24 * 60 * 60 * 1000,
  maxUniqueCodesPerWindow: 3,
  blockDurationMs: 30 * 60 * 1000
};

const parseTimestamp = (value: string | undefined | null): number | null => {
  const parsed = Date.parse(value || '');
  return Number.isFinite(parsed) ? parsed : null;
};

export const isReferralRewardBlocked = (state: ReferralState | undefined | null, nowMs: number = Date.now()): boolean => {
  const blockedUntilMs = parseTimestamp(state?.antiAbuse?.blockedUntil);
  return Boolean(blockedUntilMs && nowMs < blockedUntilMs);
};

export const evaluateReferralRewardEligibility = (state: ReferralState | undefined | null, nowMs: number = Date.now()): ReferralEligibilityResult => {
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

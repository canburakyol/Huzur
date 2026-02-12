import { buildInviteUrl } from '../config/deepLinkConfig';
import { analyticsService } from './analyticsService';
import { STORAGE_KEYS } from '../constants';
import { storageService } from './storageService';
import {
  evaluateReferralRewardEligibility,
  REFERRAL_ANTI_ABUSE_RULES,
  REFERRAL_RULES,
  isReferralRewardBlocked
} from '../config/referralRules';
import { getActiveCampaign } from './campaignService';

const REFERRAL_CODE_KEY = STORAGE_KEYS.REFERRAL_OWN_CODE;
const REFERRAL_STATE_KEY = STORAGE_KEYS.REFERRAL_STATE;

const createDefaultReferralState = () => ({
  ownCode: null,
  inviteCreatedAt: null,
  invitedByCode: null,
  inviteAcceptedAt: null,
  onboardingCompletedAt: null,
  firstIbadahCompletedAt: null,
  inviteeConvertedAt: null,
  rewards: {
    inviteeUnlockedAt: null,
    inviterUnlockedAt: null
  },
  antiAbuse: {
    attemptCount: 0,
    attemptsWindowStartedAt: null,
    blockedUntil: null,
    lastAcceptedAt: null,
    recentAcceptedCodes: [],
    suspiciousFlags: []
  }
});

const nowIso = () => new Date().toISOString();

const getReferralState = () => {
  const defaultReferralState = createDefaultReferralState();
  const saved = storageService.getItem(REFERRAL_STATE_KEY, null);
  if (!saved || typeof saved !== 'object') {
    return defaultReferralState;
  }

  return {
    ...defaultReferralState,
    ...saved,
    rewards: {
      ...defaultReferralState.rewards,
      ...(saved.rewards || {})
    }
  };
};

const saveReferralState = (state) => {
  storageService.setItem(REFERRAL_STATE_KEY, state);
  return state;
};

const getNow = () => Date.now();

const sanitizeIso = (value) => {
  const parsed = Date.parse(value || '');
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null;
};

const normalizeRecentCodes = (codes) => {
  if (!Array.isArray(codes)) return [];

  return codes
    .filter((entry) => entry && typeof entry === 'object' && typeof entry.code === 'string' && entry.code.trim())
    .map((entry) => ({
      code: entry.code.trim().toUpperCase(),
      acceptedAt: sanitizeIso(entry.acceptedAt)
    }))
    .filter((entry) => Boolean(entry.acceptedAt));
};

const normalizeSuspiciousFlags = (flags) => {
  if (!Array.isArray(flags)) return [];

  return flags
    .filter((flag) => flag && typeof flag === 'object' && typeof flag.reason === 'string')
    .map((flag) => ({
      reason: flag.reason,
      flaggedAt: sanitizeIso(flag.flaggedAt) || nowIso(),
      metadata: flag.metadata && typeof flag.metadata === 'object' ? flag.metadata : {}
    }));
};

const ensureAntiAbuseState = (state) => {
  const defaultReferralState = createDefaultReferralState();
  const safe = state || {};
  const antiAbuse = safe.antiAbuse || {};

  return {
    ...safe,
    antiAbuse: {
      ...defaultReferralState.antiAbuse,
      ...antiAbuse,
      recentAcceptedCodes: normalizeRecentCodes(antiAbuse.recentAcceptedCodes),
      suspiciousFlags: normalizeSuspiciousFlags(antiAbuse.suspiciousFlags),
      blockedUntil: sanitizeIso(antiAbuse.blockedUntil),
      attemptsWindowStartedAt: sanitizeIso(antiAbuse.attemptsWindowStartedAt),
      lastAcceptedAt: sanitizeIso(antiAbuse.lastAcceptedAt)
    }
  };
};

const parseMs = (value) => {
  const parsed = Date.parse(value || '');
  return Number.isFinite(parsed) ? parsed : null;
};

const addSuspiciousFlag = (state, reason, metadata = {}) => {
  const safe = ensureAntiAbuseState(state);
  const next = {
    ...safe,
    antiAbuse: {
      ...safe.antiAbuse,
      suspiciousFlags: [
        ...safe.antiAbuse.suspiciousFlags,
        {
          reason,
          flaggedAt: nowIso(),
          metadata
        }
      ].slice(-20)
    }
  };

  analyticsService.logReferralAbuseFlagged(reason, 'medium', metadata);
  return next;
};

const resetWindowIfNeeded = (antiAbuse, nowMs) => {
  const startedAtMs = parseMs(antiAbuse.attemptsWindowStartedAt);
  if (!startedAtMs || nowMs - startedAtMs > REFERRAL_ANTI_ABUSE_RULES.attemptWindowMs) {
    return {
      ...antiAbuse,
      attemptCount: 0,
      attemptsWindowStartedAt: new Date(nowMs).toISOString()
    };
  }

  return antiAbuse;
};

const pruneRecentAcceptedCodes = (codes, nowMs) => {
  const threshold = nowMs - REFERRAL_ANTI_ABUSE_RULES.codeSwitchWindowMs;
  return normalizeRecentCodes(codes).filter((entry) => {
    const acceptedAtMs = parseMs(entry.acceptedAt);
    return acceptedAtMs && acceptedAtMs >= threshold;
  });
};

const buildBlockedResult = (state, reason, source, referralCode) => {
  const blockedUntil = state?.antiAbuse?.blockedUntil || null;

  analyticsService.logReferralAttemptBlocked(referralCode, reason, source, blockedUntil);

  return {
    status: 'blocked',
    reason,
    blockedUntil,
    state
  };
};

const maybeUnlockRewards = (state) => {
  const normalizedState = ensureAntiAbuseState(state);
  const eligibility = evaluateReferralRewardEligibility(normalizedState);
  const next = {
    ...normalizedState,
    rewards: {
      ...normalizedState.rewards
    }
  };

  if (eligibility.inviteeEligible && !next.rewards.inviteeUnlockedAt) {
    next.rewards.inviteeUnlockedAt = nowIso();
    analyticsService.logReferralRewardUnlocked(next.invitedByCode, REFERRAL_RULES.invitee.rewardType);
  }

  if (eligibility.inviterEligible && !next.rewards.inviterUnlockedAt) {
    next.rewards.inviterUnlockedAt = nowIso();
    analyticsService.logReferralRewardUnlocked(next.ownCode, REFERRAL_RULES.inviter.rewardType);
  }

  return next;
};

const generateReferralCode = () => {
  // Use cryptographically secure random bytes instead of Math.random()
  const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const CODE_LENGTH = 6;
  const randomBytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(randomBytes);
  const seed = Array.from(randomBytes)
    .map(b => CHARSET[b % CHARSET.length])
    .join('');
  return `HZR${seed}`;
};

const normalizeReferralCode = (code) => (code || '').trim().toUpperCase();

const shouldFlagRapidAcceptance = (antiAbuse, nowMs) => {
  const lastAcceptedAtMs = parseMs(antiAbuse.lastAcceptedAt);
  if (!lastAcceptedAtMs) return false;

  return nowMs - lastAcceptedAtMs < REFERRAL_ANTI_ABUSE_RULES.minInviteAcceptanceIntervalMs;
};

const shouldBlockByCodeSwitching = (recentAcceptedCodes) => {
  const uniqueCodeCount = new Set(recentAcceptedCodes.map((entry) => entry.code)).size;
  return uniqueCodeCount > REFERRAL_ANTI_ABUSE_RULES.maxUniqueCodesPerWindow;
};

const markBlocked = (state, nowMs) => {
  const blockedUntilMs = nowMs + REFERRAL_ANTI_ABUSE_RULES.blockDurationMs;
  return {
    ...state,
    antiAbuse: {
      ...state.antiAbuse,
      blockedUntil: new Date(blockedUntilMs).toISOString()
    }
  };
};

export const getOrCreateReferralCode = () => {
  const existing = storageService.getString(REFERRAL_CODE_KEY, '');
  if (existing) return existing;

  const code = generateReferralCode();
  storageService.setString(REFERRAL_CODE_KEY, code);

  const state = getReferralState();
  saveReferralState({
    ...state,
    ownCode: code
  });

  return code;
};

export const createInviteLink = ({ source = 'app_share', campaign = 'evergreen', lang = 'tr' } = {}) => {
  const code = getOrCreateReferralCode();
  const activeCampaign = getActiveCampaign();
  const effectiveCampaign = campaign || activeCampaign.id;
  const effectiveLang = lang || (activeCampaign.variant === 'diaspora' ? 'en' : 'tr');
  const inviteUrl = buildInviteUrl({ code, source, campaign: effectiveCampaign, lang: effectiveLang });

  const state = ensureAntiAbuseState(getReferralState());
  saveReferralState({
    ...state,
    ownCode: code,
    inviteCreatedAt: state.inviteCreatedAt || nowIso()
  });

  analyticsService.logEvent('invite_created', {
    referral_code: code,
    source,
    campaign: effectiveCampaign,
    lang: effectiveLang,
    campaign_region: activeCampaign.region,
    campaign_variant: activeCampaign.variant
  });

  return {
    code,
    inviteUrl
  };
};

const readReferralCodeFromLocation = () => {
  try {
    const currentUrl = new URL(window.location.href);
    const pathParts = currentUrl.pathname.split('/').filter(Boolean);
    const invitePathIndex = pathParts.findIndex((p) => p === 'invite');
    const pathCode = invitePathIndex >= 0 ? pathParts[invitePathIndex + 1] : null;
    const queryCode = currentUrl.searchParams.get('ref');
    return (pathCode || queryCode || '').trim().toUpperCase() || null;
  } catch {
    return null;
  }
};

export const captureInviteAcceptanceFromUrl = ({ source = 'deep_link' } = {}) => {
  const referralCode = normalizeReferralCode(readReferralCodeFromLocation());
  if (!referralCode) return null;

  const ownCode = storageService.getString(REFERRAL_CODE_KEY, '');
  if (normalizeReferralCode(ownCode) === referralCode) {
    return {
      status: 'ignored',
      reason: 'self_referral',
      state: ensureAntiAbuseState(getReferralState())
    };
  }

  const nowMs = getNow();
  const initialState = ensureAntiAbuseState(getReferralState());

  if (isReferralRewardBlocked(initialState, nowMs)) {
    return buildBlockedResult(initialState, 'reward_block_active', source, referralCode);
  }

  const antiAbuse = resetWindowIfNeeded(initialState.antiAbuse, nowMs);
  const attemptedState = {
    ...initialState,
    antiAbuse: {
      ...antiAbuse,
      attemptCount: Math.max(0, antiAbuse.attemptCount) + 1
    }
  };

  if (attemptedState.antiAbuse.attemptCount > REFERRAL_ANTI_ABUSE_RULES.maxAttemptsPerWindow) {
    const blockedState = markBlocked(attemptedState, nowMs);
    const flaggedState = addSuspiciousFlag(blockedState, 'too_many_referral_attempts', {
      source,
      referral_code: referralCode,
      attempt_count: attemptedState.antiAbuse.attemptCount
    });

    const savedBlockedState = saveReferralState(flaggedState);
    return buildBlockedResult(savedBlockedState, 'too_many_referral_attempts', source, referralCode);
  }

  const recentAcceptedCodes = pruneRecentAcceptedCodes(attemptedState.antiAbuse.recentAcceptedCodes, nowMs);
  const candidateRecentCodes = [...recentAcceptedCodes, { code: referralCode, acceptedAt: nowIso() }];

  let nextState = {
    ...attemptedState,
    antiAbuse: {
      ...attemptedState.antiAbuse,
      recentAcceptedCodes: candidateRecentCodes,
      lastAcceptedAt: nowIso()
    }
  };

  if (shouldFlagRapidAcceptance(initialState.antiAbuse, nowMs)) {
    nextState = addSuspiciousFlag(nextState, 'rapid_referral_acceptance', {
      source,
      referral_code: referralCode,
      min_interval_ms: REFERRAL_ANTI_ABUSE_RULES.minInviteAcceptanceIntervalMs
    });
  }

  if (shouldBlockByCodeSwitching(candidateRecentCodes)) {
    const blockedState = markBlocked(nextState, nowMs);
    const flaggedState = addSuspiciousFlag(blockedState, 'too_many_unique_referral_codes', {
      source,
      referral_code: referralCode,
      unique_code_count: new Set(candidateRecentCodes.map((entry) => entry.code)).size,
      max_unique_codes: REFERRAL_ANTI_ABUSE_RULES.maxUniqueCodesPerWindow
    });

    const savedBlockedState = saveReferralState(flaggedState);
    return buildBlockedResult(savedBlockedState, 'too_many_unique_referral_codes', source, referralCode);
  }

  if (!initialState.inviteAcceptedAt || initialState.invitedByCode !== referralCode) {
    nextState = {
      ...nextState,
      invitedByCode: referralCode,
      inviteAcceptedAt: nowIso()
    };

    const savedState = saveReferralState(nextState);

    analyticsService.logInviteAccepted(referralCode, source);
    return {
      status: 'captured',
      reason: null,
      blockedUntil: savedState.antiAbuse.blockedUntil,
      state: savedState
    };
  }

  const savedState = saveReferralState(nextState);
  return {
    status: 'unchanged',
    reason: 'same_referral_code',
    blockedUntil: savedState.antiAbuse.blockedUntil,
    state: savedState
  };
};

export const markOnboardingCompletedForReferral = () => {
  const state = ensureAntiAbuseState(getReferralState());
  if (!state.invitedByCode) return state;

  const updated = {
    ...state,
    onboardingCompletedAt: state.onboardingCompletedAt || nowIso()
  };

  return saveReferralState(maybeUnlockRewards(updated));
};

export const markFirstIbadahCompletedForReferral = () => {
  const state = ensureAntiAbuseState(getReferralState());

  const updated = {
    ...state,
    firstIbadahCompletedAt: state.firstIbadahCompletedAt || nowIso()
  };

  return saveReferralState(maybeUnlockRewards(updated));
};

export const markInviteeConvertedForInviter = () => {
  const state = ensureAntiAbuseState(getReferralState());
  if (!state.ownCode) return state;

  const updated = {
    ...state,
    inviteeConvertedAt: state.inviteeConvertedAt || nowIso()
  };

  return saveReferralState(maybeUnlockRewards(updated));
};

export const getReferralProgress = () => {
  const state = ensureAntiAbuseState(getReferralState());
  const eligibility = evaluateReferralRewardEligibility(state);
  return {
    ...state,
    ...eligibility,
    antiAbuse: {
      ...state.antiAbuse,
      suspiciousFlags: [...state.antiAbuse.suspiciousFlags]
    },
    inviteeRewardType: REFERRAL_RULES.invitee.rewardType,
    inviterRewardType: REFERRAL_RULES.inviter.rewardType
  };
};

export default {
  getOrCreateReferralCode,
  createInviteLink,
  captureInviteAcceptanceFromUrl,
  markOnboardingCompletedForReferral,
  markFirstIbadahCompletedForReferral,
  markInviteeConvertedForInviter,
  getReferralProgress
};

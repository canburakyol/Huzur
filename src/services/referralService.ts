import { buildInviteUrl } from '../config/deepLinkConfig';
import { analyticsService } from './analyticsService';
import { STORAGE_KEYS } from '../constants';
import { storageService } from './storageService';
import { logger } from '../utils/logger';
import {
  evaluateReferralRewardEligibility,
  REFERRAL_ANTI_ABUSE_RULES,
  REFERRAL_RULES,
  isReferralRewardBlocked
} from '../config/referralRules';
import { getActiveCampaign } from './campaignService';
import { syncReferralState } from './referralServerService';

interface AntiAbuseState {
  attemptCount: number;
  attemptsWindowStartedAt: string | null;
  blockedUntil: string | null;
  lastAcceptedAt: string | null;
  recentAcceptedCodes: Array<{ code: string; acceptedAt: string | null }>;
  suspiciousFlags: Array<{ reason: string; flaggedAt: string; metadata: Record<string, unknown> }>;
}

interface ReferralRewards {
  inviteeUnlockedAt: string | null;
  inviterUnlockedAt: string | null;
}

interface ReferralState {
  ownCode: string | null;
  inviteCreatedAt: string | null;
  invitedByCode: string | null;
  inviteAcceptedAt: string | null;
  onboardingCompletedAt: string | null;
  firstIbadahCompletedAt: string | null;
  inviteeConvertedAt: string | null;
  rewards: ReferralRewards;
  antiAbuse: AntiAbuseState;
}

interface CaptureResult {
  status: string;
  reason: string | null;
  blockedUntil: string | null;
  state: ReferralState;
}

interface InviteLinkOptions {
  source?: string;
  campaign?: string;
  lang?: string;
}

interface InviteLinkResult {
  code: string;
  inviteUrl: string;
}

interface ReferralProgressResult extends ReferralState {
  inviteeEligible?: boolean;
  inviterEligible?: boolean;
  inviteeRewardType: string;
  inviterRewardType: string;
}

const REFERRAL_CODE_KEY = STORAGE_KEYS.REFERRAL_OWN_CODE;
const REFERRAL_STATE_KEY = STORAGE_KEYS.REFERRAL_STATE;

const createDefaultReferralState = (): ReferralState => ({
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

const syncReferralStateInBackground = (state: ReferralState, source = 'runtime'): void => {
  syncReferralState(state as Record<string, unknown>, { source }).catch((error: Error) => {
    logger.error('[ReferralService] syncReferralStateInBackground failed', { source, error });
  });
};

const nowIso = (): string => new Date().toISOString();

const getReferralState = (): ReferralState => {
  const defaultReferralState = createDefaultReferralState();
  const saved = storageService.getItem<Partial<ReferralState>>(REFERRAL_STATE_KEY, null);
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
  } as ReferralState;
};

const saveReferralState = (state: ReferralState): ReferralState => {
  storageService.setItem(REFERRAL_STATE_KEY, state);
  return state;
};

const getNow = (): number => Date.now();

const sanitizeIso = (value: string | null | undefined): string | null => {
  const parsed = Date.parse(value || '');
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null;
};

const normalizeRecentCodes = (codes: unknown): Array<{ code: string; acceptedAt: string | null }> => {
  if (!Array.isArray(codes)) return [];

  return (codes as Array<{ code: string; acceptedAt: string }>)
    .filter((entry) => entry && typeof entry === 'object' && typeof entry.code === 'string' && entry.code.trim())
    .map((entry) => ({
      code: entry.code.trim().toUpperCase(),
      acceptedAt: sanitizeIso(entry.acceptedAt)
    }))
    .filter((entry) => Boolean(entry.acceptedAt));
};

const normalizeSuspiciousFlags = (flags: unknown): Array<{ reason: string; flaggedAt: string; metadata: Record<string, unknown> }> => {
  if (!Array.isArray(flags)) return [];

  return (flags as Array<{ reason: string; flaggedAt: string; metadata: Record<string, unknown> }>)
    .filter((flag) => flag && typeof flag === 'object' && typeof flag.reason === 'string')
    .map((flag) => ({
      reason: flag.reason,
      flaggedAt: sanitizeIso(flag.flaggedAt) || nowIso(),
      metadata: flag.metadata && typeof flag.metadata === 'object' ? flag.metadata : {}
    }));
};

const ensureAntiAbuseState = (state: Partial<ReferralState> | null): ReferralState => {
  const defaultReferralState = createDefaultReferralState();
  const safe = state || {};
  const antiAbuse = (safe.antiAbuse || {}) as Partial<AntiAbuseState>;

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
  } as ReferralState;
};

const parseMs = (value: string | null | undefined): number | null => {
  const parsed = Date.parse(value || '');
  return Number.isFinite(parsed) ? parsed : null;
};

const addSuspiciousFlag = (state: Partial<ReferralState>, reason: string, metadata: Record<string, unknown> = {}): ReferralState => {
  const safe = ensureAntiAbuseState(state);
  const next: ReferralState = {
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
      ].slice(-20) as Array<{ reason: string; flaggedAt: string; metadata: Record<string, unknown> }>
    }
  };

  analyticsService.logReferralAbuseFlagged(reason, 'medium', metadata);
  return next;
};

const resetWindowIfNeeded = (antiAbuse: AntiAbuseState, nowMs: number): AntiAbuseState => {
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

const pruneRecentAcceptedCodes = (codes: unknown, nowMs: number): Array<{ code: string; acceptedAt: string | null }> => {
  const threshold = nowMs - REFERRAL_ANTI_ABUSE_RULES.codeSwitchWindowMs;
  return normalizeRecentCodes(codes).filter((entry) => {
    const acceptedAtMs = parseMs(entry.acceptedAt);
    return acceptedAtMs && acceptedAtMs >= threshold;
  });
};

const buildBlockedResult = (state: ReferralState | null, reason: string, source: string, referralCode: string): CaptureResult => {
  const blockedUntil = state?.antiAbuse?.blockedUntil || null;

  analyticsService.logReferralAttemptBlocked(referralCode, reason, source, blockedUntil);

  return {
    status: 'blocked',
    reason,
    blockedUntil,
    state: state as ReferralState
  };
};

const maybeUnlockRewards = (state: ReferralState): ReferralState => {
  const normalizedState = ensureAntiAbuseState(state);
  const eligibility = evaluateReferralRewardEligibility(normalizedState);
  const next: ReferralState = {
    ...normalizedState,
    rewards: {
      ...normalizedState.rewards
    }
  };

  if (eligibility.inviteeEligible && !next.rewards.inviteeUnlockedAt) {
    next.rewards.inviteeUnlockedAt = nowIso();
    analyticsService.logReferralRewardUnlocked(next.invitedByCode || '', REFERRAL_RULES.invitee.rewardType);
  }

  if (eligibility.inviterEligible && !next.rewards.inviterUnlockedAt) {
    next.rewards.inviterUnlockedAt = nowIso();
    analyticsService.logReferralRewardUnlocked(next.ownCode || '', REFERRAL_RULES.inviter.rewardType);
  }

  return next;
};

const generateReferralCode = (): string => {
  const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const CODE_LENGTH = 6;
  const randomBytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(randomBytes);
  const seed = Array.from(randomBytes)
    .map(b => CHARSET[b % CHARSET.length])
    .join('');
  return `HZR${seed}`;
};

const normalizeReferralCode = (code: string | null | undefined): string => {
  const normalized = (code || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  return /^HZR[A-Z0-9]{6}$/.test(normalized) ? normalized : '';
};

const shouldFlagRapidAcceptance = (antiAbuse: AntiAbuseState, nowMs: number): boolean => {
  const lastAcceptedAtMs = parseMs(antiAbuse.lastAcceptedAt);
  if (!lastAcceptedAtMs) return false;

  return nowMs - lastAcceptedAtMs < REFERRAL_ANTI_ABUSE_RULES.minInviteAcceptanceIntervalMs;
};

const shouldBlockByCodeSwitching = (recentAcceptedCodes: Array<{ code: string; acceptedAt: string | null }>): boolean => {
  const uniqueCodeCount = new Set(recentAcceptedCodes.map((entry) => entry.code)).size;
  return uniqueCodeCount > REFERRAL_ANTI_ABUSE_RULES.maxUniqueCodesPerWindow;
};

const markBlocked = (state: ReferralState, nowMs: number): ReferralState => {
  const blockedUntilMs = nowMs + REFERRAL_ANTI_ABUSE_RULES.blockDurationMs;
  return {
    ...state,
    antiAbuse: {
      ...state.antiAbuse,
      blockedUntil: new Date(blockedUntilMs).toISOString()
    }
  };
};

export const getOrCreateReferralCode = (): string => {
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

export const createInviteLink = ({ source = 'app_share', campaign = 'evergreen', lang = 'tr' }: InviteLinkOptions = {}): InviteLinkResult => {
  const code = getOrCreateReferralCode();
  const activeCampaign = getActiveCampaign();
  const effectiveCampaign = campaign || activeCampaign?.id;
  const effectiveLang = lang || (activeCampaign?.variant === 'diaspora' ? 'en' : 'tr');
  const inviteUrl = buildInviteUrl({ code, source, campaign: effectiveCampaign, lang: effectiveLang });

  const state = ensureAntiAbuseState(getReferralState());
  const savedState = saveReferralState({
    ...state,
    ownCode: code,
    inviteCreatedAt: state.inviteCreatedAt || nowIso()
  });

  analyticsService.logInviteCreated(code, source, effectiveCampaign, effectiveLang, {
    campaign_region: activeCampaign?.region,
    campaign_variant: activeCampaign?.variant
  });
  syncReferralStateInBackground(savedState, source);

  return {
    code,
    inviteUrl
  };
};

const isAllowedInviteUrl = (url: URL): boolean => {
  if (url.protocol === 'huzur:') {
    return url.hostname === 'invite';
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return false;
  }

  const currentHost = window.location.hostname.toLowerCase();
  const host = url.hostname.toLowerCase();
  return host === currentHost || host === 'canburakyol.github.io' || host === 'play.google.com';
};

const readReferralCodeFromUrl = (rawUrl?: string | null): string | null => {
  try {
    const currentUrl = new URL(rawUrl || window.location.href, window.location.href);
    if (!isAllowedInviteUrl(currentUrl)) {
      return null;
    }

    const pathParts = currentUrl.pathname.split('/').filter(Boolean);
    const invitePathIndex = pathParts.findIndex((p) => p.toLowerCase() === 'invite');
    const pathCode = currentUrl.protocol === 'huzur:'
      ? pathParts[0]
      : invitePathIndex >= 0
        ? pathParts[invitePathIndex + 1]
        : null;
    const queryCode = currentUrl.searchParams.get('ref');
    return normalizeReferralCode(pathCode || queryCode) || null;
  } catch (error) {
    logger.error('[ReferralService] extractReferralCodeFromUrl failed', error);
    return null;
  }
};

export const captureInviteAcceptanceFromCode = (referralCodeInput: string, { source = 'deep_link' }: { source?: string } = {}): CaptureResult | null => {
  const referralCode = normalizeReferralCode(referralCodeInput);
  if (!referralCode) return null;

  const ownCode = storageService.getString(REFERRAL_CODE_KEY, '');
  if (normalizeReferralCode(ownCode) === referralCode) {
    return {
      status: 'ignored',
      reason: 'self_referral',
      blockedUntil: null,
      state: ensureAntiAbuseState(getReferralState())
    };
  }

  const nowMs = getNow();
  const initialState = ensureAntiAbuseState(getReferralState());

  if (isReferralRewardBlocked(initialState, nowMs)) {
    return buildBlockedResult(initialState, 'reward_block_active', source, referralCode);
  }

  const antiAbuse = resetWindowIfNeeded(initialState.antiAbuse, nowMs);
  const attemptedState: ReferralState = {
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

  let nextState: ReferralState = {
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
    syncReferralStateInBackground(savedState, source);

    analyticsService.logInviteAccepted(referralCode, source);
    return {
      status: 'captured',
      reason: null,
      blockedUntil: savedState.antiAbuse.blockedUntil,
      state: savedState
    };
  }

  const savedState = saveReferralState(nextState);
  syncReferralStateInBackground(savedState, source);
  return {
    status: 'unchanged',
    reason: 'same_referral_code',
    blockedUntil: savedState.antiAbuse.blockedUntil,
    state: savedState
  };
};

export const captureInviteAcceptanceFromUrl = ({ source = 'deep_link', url }: { source?: string; url?: string | null } = {}): CaptureResult | null => {
  return captureInviteAcceptanceFromCode(readReferralCodeFromUrl(url), { source });
};

export const markOnboardingCompletedForReferral = (): ReferralState => {
  const state = ensureAntiAbuseState(getReferralState());
  if (!state.invitedByCode) return state;

  const updated: ReferralState = {
    ...state,
    onboardingCompletedAt: state.onboardingCompletedAt || nowIso()
  };

  const savedState = saveReferralState(maybeUnlockRewards(updated));
  syncReferralStateInBackground(savedState, 'onboarding_completed');
  return savedState;
};

export const markFirstIbadahCompletedForReferral = (): ReferralState => {
  const state = ensureAntiAbuseState(getReferralState());

  const updated: ReferralState = {
    ...state,
    firstIbadahCompletedAt: state.firstIbadahCompletedAt || nowIso()
  };

  const savedState = saveReferralState(maybeUnlockRewards(updated));
  syncReferralStateInBackground(savedState, 'first_ibadah_completed');
  return savedState;
};

export const markInviteeConvertedForInviter = (): ReferralState => {
  const state = ensureAntiAbuseState(getReferralState());
  if (!state.ownCode) return state;

  const updated: ReferralState = {
    ...state,
    inviteeConvertedAt: state.inviteeConvertedAt || nowIso()
  };

  return saveReferralState(maybeUnlockRewards(updated));
};

export const getReferralProgress = (): ReferralProgressResult => {
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
  captureInviteAcceptanceFromCode,
  captureInviteAcceptanceFromUrl,
  markOnboardingCompletedForReferral,
  markFirstIbadahCompletedForReferral,
  markInviteeConvertedForInviter,
  getReferralProgress
};

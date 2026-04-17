import { getCurrentUserIdEnsured } from './authService';
import { getFunctionsInstance } from './firebase';
import { logger } from '../utils/logger';

const SYNC_THROTTLE_MS = 30_000;

let lastSyncSignature = '';
let lastSyncAt = 0;

const sanitizeIso = (value) => {
  const parsed = Date.parse(value || '');
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null;
};

const normalizeSummary = (summary = {}) => ({
  ownCode: typeof summary?.ownCode === 'string' ? summary.ownCode.trim().toUpperCase() : '',
  inviteCreatedAt: sanitizeIso(summary?.inviteCreatedAt),
  acceptedCount: Math.max(0, Number(summary?.acceptedCount) || 0),
  onboardingCompletedCount: Math.max(0, Number(summary?.onboardingCompletedCount) || 0),
  firstIbadahCompletedCount: Math.max(0, Number(summary?.firstIbadahCompletedCount) || 0),
  convertedCount: Math.max(0, Number(summary?.convertedCount) || 0),
  rewardUnlockedCount: Math.max(0, Number(summary?.rewardUnlockedCount) || 0),
  latestInviterRewardAt: sanitizeIso(summary?.latestInviterRewardAt),
});

const normalizeInviteeSummary = (summary = {}) => ({
  invitedByCode: typeof summary?.invitedByCode === 'string' ? summary.invitedByCode.trim().toUpperCase() : '',
  inviteAcceptedAt: sanitizeIso(summary?.inviteAcceptedAt),
  onboardingCompletedAt: sanitizeIso(summary?.onboardingCompletedAt),
  firstIbadahCompletedAt: sanitizeIso(summary?.firstIbadahCompletedAt),
  inviteeRewardUnlockedAt: sanitizeIso(summary?.inviteeRewardUnlockedAt),
  inviterId: typeof summary?.inviterId === 'string' ? summary.inviterId : '',
  syncIssue: typeof summary?.syncIssue === 'string' ? summary.syncIssue : '',
});

const normalizeSnapshot = (snapshot = {}) => ({
  inviterSummary: normalizeSummary(snapshot?.inviterSummary),
  inviteeSummary: normalizeInviteeSummary(snapshot?.inviteeSummary),
});

const buildSyncPayload = (progress = {}, source = 'runtime') => ({
  source,
  ownCode: progress?.ownCode || '',
  inviteCreatedAt: progress?.inviteCreatedAt || null,
  invitedByCode: progress?.invitedByCode || '',
  inviteAcceptedAt: progress?.inviteAcceptedAt || null,
  onboardingCompletedAt: progress?.onboardingCompletedAt || null,
  firstIbadahCompletedAt: progress?.firstIbadahCompletedAt || null,
});

const callReferralFunction = async (name, payload = {}) => {
  const { httpsCallable } = await import('firebase/functions');
  const functions = await getFunctionsInstance();
  const callable = httpsCallable(functions, name);
  const result = await callable(payload);
  return result?.data || null;
};

export const syncReferralState = async (progress = {}, { source = 'runtime', force = false } = {}) => {
  const userId = await getCurrentUserIdEnsured();
  if (!userId) return null;

  const payload = buildSyncPayload(progress, source);
  const signature = JSON.stringify(payload);
  const nowMs = Date.now();

  if (!force && signature === lastSyncSignature && nowMs - lastSyncAt < SYNC_THROTTLE_MS) {
    return null;
  }

  try {
    const result = await callReferralFunction('syncReferralStateV1', payload);
    lastSyncSignature = signature;
    lastSyncAt = nowMs;
    return normalizeSnapshot(result?.snapshot || result);
  } catch (error) {
    logger.warn('[ReferralServerService] sync failed', error);
    return null;
  }
};

export const getReferralServerSnapshot = async () => {
  const userId = await getCurrentUserIdEnsured();
  if (!userId) return null;

  try {
    const result = await callReferralFunction('getReferralServerSnapshotV1');
    return normalizeSnapshot(result?.snapshot || result);
  } catch (error) {
    logger.warn('[ReferralServerService] snapshot failed', error);
    return null;
  }
};

export default {
  getReferralServerSnapshot,
  syncReferralState,
};

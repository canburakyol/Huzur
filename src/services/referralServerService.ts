import { getCurrentUserIdEnsured } from './authService';
import { getFunctionsInstance } from './firebase';
import { logger } from '../utils/logger';

interface InviterSummary {
  ownCode: string;
  inviteCreatedAt: string | null;
  acceptedCount: number;
  onboardingCompletedCount: number;
  firstIbadahCompletedCount: number;
  convertedCount: number;
  rewardUnlockedCount: number;
  latestInviterRewardAt: string | null;
}

interface InviteeSummary {
  invitedByCode: string;
  inviteAcceptedAt: string | null;
  onboardingCompletedAt: string | null;
  firstIbadahCompletedAt: string | null;
  inviteeRewardUnlockedAt: string | null;
  inviterId: string;
  syncIssue: string;
}

interface ServerSnapshot {
  inviterSummary: InviterSummary;
  inviteeSummary: InviteeSummary;
}

interface SyncPayload {
  source: string;
  ownCode: string;
  inviteCreatedAt: string | null;
  invitedByCode: string;
  inviteAcceptedAt: string | null;
  onboardingCompletedAt: string | null;
  firstIbadahCompletedAt: string | null;
}

interface SyncOptions {
  source?: string;
  force?: boolean;
}

interface ReferralProgress {
  ownCode?: string;
  inviteCreatedAt?: string | null;
  invitedByCode?: string;
  inviteAcceptedAt?: string | null;
  onboardingCompletedAt?: string | null;
  firstIbadahCompletedAt?: string | null;
  [key: string]: unknown;
}

const SYNC_THROTTLE_MS = 30_000;

let lastSyncSignature = '';
let lastSyncAt = 0;

const sanitizeIso = (value: string | null | undefined): string | null => {
  const parsed = Date.parse(value || '');
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null;
};

const normalizeSummary = (summary: Record<string, unknown> = {}): InviterSummary => ({
  ownCode: typeof summary?.ownCode === 'string' ? summary.ownCode.trim().toUpperCase() : '',
  inviteCreatedAt: sanitizeIso(summary?.inviteCreatedAt as string),
  acceptedCount: Math.max(0, Number(summary?.acceptedCount) || 0),
  onboardingCompletedCount: Math.max(0, Number(summary?.onboardingCompletedCount) || 0),
  firstIbadahCompletedCount: Math.max(0, Number(summary?.firstIbadahCompletedCount) || 0),
  convertedCount: Math.max(0, Number(summary?.convertedCount) || 0),
  rewardUnlockedCount: Math.max(0, Number(summary?.rewardUnlockedCount) || 0),
  latestInviterRewardAt: sanitizeIso(summary?.latestInviterRewardAt as string),
});

const normalizeInviteeSummary = (summary: Record<string, unknown> = {}): InviteeSummary => ({
  invitedByCode: typeof summary?.invitedByCode === 'string' ? summary.invitedByCode.trim().toUpperCase() : '',
  inviteAcceptedAt: sanitizeIso(summary?.inviteAcceptedAt as string),
  onboardingCompletedAt: sanitizeIso(summary?.onboardingCompletedAt as string),
  firstIbadahCompletedAt: sanitizeIso(summary?.firstIbadahCompletedAt as string),
  inviteeRewardUnlockedAt: sanitizeIso(summary?.inviteeRewardUnlockedAt as string),
  inviterId: typeof summary?.inviterId === 'string' ? summary.inviterId : '',
  syncIssue: typeof summary?.syncIssue === 'string' ? summary.syncIssue : '',
});

const normalizeSnapshot = (snapshot: Record<string, unknown> = {}): ServerSnapshot => ({
  inviterSummary: normalizeSummary(snapshot?.inviterSummary as Record<string, unknown>),
  inviteeSummary: normalizeInviteeSummary(snapshot?.inviteeSummary as Record<string, unknown>),
});

const buildSyncPayload = (progress: ReferralProgress = {}, source = 'runtime'): SyncPayload => ({
  source,
  ownCode: progress?.ownCode || '',
  inviteCreatedAt: progress?.inviteCreatedAt || null,
  invitedByCode: progress?.invitedByCode || '',
  inviteAcceptedAt: progress?.inviteAcceptedAt || null,
  onboardingCompletedAt: progress?.onboardingCompletedAt || null,
  firstIbadahCompletedAt: progress?.firstIbadahCompletedAt || null,
});

const callReferralFunction = async (name: string, payload: Record<string, unknown> = {}): Promise<unknown> => {
  const { httpsCallable } = await import('firebase/functions');
  const functions = await getFunctionsInstance();
  const callable = httpsCallable(functions, name);
  const result = await callable(payload);
  return (result as { data?: unknown })?.data || null;
};

export const syncReferralState = async (progress: ReferralProgress = {}, { source = 'runtime', force = false }: SyncOptions = {}): Promise<ServerSnapshot | null> => {
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
    return normalizeSnapshot((result as { snapshot?: Record<string, unknown> })?.snapshot || (result as Record<string, unknown>));
  } catch (error) {
    logger.warn('[ReferralServerService] sync failed', error);
    return null;
  }
};

export const getReferralServerSnapshot = async (): Promise<ServerSnapshot | null> => {
  const userId = await getCurrentUserIdEnsured();
  if (!userId) return null;

  try {
    const result = await callReferralFunction('getReferralServerSnapshotV1');
    return normalizeSnapshot((result as { snapshot?: Record<string, unknown> })?.snapshot || (result as Record<string, unknown>));
  } catch (error) {
    logger.warn('[ReferralServerService] snapshot failed', error);
    return null;
  }
};

export default {
  getReferralServerSnapshot,
  syncReferralState,
};

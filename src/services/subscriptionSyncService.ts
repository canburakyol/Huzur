import { httpsCallable } from 'firebase/functions';
import { getFunctionsInstance } from './firebase';
import { storageService } from './storageService';
import { STORAGE_KEYS } from '../constants';
import { getProStateSnapshot, setProStatus } from './proService';
import { ANALYTICS_EVENTS, logEvent } from './analyticsService';
import { logger } from '../utils/logger';
import crashlyticsReporter, { buildCrashContext } from '../utils/crashlyticsReporter';

interface ServerStatusPayload {
  isPro?: boolean;
  expiresAt?: string | null;
  verificationState?: string;
  integrityFailure?: boolean;
  source?: string;
  entitlementId?: string;
}

interface PersistedStatus {
  timestamp: string;
  isPro: boolean;
  expiresAt: string | null;
  source: string;
  verificationState: string;
}

interface SyncResult {
  isPro: boolean;
  expiresAt: string | null;
  source: string;
  verificationState: string;
  state: ReturnType<typeof getProStateSnapshot>;
}

const persistServerStatus = async (payload: ServerStatusPayload, source: string): Promise<SyncResult> => {
  const isPro = payload?.isPro === true;
  const expiresAt = payload?.expiresAt || null;
  const authoritativeSource = payload?.source || source;
  const verificationState = payload?.verificationState
    || (payload?.integrityFailure ? 'integrity_failed' : (isPro ? 'verified' : 'negative'));

  await setProStatus(isPro, expiresAt, authoritativeSource, {
    verificationState,
    reason: verificationState
  });

  const persistedStatus: PersistedStatus = {
    timestamp: new Date().toISOString(),
    isPro,
    expiresAt,
    source: authoritativeSource,
    verificationState
  };
  storageService.setItem(STORAGE_KEYS.PRO_SERVER_SYNC, persistedStatus);

  if (isPro && payload?.source === 'referral_reward') {
    logEvent(ANALYTICS_EVENTS.REFERRAL_REWARD_PRO_ACTIVATED, {
      source,
      entitlement_id: payload?.entitlementId || 'referral_reward',
      expires_at: expiresAt || undefined,
    });
  }

  crashlyticsReporter.logCrash(
      `[SubscriptionSync] ${source} active=${isPro} state=${verificationState}`
  );

  return { isPro, expiresAt, source: authoritativeSource, verificationState, state: getProStateSnapshot() };
};

export const syncProStatusFromServer = async (): Promise<SyncResult | null> => {
  try {
    const functions = await getFunctionsInstance();
    const callable = httpsCallable(functions, 'checkProStatus');
    const result = await callable({});
    return persistServerStatus((result?.data || {}) as ServerStatusPayload, 'checkProStatus');
  } catch (error) {
    logger.warn('[SubscriptionSync] Server sync failed', error);
    crashlyticsReporter.logExceptionWithContext(
      error as Error,
      buildCrashContext('subscription_sync_check')
    );
    return null;
  }
};

export const syncProStatusWithRevenueCat = async (): Promise<SyncResult | null> => {
  try {
    const functions = await getFunctionsInstance();
    const callable = httpsCallable(functions, 'syncProStatus');
    const result = await callable({});
    return persistServerStatus((result?.data || {}) as ServerStatusPayload, 'syncProStatus');
  } catch (error) {
    logger.warn('[SubscriptionSync] RevenueCat sync failed', error);
    crashlyticsReporter.logExceptionWithContext(
      error as Error,
      buildCrashContext('subscription_sync_revenuecat')
    );
    return null;
  }
};

export default {
  syncProStatusFromServer,
  syncProStatusWithRevenueCat
};

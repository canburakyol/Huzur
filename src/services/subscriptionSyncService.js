import { httpsCallable } from 'firebase/functions';
import { getFunctionsInstance } from './firebase';
import { storageService } from './storageService';
import { STORAGE_KEYS } from '../constants';
import { getProStateSnapshot, setProStatus } from './proService';
import { logger } from '../utils/logger';
import crashlyticsReporter, { buildCrashContext } from '../utils/crashlyticsReporter';

const persistServerStatus = async (payload, source) => {
  const isPro = payload?.isPro === true;
  const expiresAt = payload?.expiresAt || null;
  const verificationState = payload?.verificationState
    || (payload?.integrityFailure ? 'integrity_failed' : (isPro ? 'verified' : 'negative'));

  await setProStatus(isPro, expiresAt, source, {
    verificationState,
    reason: verificationState
  });

  storageService.setItem(STORAGE_KEYS.PRO_SERVER_SYNC, {
    timestamp: new Date().toISOString(),
    isPro,
    expiresAt,
    source,
    verificationState
  });

  crashlyticsReporter.logCrash(
    `[SubscriptionSync] ${source} active=${isPro} state=${verificationState}`
  ).catch(() => {});

  return { isPro, expiresAt, source, verificationState, state: getProStateSnapshot() };
};

export const syncProStatusFromServer = async () => {
  try {
    const functions = await getFunctionsInstance();
    const callable = httpsCallable(functions, 'checkProStatus');
    const result = await callable({});
    return persistServerStatus(result?.data || {}, 'checkProStatus');
  } catch (error) {
    logger.warn('[SubscriptionSync] Server sync failed', error);
    crashlyticsReporter.logExceptionWithContext(
      error,
      buildCrashContext('subscription_sync_check')
    ).catch(() => {});
    return null;
  }
};

export const syncProStatusWithRevenueCat = async () => {
  try {
    const functions = await getFunctionsInstance();
    const callable = httpsCallable(functions, 'syncProStatus');
    const result = await callable({});
    return persistServerStatus(result?.data || {}, 'syncProStatus');
  } catch (error) {
    logger.warn('[SubscriptionSync] RevenueCat sync failed', error);
    crashlyticsReporter.logExceptionWithContext(
      error,
      buildCrashContext('subscription_sync_revenuecat')
    ).catch(() => {});
    return null;
  }
};

export default {
  syncProStatusFromServer,
  syncProStatusWithRevenueCat
};

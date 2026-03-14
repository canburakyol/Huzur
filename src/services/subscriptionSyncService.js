import { httpsCallable } from 'firebase/functions';
import { getFunctionsInstance } from './firebase';
import { storageService } from './storageService';
import { STORAGE_KEYS } from '../constants';
import { setProStatus } from './proService';
import { logger } from '../utils/logger';

const persistServerStatus = async (payload, source) => {
  const isPro = payload?.isPro === true;
  const expiresAt = payload?.expiresAt || null;

  await setProStatus(isPro, expiresAt, 'server');

  storageService.setItem(STORAGE_KEYS.PRO_SERVER_SYNC, {
    timestamp: new Date().toISOString(),
    isPro,
    expiresAt,
    source
  });

  return { isPro, expiresAt };
};

export const syncProStatusFromServer = async () => {
  try {
    const functions = await getFunctionsInstance();
    const callable = httpsCallable(functions, 'checkProStatus');
    const result = await callable({});
    return persistServerStatus(result?.data || {}, 'checkProStatus');
  } catch (error) {
    logger.warn('[SubscriptionSync] Server sync failed', error);
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
    return null;
  }
};

export default {
  syncProStatusFromServer,
  syncProStatusWithRevenueCat
};

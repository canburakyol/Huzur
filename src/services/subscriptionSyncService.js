import { httpsCallable } from 'firebase/functions';
import { getFunctionsInstance } from './firebase';
import { storageService } from './storageService';
import { STORAGE_KEYS } from '../constants';
import { setProStatus } from './proService';
import { logger } from '../utils/logger';

/**
 * Server-authoritative Pro status sync.
 * Cloud Functions `checkProStatus` sonucunu client cache ile hizalar.
 */
export const syncProStatusFromServer = async () => {
  try {
    const functions = await getFunctionsInstance();
    const callable = httpsCallable(functions, 'checkProStatus');
    const result = await callable({});

    const payload = result?.data || {};
    const isPro = payload.isPro === true;
    const expiresAt = payload.expiresAt || null;

    await setProStatus(isPro, expiresAt);

    storageService.setItem(STORAGE_KEYS.PRO_SERVER_SYNC, {
      timestamp: new Date().toISOString(),
      isPro,
      expiresAt,
      source: 'checkProStatus'
    });

    return { isPro, expiresAt };
  } catch (error) {
    logger.warn('[SubscriptionSync] Server sync failed', error);
    return null;
  }
};

export default {
  syncProStatusFromServer
};


import { Capacitor } from '@capacitor/core';
import { FirebaseAppCheck } from '@capacitor-firebase/app-check';
import { logger } from '../utils/logger';

type AppCheckStatusResult = {
  success: boolean;
  tokenPresent?: boolean;
  expireTimeMillis?: number;
  platform?: string;
  error?: string;
};

type AppCheckHealthResult = {
  healthy: boolean;
  message: string;
  action: string | null;
  canRetry: boolean;
};

type AppCheckRefreshResult = {
  success: boolean;
  message?: string;
  expireTimeMillis?: number;
  error?: string;
};

const getPlatform = (): string => {
  try {
    return Capacitor.getPlatform();
  } catch (error) {
    logger.error('[AppCheck] Platform detection failed', error);
    return 'web';
  }
};

const isWebPlatform = (): boolean => getPlatform() === 'web';

export const checkAppCheckStatus = async (): Promise<AppCheckStatusResult> => {
  const platform = getPlatform();
  if (platform === 'web') {
    logger.log('AppCheck: Web platform - skipped');
    return { success: true, tokenPresent: false, platform };
  }

  try {
    const result = await FirebaseAppCheck.getToken({ forceRefresh: false });
    return {
      success: true,
      tokenPresent: Boolean(result?.token),
      expireTimeMillis: result?.expireTimeMillis,
      platform
    };
  } catch (error) {
    logger.error('AppCheck: Status check error', error);
    return {
      success: false,
      error: (error as Error).message || 'App Check token could not be retrieved',
      platform
    };
  }
};

export const forceRefreshAppCheckToken = async (): Promise<AppCheckRefreshResult> => {
  if (isWebPlatform()) {
    return { success: false, error: 'Not available on web platform' };
  }

  try {
    const result = await FirebaseAppCheck.getToken({ forceRefresh: true });
    logger.log('AppCheck: Token refresh result', {
      tokenPresent: Boolean(result?.token),
      expireTimeMillis: result?.expireTimeMillis
    });
    return {
      success: true,
      message: 'Token refreshed successfully',
      expireTimeMillis: result?.expireTimeMillis
    };
  } catch (error) {
    logger.error('AppCheck: Token refresh error', error);
    return { success: false, error: (error as Error).message };
  }
};

export const getAppCheckHealthStatus = async (): Promise<AppCheckHealthResult> => {
  const status = await checkAppCheckStatus();

  if (!status.success) {
    return {
      healthy: false,
      message: 'App Check çalışmıyor. Firebase servisleri sınırlı olabilir.',
      action: 'Tekrar dene',
      canRetry: true
    };
  }

  if (status.tokenPresent) {
    return {
      healthy: true,
      message: 'App Check aktif ve çalışıyor.',
      action: null,
      canRetry: false
    };
  }

  return {
    healthy: false,
    message: 'App Check token alınamadı.',
    action: 'Yenile',
    canRetry: true
  };
};

export const logAppCheckStatus = async (): Promise<AppCheckStatusResult> => {
  const status = await checkAppCheckStatus();

  if (status.success) {
    logger.log('AppCheck Status:', {
      tokenPresent: status.tokenPresent,
      expireTimeMillis: status.expireTimeMillis,
      platform: status.platform
    });
  } else {
    logger.error('AppCheck Error:', status.error);
  }

  return status;
};

let monitoringIntervalId: ReturnType<typeof setInterval> | null = null;
let tokenChangedListenerHandle: { remove: () => Promise<void> } | null = null;

export const initializeAppCheckMonitoring = async (): Promise<void> => {
  if (isWebPlatform()) return;

  logger.log('AppCheck: Initializing monitoring...');

  if (monitoringIntervalId !== null) {
    clearInterval(monitoringIntervalId);
  }

  if (!tokenChangedListenerHandle) {
    tokenChangedListenerHandle = await FirebaseAppCheck.addListener('tokenChanged', (event: { token?: string } | null) => {
      logger.log('AppCheck: Native token changed', {
        tokenPresent: Boolean(event?.token)
      });
    });
  }

  await logAppCheckStatus();

  monitoringIntervalId = setInterval(async () => {
    const status = await checkAppCheckStatus();

    if (!status.success || !status.tokenPresent) {
      logger.warn('AppCheck: Token issue detected, attempting refresh...');
      await forceRefreshAppCheckToken();
    }
  }, 30 * 60 * 1000);
};

export const stopAppCheckMonitoring = async (): Promise<void> => {
  if (monitoringIntervalId !== null) {
    clearInterval(monitoringIntervalId);
    monitoringIntervalId = null;
  }

  if (tokenChangedListenerHandle) {
    await tokenChangedListenerHandle.remove();
    tokenChangedListenerHandle = null;
  }
};

export default {
  checkAppCheckStatus,
  forceRefreshAppCheckToken,
  getAppCheckHealthStatus,
  logAppCheckStatus,
  initializeAppCheckMonitoring,
  stopAppCheckMonitoring
};

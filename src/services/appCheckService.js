/**
 * Firebase App Check Service
 * Native App Check token zincirini kontrol etmek ve yÃ¶netmek iÃ§in.
 */

import { Capacitor } from '@capacitor/core';
import { FirebaseAppCheck } from '@capacitor-firebase/app-check';
import { logger } from '../utils/logger';

const getPlatform = () => {
  try {
    return Capacitor.getPlatform();
  } catch (error) {
    logger.error('[AppCheck] Platform detection failed', error);
    return 'web';
  }
};

const isWebPlatform = () => getPlatform() === 'web';

/**
 * App Check durumunu kontrol et
 * @returns {Promise<{success: boolean, tokenPresent?: boolean, expireTimeMillis?: number, platform?: string, error?: string}>}
 */
export const checkAppCheckStatus = async () => {
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
      error: error.message || 'App Check token could not be retrieved',
      platform
    };
  }
};

/**
 * App Check token'Ä±nÄ± manuel olarak yenile
 * @returns {Promise<{success: boolean, message?: string, expireTimeMillis?: number, error?: string}>}
 */
export const forceRefreshAppCheckToken = async () => {
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
    return { success: false, error: error.message };
  }
};

/**
 * App Check baÅŸarÄ±yla Ã§alÄ±ÅŸÄ±yor mu kontrol et
 * KullanÄ±cÄ±ya gÃ¶sterilecek durum mesajÄ± dÃ¶ndÃ¼rÃ¼r
 */
export const getAppCheckHealthStatus = async () => {
  const status = await checkAppCheckStatus();

  if (!status.success) {
    return {
      healthy: false,
      message: 'App Check Ã§alÄ±ÅŸmÄ±yor. Firebase servisleri sÄ±nÄ±rlÄ± olabilir.',
      action: 'Tekrar dene',
      canRetry: true
    };
  }

  if (status.tokenPresent) {
    return {
      healthy: true,
      message: 'App Check aktif ve Ã§alÄ±ÅŸÄ±yor.',
      action: null,
      canRetry: false
    };
  }

  return {
    healthy: false,
    message: 'App Check token alÄ±namadÄ±.',
    action: 'Yenile',
    canRetry: true
  };
};

/**
 * App Check durumunu logla (debug iÃ§in)
 */
export const logAppCheckStatus = async () => {
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

// Module-level interval reference for cleanup
let monitoringIntervalId = null;
let tokenChangedListenerHandle = null;

/**
 * Uygulama baÅŸlangÄ±cÄ±nda App Check'i kontrol et
 * Sorun varsa kullanÄ±cÄ±ya bildir
 */
export const initializeAppCheckMonitoring = async () => {
  if (isWebPlatform()) return;

  logger.log('AppCheck: Initializing monitoring...');

  if (monitoringIntervalId !== null) {
    clearInterval(monitoringIntervalId);
  }

  if (!tokenChangedListenerHandle) {
    tokenChangedListenerHandle = await FirebaseAppCheck.addListener('tokenChanged', (event) => {
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

/**
 * App Check monitoring'i durdur (cleanup)
 */
export const stopAppCheckMonitoring = async () => {
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

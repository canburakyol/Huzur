/**
 * Firebase App Check Service
 * App Check durumunu kontrol etmek ve yönetmek için
 */

import { Capacitor } from '@capacitor/core';
import { logger } from '../utils/logger';

const PLUGIN_NAME = 'AppCheck';

/**
 * App Check durumunu kontrol et
 * @returns {Promise<{success: boolean, tokenPresent?: boolean, error?: string}>}
 */
export const checkAppCheckStatus = async () => {
  if (Capacitor.getPlatform() === 'web') {
    logger.log('AppCheck: Web platform - skipped');
    return { success: true, tokenPresent: false, platform: 'web' };
  }

  try {
    const { AppCheck } = await import('../plugins/AppCheckPlugin');
    const result = await AppCheck.getAppCheckStatus();
    
    logger.log('AppCheck: Status check result', result);
    return result;
  } catch (error) {
    logger.error('AppCheck: Status check error', error);
    return { 
      success: false, 
      error: error.message || 'App Check plugin not available' 
    };
  }
};

/**
 * App Check token'ını manuel olarak yenile
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export const forceRefreshAppCheckToken = async () => {
  if (Capacitor.getPlatform() === 'web') {
    return { success: false, error: 'Not available on web platform' };
  }

  try {
    const { AppCheck } = await import('../plugins/AppCheckPlugin');
    const result = await AppCheck.forceRefreshToken();
    
    logger.log('AppCheck: Token refresh result', result);
    return result;
  } catch (error) {
    logger.error('AppCheck: Token refresh error', error);
    return { success: false, error: error.message };
  }
};

/**
 * App Check başarıyla çalışıyor mu kontrol et
 * Kullanıcıya gösterilecek durum mesajı döndürür
 */
export const getAppCheckHealthStatus = async () => {
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

/**
 * App Check durumunu logla (debug için)
 */
export const logAppCheckStatus = async () => {
  const status = await checkAppCheckStatus();
  
  if (status.success) {
    logger.log('✅ App Check Status:', {
      tokenPresent: status.tokenPresent,
      expireTimeMillis: status.expireTimeMillis,
      platform: Capacitor.getPlatform()
    });
  } else {
    logger.error('❌ App Check Error:', status.error);
  }
  
  return status;
};

// Module-level interval reference for cleanup
let monitoringIntervalId = null;

/**
 * Uygulama başlangıcında App Check'i kontrol et
 * Sorun varsa kullanıcıya bildir
 */
export const initializeAppCheckMonitoring = async () => {
  // Sadece native platformlarda çalıştır
  if (Capacitor.getPlatform() === 'web') return;
  
  logger.log('AppCheck: Initializing monitoring...');
  
  // Önceki interval varsa temizle (hot reload güvenliği)
  if (monitoringIntervalId !== null) {
    clearInterval(monitoringIntervalId);
  }
  
  // İlk kontrol
  await logAppCheckStatus();
  
  // Her 30 dakikada bir kontrol et
  monitoringIntervalId = setInterval(async () => {
    const status = await checkAppCheckStatus();
    
    if (!status.success || !status.tokenPresent) {
      logger.warn('AppCheck: Token issue detected, attempting refresh...');
      await forceRefreshAppCheckToken();
    }
  }, 30 * 60 * 1000); // 30 dakika
};

/**
 * App Check monitoring'i durdur (cleanup)
 */
export const stopAppCheckMonitoring = () => {
  if (monitoringIntervalId !== null) {
    clearInterval(monitoringIntervalId);
    monitoringIntervalId = null;
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
/**
 * Merkezi Error Handler
 * Tüm hataları yakalar, loglar ve kullanıcıya uygun mesaj gösterir
 */

import { logger } from '../utils/logger';
import { logExceptionWithContext, buildCrashContext } from '../utils/crashlyticsReporter';

export class AppError extends Error {
  constructor(message, code, userMessage) {
    super(message);
    this.code = code;
    this.userMessage = userMessage || message;
    this.timestamp = new Date();
  }
}

export const ERROR_CODES = {
  NETWORK: 'NETWORK_ERROR',
  AUTH: 'AUTH_ERROR',
  PERMISSION: 'PERMISSION_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  API: 'API_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

export const errorHandler = {
  sanitizeContext(additionalInfo = {}) {
    const safe = { ...additionalInfo };
    const sensitiveKeys = ['token', 'authToken', 'password', 'secret', 'authorization', 'apiKey'];

    sensitiveKeys.forEach((key) => {
      if (key in safe) {
        safe[key] = '[REDACTED]';
      }
    });

    return safe;
  },

  /**
   * Hatayı işle ve kullanıcıya gösterilecek mesajı döndür
   */
  handle(error, context = '') {
    logger.error(`[ErrorHandler] ${context}:`, error);

    // Network hatası
    if (!navigator.onLine) {
      return {
        code: ERROR_CODES.NETWORK,
        message: 'İnternet bağlantınızı kontrol edin.'
      };
    }

    // Firebase Auth hataları
    if (error.code?.startsWith('auth/')) {
      return this.handleFirebaseAuthError(error);
    }

    // Firebase Functions hataları
    if (error.code === 'unauthenticated') {
      return {
        code: ERROR_CODES.AUTH,
        message: 'Bu işlem için giriş yapmanız gerekiyor.'
      };
    }

    if (error.code === 'permission-denied') {
      return {
        code: ERROR_CODES.PERMISSION,
        message: 'Bu işlem için yetkiniz yok.'
      };
    }

    if (error.code === 'resource-exhausted') {
      return {
        code: ERROR_CODES.API,
        message: 'Çok fazla istek gönderildi. Lütfen bekleyin.'
      };
    }

    // HTTP hataları
    if (error.response) {
      return this.handleHTTPError(error.response);
    }

    // Timeout
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return {
        code: ERROR_CODES.NETWORK,
        message: 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.'
      };
    }

    // AppError
    if (error instanceof AppError) {
      return {
        code: error.code,
        message: error.userMessage
      };
    }

    // Genel hata
    return {
      code: ERROR_CODES.UNKNOWN,
      message: 'Bir hata oluştu. Lütfen tekrar deneyin.'
    };
  },

  handleFirebaseAuthError(error) {
    const authErrors = {
      'auth/user-not-found': 'Kullanıcı bulunamadı.',
      'auth/wrong-password': 'Hatalı şifre.',
      'auth/email-already-in-use': 'Bu e-posta zaten kullanılıyor.',
      'auth/weak-password': 'Şifre çok zayıf. En az 6 karakter olmalı.',
      'auth/invalid-email': 'Geçersiz e-posta adresi.',
      'auth/network-request-failed': 'Bağlantı hatası. İnterneti kontrol edin.',
      'auth/too-many-requests': 'Çok fazla deneme. Lütfen bekleyin.'
    };

    return {
      code: ERROR_CODES.AUTH,
      message: authErrors[error.code] || 'Giriş hatası. Lütfen tekrar deneyin.'
    };
  },

  handleHTTPError(response) {
    const statusMessages = {
      400: 'Geçersiz istek.',
      401: 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.',
      403: 'Bu işlem için yetkiniz yok.',
      404: 'İstenilen kaynak bulunamadı.',
      429: 'Çok fazla istek. Lütfen bekleyin.',
      500: 'Sunucu hatası. Lütfen tekrar deneyin.',
      503: 'Servis şu anda kullanılamıyor.'
    };

    return {
      code: ERROR_CODES.API,
      message: statusMessages[response.status] || 'Bir hata oluştu.'
    };
  },

  /**
   * Hatayı log'la (production'da analytics'e gönderebilir)
   */
  log(error, context, additionalInfo = {}) {
    const sanitizedInfo = this.sanitizeContext(additionalInfo);

    const errorLog = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      ...sanitizedInfo
    };

    logger.error('[ErrorLog]', errorLog);

    // Production: Send to Crashlytics
    try {
      logExceptionWithContext(
        error,
        buildCrashContext(context, {
          code: error?.code,
          ...sanitizedInfo
        })
      );
    } catch {
      // Silently fail if Crashlytics is unavailable
    }

    return errorLog;
  }
};

export default errorHandler;

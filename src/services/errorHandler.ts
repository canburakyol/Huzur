import { logger } from '../utils/logger';
import { logExceptionWithContext, buildCrashContext } from '../utils/crashlyticsReporter';

export class AppError extends Error {
  code: string;
  userMessage: string;
  timestamp: Date;

  constructor(message: string, code: string, userMessage?: string) {
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
} as const;

type ErrorResult = {
  code: string;
  message: string;
};

type HTTPResponse = {
  status: number;
};

type ErrorLike = {
  code?: string;
  message?: string;
  stack?: string;
  response?: HTTPResponse;
};

const sanitizeContext = (additionalInfo: Record<string, unknown> = {}): Record<string, unknown> => {
  const safe = { ...additionalInfo };
  const sensitiveKeys = ['token', 'authToken', 'password', 'secret', 'authorization', 'apiKey'];

  sensitiveKeys.forEach((key) => {
    if (key in safe) {
      safe[key] = '[REDACTED]';
    }
  });

  return safe;
};

const handleFirebaseAuthError = (error: ErrorLike): ErrorResult => {
  const authErrors: Record<string, string> = {
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
    message: authErrors[error.code || ''] || 'Giriş hatası. Lütfen tekrar deneyin.'
  };
};

const handleHTTPError = (response: HTTPResponse): ErrorResult => {
  const statusMessages: Record<number, string> = {
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
};

export const handleAppError = (error: ErrorLike, context = ''): ErrorResult => {
  logger.error(`[ErrorHandler] ${context}:`, error);

  if (!navigator.onLine) {
    return {
      code: ERROR_CODES.NETWORK,
      message: 'İnternet bağlantınızı kontrol edin.'
    };
  }

  if (error.code?.startsWith('auth/')) {
    return handleFirebaseAuthError(error);
  }

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

  if (error.response) {
    return handleHTTPError(error.response);
  }

  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return {
      code: ERROR_CODES.NETWORK,
      message: 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.'
    };
  }

  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.userMessage
    };
  }

  return {
    code: ERROR_CODES.UNKNOWN,
    message: 'Bir hata oluştu. Lütfen tekrar deneyin.'
  };
};

export const logAppError = (error: Error, context: string, additionalInfo: Record<string, unknown> = {}): Record<string, unknown> => {
  const sanitizedInfo = sanitizeContext(additionalInfo);

  const errorLog = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    ...sanitizedInfo
  };

  logger.error('[ErrorLog]', errorLog);

  try {
    logExceptionWithContext(
      error,
      buildCrashContext(context, {
        code: error?.code,
        ...sanitizedInfo
      })
    );
  } catch (loggingError) {
    logger.error('[ErrorHandler] Crashlytics logging failed', loggingError);
  }

  return errorLog;
};

export default {
  sanitizeContext,
  handle: handleAppError,
  log: logAppError
};

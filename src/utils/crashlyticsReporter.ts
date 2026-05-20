import { logger } from './logger';
import { isCrashReportingEnabledSync } from '../services/privacyModeService';

const CRASHLYTICS_MAX_MESSAGE_LENGTH = 1000;

type CrashContext = {
  context: string;
  platform: string;
  isNative: boolean;
  path: string;
  at: string;
  [key: string]: unknown;
};

type CrashPayload = {
  message: string;
  stack?: string;
  code?: string;
  name?: string;
};

type NormalizedError = {
  message: string;
  stack?: string;
  code?: unknown;
  name?: string;
};

const sanitizeForCrashlytics = (value: string | unknown): string => {
  let strValue = typeof value !== 'string' ? String(value ?? '') : value;

  const redacted = strValue
    .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, '[REDACTED_BEARER_TOKEN]')
    .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[REDACTED_JWT]')
    .replace(/\bAIza[0-9A-Za-z_-]{20,}\b/g, '[REDACTED_API_KEY]')
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[REDACTED_EMAIL]')
    .replace(/\b[A-Za-z0-9_-]{20,}:[A-Za-z0-9_-]{20,}\b/g, '[REDACTED_FCM_TOKEN]')
    .replace(/([?&](?:token|authToken|apiKey|key|secret|password|authorization|ref)=)[^&\s"']+/gi, '$1[REDACTED]')
    .replace(/"((?:token|authToken|apiKey|key|secret|password|authorization|fcmToken|userId|uid))"\s*:\s*"[^"]*"/gi, '"$1":"[REDACTED]"')
    .replace(/[A-Fa-f0-9]{32,}/g, '[REDACTED_HEX_SECRET]');

  return redacted.slice(0, CRASHLYTICS_MAX_MESSAGE_LENGTH);
};

const normalizeErrorLike = (error: unknown): NormalizedError => {
  if (!error) {
    return {
      message: 'Unknown error',
      stack: undefined,
      code: undefined,
      name: undefined
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message || 'Error',
      stack: error.stack,
      code: (error as Error & { code?: unknown }).code,
      name: error.name
    };
  }

  if (typeof error === 'object') {
    const err = error as Record<string, unknown>;
    return {
      message: (err.message as string) || JSON.stringify(err),
      stack: err.stack as string | undefined,
      code: err.code,
      name: err.name as string | undefined
    };
  }

  return {
    message: String(error),
    stack: undefined,
    code: undefined,
    name: undefined
  };
};

export const buildCrashContext = (context = '', additional: Record<string, unknown> = {}): CrashContext => {
  const base: CrashContext = {
    context,
    platform: window?.Capacitor?.getPlatform?.() || 'web',
    isNative: Boolean(window?.Capacitor?.isNativePlatform?.() ?? window?.Capacitor?.isNative),
    path: window?.location?.pathname || '/',
    at: new Date().toISOString()
  };

  return {
    ...base,
    ...additional
  };
};

const toCrashPayload = (error: unknown, context: Record<string, unknown> = {}): CrashPayload => {
  const normalized = normalizeErrorLike(error);
  const safeContext = sanitizeForCrashlytics(JSON.stringify(context || {}));
  const safeMessage = sanitizeForCrashlytics(normalized.message);
  const safeStack = normalized.stack ? sanitizeForCrashlytics(normalized.stack) : undefined;

  return {
    message: safeContext ? `[${safeContext}] ${safeMessage}` : safeMessage,
    stack: safeStack,
    code: normalized.code ? sanitizeForCrashlytics(String(normalized.code)) : undefined,
    name: normalized.name ? sanitizeForCrashlytics(String(normalized.name)) : undefined
  };
};

export async function logCrash(message: string): Promise<void> {
  try {
    const safeMessage = sanitizeForCrashlytics(message);
    if (!isCrashReportingEnabledSync()) {
      logger.log('[CrashlyticsStub]', safeMessage);
      return;
    }

    const plugin = window?.Capacitor?.Plugins?.Crashlytics;
    if (plugin && typeof plugin.log === 'function') {
      await plugin.log({ message: safeMessage });
    } else {
      logger.warn('[Crashlytics] Plugin not available.');
    }
  } catch (error) {
    logger.error('[Crashlytics] Failed to send breadcrumb log', error);
  }
}

export async function reportError(error: unknown, context = '', metadata: Record<string, unknown> = {}): Promise<void> {
  try {
    const normalized = normalizeErrorLike(error);
    const safeContext = sanitizeForCrashlytics(context || 'unknown_context');
    const safeMessage = `[${safeContext}] ${sanitizeForCrashlytics(normalized.message)}`;
    
    if (!isCrashReportingEnabledSync()) {
      logger.error('[CrashlyticsStub]', safeMessage, metadata);
      return;
    }

    const plugin = window?.Capacitor?.Plugins?.Crashlytics;
    if (plugin && typeof plugin.log === 'function') {
      await plugin.log({ message: safeMessage });
    } else {
      logger.error('[Crashlytics] Plugin not available, error not reported');
    }
  } catch (reportingError) {
    logger.error('[Crashlytics] Failed to report error', reportingError);
  }
}

export async function logException(error: unknown): Promise<void> {
  return logExceptionWithContext(error, {});
}

export async function logExceptionWithContext(error: unknown, context: Record<string, unknown> = {}): Promise<void> {
  try {
    const payload = toCrashPayload(error, context);
    if (!isCrashReportingEnabledSync()) {
      logger.error('[CrashlyticsStub]', payload.message);
      return;
    }

    const plugin = window?.Capacitor?.Plugins?.Crashlytics;
    if (plugin && typeof plugin.logException === 'function') {
      await plugin.logException(payload);
    } else {
      logger.error('[Crashlytics] Plugin not available, error not reported');
    }
  } catch (reportingError) {
    logger.error('[Crashlytics] Failed to report exception', reportingError);
  }
}

export async function initCrashlyticsTestHook(): Promise<void> {
  if (typeof window !== 'undefined') {
    window.__CRASHLYTICS_TEST__ = async () => {
      await logCrash('CRASHLYTICS TEST START');
      try {
        throw new Error('Crashlytics test exception');
      } catch (err) {
        await logExceptionWithContext(err, buildCrashContext('manual_test'));
      }
    };
  }
}

export default {
  logCrash,
  logException,
  logExceptionWithContext,
  buildCrashContext,
  initCrashlyticsTestHook
};

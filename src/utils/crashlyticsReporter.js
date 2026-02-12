// Simple bridge to report JS errors to Crashlytics via Capacitor plugin
import { logger } from './logger';

const CRASHLYTICS_MAX_MESSAGE_LENGTH = 1000;

const sanitizeForCrashlytics = (value) => {
  if (typeof value !== 'string') {
    value = String(value ?? '');
  }

  // Remove potential token-like sequences (JWT, bearer tokens, long secrets)
  const redacted = value
    .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, '[REDACTED_BEARER_TOKEN]')
    .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[REDACTED_JWT]')
    .replace(/[A-Fa-f0-9]{32,}/g, '[REDACTED_HEX_SECRET]');

  return redacted.slice(0, CRASHLYTICS_MAX_MESSAGE_LENGTH);
};

const normalizeErrorLike = (error) => {
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
      code: error.code,
      name: error.name
    };
  }

  if (typeof error === 'object') {
    const err = error;
    return {
      message: err.message || JSON.stringify(err),
      stack: err.stack,
      code: err.code,
      name: err.name
    };
  }

  return {
    message: String(error),
    stack: undefined,
    code: undefined,
    name: undefined
  };
};

export const buildCrashContext = (context = '', additional = {}) => {
  const base = {
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

const toCrashPayload = (error, context = {}) => {
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

export async function logCrash(message) {
  try {
    const plugin = window?.Capacitor?.Plugins?.Crashlytics;
    const safeMessage = sanitizeForCrashlytics(message);
    if (plugin && typeof plugin.log === 'function') {
      await plugin.log({ message: safeMessage });
    } else {
      logger.warn('Crashlytics plugin not available.');
    }
  } catch {
    // Swallow to avoid breaking app flow
  }
}

export async function logException(error) {
  return logExceptionWithContext(error, {});
}

export async function logExceptionWithContext(error, context = {}) {
  try {
    const plugin = window?.Capacitor?.Plugins?.Crashlytics;
    const payload = toCrashPayload(error, context);
    if (plugin && typeof plugin.logException === 'function') {
      await plugin.logException(payload);
    } else {
      logger.error('[Crashlytics] Plugin not available, error not reported');
    }
  } catch {
    // Swallow to avoid breaking app flow
  }
}

export async function initCrashlyticsTestHook() {
  if (typeof window !== 'undefined') {
    // Expose a simple global test function to trigger Crashlytics messages from the UI/console
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

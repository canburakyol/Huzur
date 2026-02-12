import { useEffect } from 'react';
import { ensureAuthenticated } from '../../services/authService';
import crashlyticsReporter, {
  initCrashlyticsTestHook,
  logExceptionWithContext,
  buildCrashContext
} from '../../utils/crashlyticsReporter';
import { analyticsService } from '../../services/analyticsService';
import { logger } from '../../utils/logger';

export function useBootstrapEffects() {
  useEffect(() => {
    const initAuth = async () => {
      try {
        await ensureAuthenticated();
      } catch {
        logger.error('[Bootstrap] Auth init error');
      }
    };
    initAuth();
  }, []);

  useEffect(() => {
    analyticsService.init();
    analyticsService.logAppOpen('cold_start');
  }, []);

  useEffect(() => {
    try {
      crashlyticsReporter?.logCrash?.('App mounted - startup');
      initCrashlyticsTestHook();
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const onError = (event) => {
      logger.error('[GlobalError]', event.message);
      try {
        logExceptionWithContext(
          event?.error || new Error(event.message),
          buildCrashContext('global_error', {
            source: 'window.error',
            filename: event?.filename,
            line: event?.lineno,
            column: event?.colno
          })
        );
      } catch {
        // silently ignore logging errors
      }
    };

    const onUnhandledRejection = (event) => {
      logger.error('[UnhandledRejection]', event.reason);
      try {
        logExceptionWithContext(
          event?.reason instanceof Error ? event.reason : new Error(String(event.reason)),
          buildCrashContext('unhandled_rejection', {
            source: 'window.unhandledrejection'
          })
        );
      } catch {
        // silently ignore logging errors
      }
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);
}

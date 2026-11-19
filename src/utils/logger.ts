/**
 * Production-Safe Logger
 * 
 * Development'ta console.log aktif, production'da devre dışı.
 * Hassas veriler için sensitive() kullanın - her zaman no-op.
 * 
 * Security: Prevents sensitive data leakage via logcat in production
 */

const isDev = import.meta.env.DEV || import.meta.env.MODE === 'android-debug';

export const logger = {
  /**
   * General logging - only in development
   */
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },

  /**
   * Warnings - only in development
   */
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },

  /**
   * Errors - only logged in development
   * In production, errors are captured by Crashlytics via unhandled exception handlers.
   * This prevents leaking storage keys, API endpoints, and error details via logcat.
   */
  error: (...args: unknown[]) => {
    if (isDev) console.error(...args);
  },

  /**
   * Debug info - only in development
   */
  debug: (...args: unknown[]) => {
    if (isDev) console.debug(...args);
  },

  /**
   * Info level - only in development
   */
  info: (...args: unknown[]) => {
    if (isDev) console.info(...args);
  },

  /**
   * SENSITIVE DATA - Never log anywhere
   * Use this for tokens, API keys, user IDs, etc.
   */
  sensitive: (..._args: unknown[]) => {
    // Intentionally empty - never log sensitive data
  }
};

export default logger;

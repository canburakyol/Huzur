/**
 * Production-Safe Logger
 * 
 * Development'ta console.log aktif, production'da devre dışı.
 * Hassas veriler için sensitive() kullanın - her zaman no-op.
 * 
 * Security: Prevents sensitive data leakage via logcat in production
 */

const isDev = import.meta.env.DEV;

export const logger = {
  /**
   * General logging - only in development
   */
  log: (...args) => {
    if (isDev) console.log(...args);
  },

  /**
   * Warnings - only in development
   */
  warn: (...args) => {
    if (isDev) console.warn(...args);
  },

  /**
   * Errors - always logged (goes to Crashlytics)
   */
  error: (...args) => {
    console.error(...args);
  },

  /**
   * Debug info - only in development
   */
  debug: (...args) => {
    if (isDev) console.debug(...args);
  },

  /**
   * Info level - only in development
   */
  info: (...args) => {
    if (isDev) console.info(...args);
  },

  /**
   * SENSITIVE DATA - Never log anywhere
   * Use this for tokens, API keys, user IDs, etc.
   */
  sensitive: () => {
    // Intentionally empty - never log sensitive data
  }
};

export default logger;

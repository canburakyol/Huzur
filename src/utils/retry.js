import { logger } from './logger';

/**
 * Retry a function with exponential backoff.
 * 
 * @param {Function} fn - The async function to retry
 * @param {object} options
 * @param {number} options.maxAttempts - Maximum number of attempts (default: 3)
 * @param {number} options.baseDelay - Base delay in ms (default: 1000)
 * @param {number} options.maxDelay - Maximum delay cap in ms (default: 30000)
 * @param {function} options.shouldRetry - Optional predicate to decide if retry should happen
 * @param {function} options.onRetry - Optional callback called before each retry
 * @returns {Promise<any>} - The result of the function
 */
export async function withRetry(fn, {
  maxAttempts = 3,
  baseDelay = 1000,
  maxDelay = 30000,
  shouldRetry = () => true,
  onRetry = () => {}
} = {}) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts) {
        break;
      }

      if (!shouldRetry(error, attempt)) {
        break;
      }

      // Exponential backoff with jitter (prevents thundering herd)
      const jitter = Math.random() * 0.3 + 0.85; // 0.85 - 1.15 multiplier
      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1) * jitter, maxDelay);

      logger.warn(`[Retry] Attempt ${attempt}/${maxAttempts} failed, retrying in ${Math.round(delay)}ms`, {
        error: error?.message || String(error)
      });

      onRetry(error, attempt, delay);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export default withRetry;

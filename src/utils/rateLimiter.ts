/**
 * Rate Limiter Utility
 *
 * Client-side rate limiting for Firestore write operations.
 * Prevents spam and abuse of social features.
 */

const rateLimiters = new Map<string, number[]>();

export const checkRateLimit = (key: string, maxRequests = 5, windowMs = 60000): boolean => {
  const now = Date.now();

  if (!rateLimiters.has(key)) {
    rateLimiters.set(key, []);
  }

  const timestamps = rateLimiters.get(key)!.filter((timestamp) => now - timestamp < windowMs);

  if (timestamps.length >= maxRequests) {
    return false;
  }

  timestamps.push(now);
  rateLimiters.set(key, timestamps);

  return true;
};

export const resetRateLimit = (key: string): void => {
  rateLimiters.delete(key);
};

export const getRemainingRequests = (key: string, maxRequests = 5, windowMs = 60000): number => {
  const now = Date.now();

  if (!rateLimiters.has(key)) {
    return maxRequests;
  }

  const timestamps = rateLimiters.get(key)!.filter((timestamp) => now - timestamp < windowMs);
  return Math.max(0, maxRequests - timestamps.length);
};

export const getTimeUntilReset = (key: string, windowMs = 60000): number => {
  const now = Date.now();

  if (!rateLimiters.has(key)) {
    return 0;
  }

  const timestamps = rateLimiters.get(key);
  if (timestamps.length === 0) {
    return 0;
  }

  const oldestTimestamp = Math.min(...timestamps);
  const resetTime = oldestTimestamp + windowMs;

  return Math.max(0, resetTime - now);
};

export default {
  checkRateLimit,
  resetRateLimit,
  getRemainingRequests,
  getTimeUntilReset
};

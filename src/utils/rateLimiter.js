/**
 * Rate Limiter Utility
 * 
 * Client-side rate limiting for Firestore write operations.
 * Prevents spam and abuse of social features.
 * 
 * Usage:
 *   if (!checkRateLimit('dua_submit')) {
 *     alert('Çok fazla istek gönderdiniz. Lütfen bekleyin.');
 *     return;
 *   }
 */

const rateLimiters = new Map();

/**
 * Check if action is within rate limit
 * @param {string} key - Unique identifier for the action (e.g., 'dua_submit', 'hatim_create')
 * @param {number} maxRequests - Maximum requests allowed in window (default: 5)
 * @param {number} windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @returns {boolean} true if allowed, false if rate limited
 */
export const checkRateLimit = (key, maxRequests = 5, windowMs = 60000) => {
  const now = Date.now();
  
  if (!rateLimiters.has(key)) {
    rateLimiters.set(key, []);
  }
  
  // Filter out old timestamps outside the window
  const timestamps = rateLimiters.get(key).filter(t => now - t < windowMs);
  
  if (timestamps.length >= maxRequests) {
    return false; // Rate limited
  }
  
  // Add current timestamp
  timestamps.push(now);
  rateLimiters.set(key, timestamps);
  
  return true; // Allowed
};

/**
 * Reset rate limit for a specific key
 * @param {string} key - The key to reset
 */
export const resetRateLimit = (key) => {
  rateLimiters.delete(key);
};

/**
 * Get remaining requests for a key
 * @param {string} key - The key to check
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {number} Remaining requests
 */
export const getRemainingRequests = (key, maxRequests = 5, windowMs = 60000) => {
  const now = Date.now();
  
  if (!rateLimiters.has(key)) {
    return maxRequests;
  }
  
  const timestamps = rateLimiters.get(key).filter(t => now - t < windowMs);
  return Math.max(0, maxRequests - timestamps.length);
};

/**
 * Get time until rate limit resets
 * @param {string} key - The key to check
 * @param {number} windowMs - Time window in milliseconds
 * @returns {number} Milliseconds until reset (0 if not rate limited)
 */
export const getTimeUntilReset = (key, windowMs = 60000) => {
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

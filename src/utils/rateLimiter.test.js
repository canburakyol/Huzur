import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, resetRateLimit, getRemainingRequests, getTimeUntilReset } from './rateLimiter';

describe('rateLimiter', () => {
  beforeEach(() => {
    resetRateLimit('test_action');
    resetRateLimit('action_a');
    resetRateLimit('action_b');
    resetRateLimit('fresh_action');
  });

  describe('checkRateLimit', () => {
    it('should allow first request', () => {
      const result = checkRateLimit('test_action');
      expect(result).toBe(true);
    });

    it('should allow up to maxRequests', () => {
      const maxRequests = 3;
      expect(checkRateLimit('test_action', maxRequests)).toBe(true);
      expect(checkRateLimit('test_action', maxRequests)).toBe(true);
      expect(checkRateLimit('test_action', maxRequests)).toBe(true);
      expect(checkRateLimit('test_action', maxRequests)).toBe(false);
    });

    it('should block when limit reached', () => {
      expect(checkRateLimit('test_action', 1)).toBe(true);
      expect(checkRateLimit('test_action', 1)).toBe(false);
    });

    it('should track different keys independently', () => {
      expect(checkRateLimit('action_a', 1)).toBe(true);
      expect(checkRateLimit('action_a', 1)).toBe(false);
      expect(checkRateLimit('action_b', 1)).toBe(true);
    });
  });

  describe('resetRateLimit', () => {
    it('should reset rate limit for a key', () => {
      checkRateLimit('test_action', 1);
      expect(checkRateLimit('test_action', 1)).toBe(false);

      resetRateLimit('test_action');

      expect(checkRateLimit('test_action', 1)).toBe(true);
    });

    it('should not affect other keys', () => {
      checkRateLimit('action_a', 1);
      checkRateLimit('action_b', 1);

      resetRateLimit('action_a');

      expect(checkRateLimit('action_a', 1)).toBe(true);
      expect(checkRateLimit('action_b', 1)).toBe(false);
    });
  });

  describe('getRemainingRequests', () => {
    it('should return maxRequests when no requests made', () => {
      expect(getRemainingRequests('fresh_action', 5)).toBe(5);
    });

    it('should decrease after requests', () => {
      checkRateLimit('test_action', 5);
      expect(getRemainingRequests('test_action', 5)).toBe(4);
      
      checkRateLimit('test_action', 5);
      expect(getRemainingRequests('test_action', 5)).toBe(3);
    });

    it('should return 0 when limit reached', () => {
      for (let i = 0; i < 5; i++) {
        checkRateLimit('test_action', 5);
      }
      expect(getRemainingRequests('test_action', 5)).toBe(0);
    });
  });

  describe('getTimeUntilReset', () => {
    it('should return 0 when no requests made', () => {
      expect(getTimeUntilReset('fresh_action')).toBeGreaterThanOrEqual(0);
    });

    it('should return positive time when requests exist', () => {
      checkRateLimit('test_action', 5, 60000);
      const timeLeft = getTimeUntilReset('test_action', 60000);
      expect(timeLeft).toBeGreaterThan(0);
      expect(timeLeft).toBeLessThanOrEqual(60000);
    });
  });
});

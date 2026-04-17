import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateHatimTarget, getSuggestedDates, TOTAL_PAGES } from './hatimCalculator';

describe('hatimCalculator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
  });

  describe('TOTAL_PAGES', () => {
    it('should be 604', () => {
      expect(TOTAL_PAGES).toBe(604);
    });
  });

  describe('calculateHatimTarget', () => {
    it('should return zeros for invalid date', () => {
      const result = calculateHatimTarget(0, 'invalid-date');
      expect(result.dailyTarget).toBe(0);
      expect(result.pagesLeft).toBe(0);
    });

    it('should calculate pages left correctly', () => {
      const result = calculateHatimTarget(0, '2024-01-31');
      expect(result.pagesLeft).toBe(604);
    });

    it('should handle partial progress', () => {
      const result = calculateHatimTarget(300, '2024-01-15');
      expect(result.pagesLeft).toBe(304);
    });

    it('should return zero daily target when completed', () => {
      const result = calculateHatimTarget(604, '2024-01-15');
      expect(result.dailyTarget).toBe(0);
      expect(result.pagesLeft).toBe(0);
    });

    it('should handle empty target date', () => {
      const result = calculateHatimTarget(0, '');
      expect(result.dailyTarget).toBe(0);
    });

    it('should handle null target date', () => {
      const result = calculateHatimTarget(0, null);
      expect(result.dailyTarget).toBe(0);
    });

    it('should return positive daysLeft for future date', () => {
      const result = calculateHatimTarget(0, '2024-02-01');
      expect(result.daysLeft).toBeGreaterThan(0);
    });

    it('should calculate reasonable daily target', () => {
      const result = calculateHatimTarget(0, '2024-01-31');
      expect(result.dailyTarget).toBeGreaterThan(0);
      expect(result.dailyTarget).toBeLessThanOrEqual(604);
    });
  });

  describe('getSuggestedDates', () => {
    it('should return at least one suggestion', () => {
      const suggestions = getSuggestedDates();
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should return date in YYYY-MM-DD format', () => {
      const suggestions = getSuggestedDates();
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      suggestions.forEach(s => {
        expect(dateRegex.test(s.date)).toBe(true);
      });
    });

    it('should return label for each suggestion', () => {
      const suggestions = getSuggestedDates();
      suggestions.forEach(s => {
        expect(s.label).toBeDefined();
        expect(typeof s.label).toBe('string');
      });
    });
  });
});

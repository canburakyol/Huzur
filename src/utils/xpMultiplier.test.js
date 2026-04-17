import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isXpMultiplierActive, getXpMultiplier } from './xpMultiplier';

vi.mock('../services/storageService', () => ({
  storageService: {
    getItem: vi.fn(),
  },
}));

const { storageService } = await import('../services/storageService');

describe('xpMultiplier', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
    vi.mocked(storageService.getItem).mockReset();
  });

  describe('isXpMultiplierActive', () => {
    it('should return false when no bonus data', () => {
      vi.mocked(storageService.getItem).mockReturnValue({});
      expect(isXpMultiplierActive()).toBe(false);
    });

    it('should return false when multiplierActive is false', () => {
      vi.mocked(storageService.getItem).mockReturnValue({
        multiplierActive: false,
        multiplierExpiry: '2024-01-02T00:00:00.000Z',
      });
      expect(isXpMultiplierActive()).toBe(false);
    });

    it('should return false when expiry is in the past', () => {
      vi.mocked(storageService.getItem).mockReturnValue({
        multiplierActive: true,
        multiplierExpiry: '2023-12-31T00:00:00.000Z',
      });
      expect(isXpMultiplierActive()).toBe(false);
    });

    it('should return true when active and not expired', () => {
      vi.mocked(storageService.getItem).mockReturnValue({
        multiplierActive: true,
        multiplierExpiry: '2024-01-02T00:00:00.000Z',
      });
      expect(isXpMultiplierActive()).toBe(true);
    });
  });

  describe('getXpMultiplier', () => {
    it('should return 1 when not active', () => {
      vi.mocked(storageService.getItem).mockReturnValue({});
      expect(getXpMultiplier()).toBe(1);
    });

    it('should return 2 when active', () => {
      vi.mocked(storageService.getItem).mockReturnValue({
        multiplierActive: true,
        multiplierExpiry: '2024-01-02T00:00:00.000Z',
      });
      expect(getXpMultiplier()).toBe(2);
    });
  });
});

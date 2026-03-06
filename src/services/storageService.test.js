import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storageService } from './storageService';

// Manual localStorage mock
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
    removeItem: vi.fn(key => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('storageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Sync Methods', () => {
    it('should store and retrieve JSON objects', () => {
      const data = { id: 1, name: 'Test' };
      storageService.setItem('test_key', data);
      expect(storageService.getItem('test_key')).toEqual(data);
    });

    it('should return defaultValue if key not found', () => {
      const result = storageService.getItem('non_existent', 'fallback');
      expect(result).toBe('fallback');
    });

    it('should handle booleans correctly', () => {
      storageService.setBoolean('bool_true', true);
      storageService.setBoolean('bool_false', false);
      expect(storageService.getBoolean('bool_true')).toBe(true);
      expect(storageService.getBoolean('bool_false')).toBe(false);
    });

    it('should handle numbers correctly', () => {
      storageService.setNumber('num_key', 123);
      expect(storageService.getNumber('num_key')).toBe(123);
    });
  });
});

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

  describe('SQLite persistent CRUD', () => {
    it('should store and retrieve typed persistent key-value records', async () => {
      const value = { city: 'Istanbul', method: 'Diyanet' };

      await expect(storageService.setPersistentItem('prayer_settings', value)).resolves.toBe(true);
      await expect(storageService.getPersistentItem('prayer_settings')).resolves.toEqual(value);
      await expect(storageService.hasPersistentKey('prayer_settings')).resolves.toBe(true);
    });

    it('should remove persistent key-value records', async () => {
      await storageService.setPersistentItem('transient_cache', { ready: true });

      await expect(storageService.removePersistentItem('transient_cache')).resolves.toBe(true);
      await expect(storageService.getPersistentItem('transient_cache', 'fallback')).resolves.toBe('fallback');
    });

    it('should perform table CRUD without touching sync localStorage APIs', async () => {
      const record = { id: 'daily-1', title: 'Daily cache' };

      await expect(storageService.upsertRecord('phase3_records', record)).resolves.toMatchObject(record);
      await expect(storageService.getRecord('phase3_records', 'daily-1')).resolves.toMatchObject(record);
      await expect(storageService.getRecords('phase3_records')).resolves.toEqual([expect.objectContaining(record)]);
      await expect(storageService.deleteRecord('phase3_records', 'daily-1')).resolves.toBe(true);
      await expect(storageService.getRecord('phase3_records', 'daily-1')).resolves.toBeNull();
    });

    it('should reject unsafe table names through the CRUD wrapper', async () => {
      await expect(storageService.upsertRecord('bad; DROP TABLE key_value_store', { id: 'x' })).resolves.toBeNull();
    });
  });
});

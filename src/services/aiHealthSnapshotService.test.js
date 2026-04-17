import { describe, expect, it } from 'vitest';
import { normalizeDateTimeValue } from './aiHealthSnapshotService';

describe('aiHealthSnapshotService', () => {
  it('normalizes Firestore-style timestamps into ISO strings', () => {
    const normalized = normalizeDateTimeValue({
      toDate: () => new Date('2026-03-27T09:30:00.000Z'),
    });

    expect(normalized).toBe('2026-03-27T09:30:00.000Z');
  });
});

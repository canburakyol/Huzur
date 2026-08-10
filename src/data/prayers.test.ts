import { describe, expect, it } from 'vitest';
import { prayers } from './prayers';

describe('prayer catalog integrity', () => {
  it('keeps stable IDs unique and routes duplicate records through canonical aliases', () => {
    expect(new Set(prayers.map((prayer) => prayer.id)).size).toBe(prayers.length);

    for (const prayer of prayers.filter((item) => item.canonicalId !== undefined)) {
      expect(prayer.canonicalId).not.toBe(prayer.id);
      expect(prayers.some((candidate) => candidate.id === prayer.canonicalId)).toBe(true);
    }
  });

  it('uses explicit source metadata instead of generic hadith claims', () => {
    for (const prayer of prayers) {
      expect(prayer.sourceType).toBeDefined();
      expect(prayer.source).not.toBe('Hadis-i Şerif');
      if (prayer.sourceType === 'general') expect(prayer.citation).toBeUndefined();
      else expect(prayer.citation).toMatch(/\S/);
    }
  });

  it('does not surface a transliteration for aliases, archived fragments, or completed texts without a verified matching transliteration', () => {
    for (const prayer of prayers) {
      if (prayer.canonicalId || prayer.archived || prayer.transliteration === '') {
        expect(prayer.transliteration).toBe('');
      }
    }
  });
});

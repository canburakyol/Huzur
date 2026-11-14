import { describe, expect, it } from 'vitest';
import { prayers } from './prayers';
import tr from '../../public/locales/tr/translation.json';
import en from '../../public/locales/en/translation.json';
import de from '../../public/locales/de/translation.json';
import id from '../../public/locales/id/translation.json';

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

  it('shows a meaning that covers the whole Arabic text, not just its first sentence', () => {
    const letters = (arabic: string) => arabic.replace(/[^ء-ي]/g, '').length;
    for (const locale of [tr, en, de, id]) {
      const items = (locale as { prayerBook: { items: Record<string, { meaning: string }> } }).prayerBook.items;
      for (const prayer of prayers.filter((item) => !item.canonicalId && !item.archived)) {
        const meaning = items[prayer.id]?.meaning ?? '';
        // A full translation is longer than the unvocalised Arabic; truncated ones were under 0.4.
        expect(meaning.replace(/\s/g, '').length / letters(prayer.arabic), `#${prayer.id}`).toBeGreaterThan(0.6);
      }
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

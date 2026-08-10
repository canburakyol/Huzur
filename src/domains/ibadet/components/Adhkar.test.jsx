import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const translation = JSON.parse(readFileSync('public/locales/tr/translation.json', 'utf8'));
const items = translation.adhkar.items;

describe('Adhkar Quran text integrity', () => {
  it('stores complete Quran passages without ellipses and with matching readings', () => {
    const expectedStarts = {
      ayetel_kursi: 'ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ',
      ihlas: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ قُلْ هُوَ ٱللَّهُ أَحَدٌ',
      felak: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ',
      nas: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ',
      tevekkul_duasi: 'فَإِن تَوَلَّوْا۟ فَقُلْ حَسْبِىَ ٱللَّهُ',
    };

    for (const [key, start] of Object.entries(expectedStarts)) {
      expect(items[key].arabic.startsWith(start)).toBe(true);
      expect(items[key].arabic).not.toMatch(/\.\.\.|…/);
      expect(items[key].transliteration).not.toMatch(/\.\.\.|…/);
      expect(items[key].meaning).not.toMatch(/\.\.\.|…/);
    }
  });

  it('does not retain the incomplete morning and evening formulas as recitations', () => {
    expect(items).not.toHaveProperty('sabah_duasi');
    expect(items).not.toHaveProperty('aksam_duasi');
  });
});

import { describe, expect, it } from 'vitest';
import { SURAH_NAMES_LATIN, getLocalizedSurahList, surahList } from './surahList';

describe('getLocalizedSurahList', () => {
  it('has a Latin name for every surah', () => {
    expect(surahList).toHaveLength(114);
    expect(SURAH_NAMES_LATIN).toHaveLength(114);
  });

  it('keeps Turkish names for tr and uses Latin names elsewhere', () => {
    expect(getLocalizedSurahList('tr')[2].nameTranslation).toBe('Âl-i İmrân');
    expect(getLocalizedSurahList('de')[2].nameTranslation).toBe("Ali 'Imran");
    expect(getLocalizedSurahList('id')[113].nameTranslation).toBe('An-Nas');
    expect(getLocalizedSurahList('en')[0].revelationType).toBe('Meccan');
    expect(getLocalizedSurahList('id')[1].revelationType).toBe('Madaniyah');
  });
});

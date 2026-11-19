import { describe, expect, it } from 'vitest';
import { hadiths } from './hadiths';
import { ESMA_UL_HUSNA } from './esmaUlHusnaData';
import { ESMA_TRANSLATION_COUNT, getEsmaTranslation } from './esmaUlHusnaTranslations';
import { HADITH_TEXTS, localizeHadith } from './hadithTranslations';
import { getDailyContent } from '../services/contentService';

describe('content translations', () => {
  it('translates every esma', () => {
    expect(ESMA_TRANSLATION_COUNT).toBe(ESMA_UL_HUSNA.length);
    for (const esma of ESMA_UL_HUSNA) expect(getEsmaTranslation(esma.id, 'de')?.meaning).toBeTruthy();
    expect(getEsmaTranslation(1, 'tr')).toBeNull();
  });

  it('translates every hadith and maps its source and narrator', () => {
    for (const hadith of hadiths) {
      expect(HADITH_TEXTS[Number(hadith.id)], `hadith ${hadith.id}`).toBeDefined();
      const id = localizeHadith(hadith, 'id');
      expect(id.source).not.toMatch(/[âîûçğışöü]/i);
      if (hadith.narrator) expect(id.narrator).not.toMatch(/^Hz\./);
    }
    expect(localizeHadith(hadiths[0], 'tr')).toBe(hadiths[0]);
  });

  it('builds daily content in the requested language', () => {
    const de = getDailyContent('de');
    const tr = getDailyContent('tr');
    expect(de.verse.reference).toMatch(/^[A-Z].* \d+:\d+$/);
    expect(de.verse.translation).not.toBe(tr.verse.translation);
    expect(de.insight.text).toBeTruthy();
  });
});

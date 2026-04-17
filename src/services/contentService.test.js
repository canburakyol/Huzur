import { describe, expect, it } from 'vitest';
import { getDailyContent } from './contentService';

describe('contentService trust metadata', () => {
  it('returns reviewed source metadata for daily content blocks', () => {
    const content = getDailyContent();

    expect(content.esma.sourceMeta).toMatchObject({
      type: 'esma_ul_husna',
      reviewStatus: 'reviewed',
    });
    expect(content.verse.sourceMeta).toMatchObject({
      type: 'daily_content',
      reviewStatus: 'reviewed',
    });
    expect(content.dailyDua.sourceMeta).toMatchObject({
      type: 'daily_dua',
      reviewStatus: 'reviewed',
    });
    expect(content.hadith.sourceMeta).toMatchObject({
      type: 'hadith',
      reviewStatus: 'reviewed',
    });
  });
});

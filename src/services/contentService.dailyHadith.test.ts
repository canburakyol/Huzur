import { afterEach, describe, expect, it, vi } from 'vitest';
import { getDailyContent } from './contentService';

describe('home daily hadith', () => {
  afterEach(() => vi.useRealTimers());

  it('comes only from Sahih al-Bukhari or Sahih Muslim on every day of the year', () => {
    vi.useFakeTimers();
    const sources = new Set<string>();
    for (let day = 0; day < 366; day += 1) {
      vi.setSystemTime(new Date(2028, 0, 1 + day, 12));
      const { insight } = getDailyContent('tr');
      expect(insight.text.length).toBeGreaterThan(0);
      sources.add(insight.source);
    }
    expect([...sources].sort()).toEqual(['Buhârî', 'Buhârî, Müslim', 'Müslim']);
  });
});

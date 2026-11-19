import { describe, expect, it } from 'vitest';
import * as library from '../libraryData';
import en from './en.json';
import de from './de.json';
import id from './id.json';
import { localizeLibraryData } from './applyLibraryOverlay';

const data = {
  BOOKS: library.BOOKS, RELIGIOUS_TEXTS: library.RELIGIOUS_TEXTS, EDUCATION: library.EDUCATION,
  REFERENCES: library.REFERENCES, FAQ: library.FAQ, AUDIO: library.AUDIO, VIDEO: library.VIDEO,
};
const resolve = (path: string): unknown => path.split('.').reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], data);

describe('library overlays', () => {
  it.each([['en', en], ['de', de], ['id', id]])('every %s path points at a string in libraryData', (_lang, overlay) => {
    const broken = Object.keys(overlay).filter((path) => typeof resolve(path) !== 'string');
    expect(broken).toEqual([]);
  });

  it('translates a copy and leaves Turkish untouched', async () => {
    const german = await localizeLibraryData(data, 'de');
    expect(german.BOOKS[0].title).toBe('Geschichte des Islam');
    expect(data.BOOKS[0].title).toBe('İslam Tarihi');
    expect(await localizeLibraryData(data, 'tr')).toBe(data);
  });
});

import { describe, expect, it } from 'vitest';
import { wordByWordData } from './wordByWordData';
import { describeMorphology, getWordMorphology } from './wordMorphology';

const t = (key: string, fallback: string, options?: Record<string, unknown>) =>
  `${key.split('.').pop()}${options ? JSON.stringify(options) : ''}` || fallback;

describe('wordMorphology', () => {
  it('has corpus data for every word shown in the word-by-word screen', () => {
    for (const [surah, data] of Object.entries(wordByWordData)) {
      for (const verse of data.verses) {
        verse.words.forEach((_: unknown, i: number) => {
          expect(getWordMorphology(Number(surah), verse.number, i + 1), `${surah}:${verse.number}:${i + 1}`).not.toBeNull();
        });
        expect(getWordMorphology(Number(surah), verse.number, verse.words.length + 1)).toBeNull();
      }
    }
  });

  it('matches known Fatiha analyses', () => {
    expect(getWordMorphology(1, 1, 3)).toMatchObject({ root: 'ر ح م', pos: 'ADJ', rootCount: 339 });
    const nastain = getWordMorphology(1, 5, 4)!;
    expect(nastain.root).toBe('ع و ن');
    expect(describeMorphology(nastain, t)).toEqual({
      pos: 'V',
      grammar: ['IMPF', 'form{"form":"X"}', '1 P'],
      affixes: [],
    });
  });

  it('describes prefixes and pronoun suffixes', () => {
    const ihdina = describeMorphology(getWordMorphology(1, 6, 1)!, t);
    expect(ihdina.affixes).toEqual(['pronounSuffix{"who":"1 P"}']);
    expect(describeMorphology(getWordMorphology(1, 2, 1)!, t).affixes).toEqual(['al']);
  });
});

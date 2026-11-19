import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

// A bad re-encode once turned letters like İ/Ö/Ş/ı into "?" ("?brahim", "namaz?").
const BROKEN = /\?\p{L}|\p{L}\?\p{L}|-\?|'\?'/u;

const strings = (node: unknown, path: string, out: string[]): string[] => {
  if (typeof node === 'string') {
    if (BROKEN.test(node)) out.push(`${path}: ${node}`);
  } else if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) strings(value, path ? `${path}.${key}` : key, out);
  }
  return out;
};

describe('locale files', () => {
  it.each(['tr', 'en', 'de', 'id'])('%s has no characters lost to "?"', (lang) => {
    const dir = `public/locales/${lang}`;
    const broken = fs.readdirSync(dir).filter((f) => f.endsWith('.json'))
      .flatMap((f) => strings(JSON.parse(fs.readFileSync(`${dir}/${f}`, 'utf8')), f, []));
    expect(broken).toEqual([]);
  });
});

import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ADHAN_SOUNDS } from './adhanSounds';

const RAW_DIR = 'android/app/src/main/res/raw';
const hasRawFile = (name: string): boolean => ['ogg', 'mp3'].some((ext) => fs.existsSync(`${RAW_DIR}/${name}.${ext}`));

// A listed sound without its file would count as "adhan on": JS skips the main prayer notification and
// Android schedules nothing, so the user would get no prayer notification at all.
describe('bundled adhan sounds', () => {
  it.each(ADHAN_SOUNDS.map((sound) => [sound.id]))('%s has a valid Android resource name and file', (id) => {
    expect(id).toMatch(/^[a-z][a-z0-9_]*$/);
    expect(id.endsWith('_fajr')).toBe(false);
    expect(hasRawFile(id)).toBe(true);
  });

  it('has a test case even while the list is empty', () => {
    expect(Array.isArray(ADHAN_SOUNDS)).toBe(true);
  });
});

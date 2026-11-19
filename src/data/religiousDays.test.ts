import { describe, expect, it } from 'vitest';
import { parseLocalDate, religiousDays, toLocalDateKey, upcomingReligiousDays, type ReligiousDayKind } from './religiousDays';

// Hijri month (1-12) and day each kind falls on; Diyanet and Umm al-Qura may differ by one day.
const HIJRI_TARGET: Partial<Record<ReligiousDayKind, [number, number]>> = {
  mirac: [7, 26],
  berat: [8, 14],
  ramazan: [9, 1],
  kadir: [9, 26],
  ramazanBayrami: [10, 1],
  kurbanArefe: [12, 9],
  kurbanBayrami: [12, 10],
  hicriYilbasi: [1, 1],
  asure: [1, 10],
  mevlid: [3, 11],
};

const hijri = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { month: 'numeric', day: 'numeric' });
const hijriOf = (date: Date): [number, number] => {
  const parts = hijri.formatToParts(date);
  return [Number(parts.find((p) => p.type === 'month')?.value), Number(parts.find((p) => p.type === 'day')?.value)];
};

describe('religious days (Diyanet table)', () => {
  it('is in date order with valid dates', () => {
    const keys = religiousDays.map((day) => day.date);
    expect([...keys].sort()).toEqual(keys);
    for (const key of keys) expect(toLocalDateKey(parseLocalDate(key))).toBe(key);
  });

  it('lists every major day for each year through 2028', () => {
    for (const year of [2025, 2026, 2027, 2028]) {
      const kinds = new Set(religiousDays.filter((day) => day.date.startsWith(String(year))).map((day) => day.kind));
      for (const kind of ['ramazan', 'kadir', 'ramazanBayrami', 'kurbanBayrami', 'hicriYilbasi', 'asure', 'mevlid', 'regaib']) {
        expect(kinds.has(kind as ReligiousDayKind), `${kind} ${year}`).toBe(true);
      }
    }
  });

  it('falls on the expected Hijri day, within one day', () => {
    for (const day of religiousDays) {
      const target = HIJRI_TARGET[day.kind];
      if (!target) continue;
      const date = parseLocalDate(day.date);
      const around = [-1, 0, 1].map((offset) => hijriOf(new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset)));
      expect(around.some(([m, d]) => m === target[0] && d === target[1]), `${day.kind} ${day.date}`).toBe(true);
    }
  });

  it('matches Diyanet spot checks', () => {
    const find = (kind: ReligiousDayKind, year: number) => religiousDays.find((day) => day.kind === kind && day.date.startsWith(String(year)))?.date;
    expect(find('mevlid', 2026)).toBe('2026-08-24');
    expect(find('regaib', 2026)).toBe('2026-12-10');
    expect(find('ramazanBayrami', 2026)).toBe('2026-03-20');
    expect(find('hicriYilbasi', 2026)).toBe('2026-06-16');
    expect(find('kurbanBayrami', 2027)).toBe('2027-05-16');
    expect(parseLocalDate('2026-03-20').getDay()).toBe(5); // Diyanet: Cuma
  });

  it('starts upcoming days from today, local time', () => {
    expect(upcomingReligiousDays(new Date(2026, 10, 19), 1)[0]).toMatchObject({ kind: 'regaib', date: '2026-12-10' });
    expect(upcomingReligiousDays(new Date(2026, 11, 10), 1)[0].date).toBe('2026-12-10');
  });
});

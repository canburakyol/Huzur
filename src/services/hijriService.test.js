import { describe, it, expect } from 'vitest';
import { gregorianToHijri, checkBlessedDay } from './hijriService';

describe('hijriService - Date Conversions', () => {
  it('should convert 2024-03-11 to 1 Ramazan 1445 (approx)', () => {
    const march11 = new Date(2024, 2, 11); // Month is 0-indexed
    const result = gregorianToHijri(march11);
    expect(result.monthName).toBe('Ramazan');
    expect(result.year).toBe(1445);
  });

  it('should identify Blessed Days correctly', () => {
    const ramadanStart = { day: 1, month: 9 };
    const result = checkBlessedDay(ramadanStart);
    expect(result).not.toBeNull();
    expect(result.name).toBe('Ramazan Başlangıcı');
  });

  it('matches the tabular (islamic-civil) calendar every day, including January and February', () => {
    const civil = new Intl.DateTimeFormat('en-u-ca-islamic-civil', { day: 'numeric', month: 'numeric', year: 'numeric' });
    for (let t = Date.UTC(2024, 0, 1); t < Date.UTC(2028, 0, 1); t += 86400000) {
      const date = new Date(t + 12 * 3600000);
      const parts = Object.fromEntries(civil.formatToParts(date).map((p) => [p.type, p.value]));
      const result = gregorianToHijri(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12));
      expect([result.day, result.month, result.year]).toEqual([Number(parts.day), Number(parts.month), parseInt(parts.year, 10)]);
    }
  });

  it('places 10 Feb 2027 in Ramazan 1448, not Şaban', () => {
    const result = gregorianToHijri(new Date(2027, 1, 10));
    expect(result.monthName).toBe('Ramazan');
    expect(result.year).toBe(1448);
  });

  it('should handle leap years correctly (e.g., Feb 29, 2024)', () => {
    const leapDay = new Date(2024, 1, 29);
    const result = gregorianToHijri(leapDay);
    expect(result.day).toBeDefined();
    expect(result.year).toBe(1445);
  });
});

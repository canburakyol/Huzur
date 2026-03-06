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

  it('should handle leap years correctly (e.g., Feb 29, 2024)', () => {
    const leapDay = new Date(2024, 1, 29);
    const result = gregorianToHijri(leapDay);
    expect(result.day).toBeDefined();
    expect(result.year).toBe(1445);
  });
});

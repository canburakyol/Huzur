import { describe, expect, it } from 'vitest';
import { offlineCalculatorService, getCalculationMethodName } from './offlineCalculatorService';

const minutes = (hhmm: string | null) => {
  const [h, m] = String(hhmm).split(':').map(Number);
  return h * 60 + m;
};

describe('offlineCalculatorService regional method', () => {
  it('uses Kemenag angles in Indonesia and Diyanet elsewhere', () => {
    expect(getCalculationMethodName(-6.2088, 106.8456)).toBe('Kemenag'); // Jakarta
    expect(getCalculationMethodName(3.139, 101.6869)).toBe('Kemenag'); // Kuala Lumpur
    expect(getCalculationMethodName(41.0082, 28.9784)).toBe('Diyanet'); // Istanbul
    expect(getCalculationMethodName(52.52, 13.405)).toBe('Diyanet'); // Berlin
  });

  it('matches Kemenag published Jakarta times within 3 minutes', () => {
    const t = offlineCalculatorService.calculatePrayerTimes(-6.2088, 106.8456, new Date('2026-11-19T12:00:00+07:00'))!;
    // results are formatted in the machine's time zone; shift them to Jakarta (UTC+7)
    const offset = 7 * 60 + new Date('2026-11-19T12:00:00+07:00').getTimezoneOffset();
    const local = (v: string | null) => (minutes(v) + offset + 1440) % 1440;
    // api.aladhan.com method=20 (Kemenag), Jakarta, 19 Nov 2026
    const expected = { Fajr: '04:03', Sunrise: '05:26', Dhuhr: '11:38', Asr: '15:01', Maghrib: '17:50', Isha: '19:04' };
');
    for (const [key, value] of Object.entries(expected)) {
      expect(Math.abs(local(t[key as keyof typeof t]) - minutes(value)), key).toBeLessThanOrEqual(3);
    }
  });
});

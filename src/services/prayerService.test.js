import { describe, it, expect } from 'vitest';
import { getNextPrayer } from './prayerService';

describe('prayerService - getNextPrayer', () => {
  const mockTimings = {
    'Fajr': '05:30',
    'Sunrise': '06:45',
    'Dhuhr': '13:15',
    'Asr': '16:30',
    'Maghrib': '19:45',
    'Isha': '21:00'
  };

  it('should return Dhuhr when time is 09:00', () => {
    const morningTime = new Date();
    morningTime.setHours(9, 0, 0);
    const result = getNextPrayer(mockTimings, morningTime);
    expect(result.key).toBe('Dhuhr');
    expect(result.name).toBe('Öğle');
  });

  it('should identify Fajr as next prayer after Isha (22:00)', () => {
    const nightTime = new Date();
    nightTime.setHours(22, 0, 0);
    const result = getNextPrayer(mockTimings, nightTime);
    expect(result.key).toBe('Fajr');
    expect(result.isTomorrow).toBe(true);
  });
});

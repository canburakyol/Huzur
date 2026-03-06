import { describe, it, expect } from 'vitest';
import { formatPrayerTime } from './timeFormat';

describe('formatPrayerTime', () => {
  it('should format 24h time string to "HH:MM" format correctly', () => {
    expect(formatPrayerTime('13:45')).toBe('13:45');
    expect(formatPrayerTime('5:7')).toBe('05:07');
    expect(formatPrayerTime('09:5')).toBe('09:05');
  });

  it('should handle invalid input gracefully', () => {
    expect(formatPrayerTime(null)).toBe('--:--');
    expect(formatPrayerTime('')).toBe('--:--');
    expect(formatPrayerTime('invalid')).toBe('--:--');
  });
});

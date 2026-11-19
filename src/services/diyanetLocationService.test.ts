import { beforeEach, describe, expect, it } from 'vitest';
import { findDistrictByName, getSelectedDistrictId, setDistrictById } from './diyanetLocationService';
import { resolvePrayerDistrictId } from './prayerService';
import { offlineCalculatorService } from './offlineCalculatorService';

describe('Diyanet district lookup', () => {
  beforeEach(() => localStorage.clear());

  it('maps provinces and districts to their own Diyanet ids', () => {
    // The old hand-written map sent Van to Sinop, Konya to Kastamonu and Bodrum to Tavşanlı.
    expect(findDistrictByName('Van')?.districtId).toBe('9930');
    expect(findDistrictByName('Konya')?.districtId).toBe('9676');
    expect(findDistrictByName('Bodrum')?.districtId).toBe('9741');
    expect(findDistrictByName('Muğla')?.districtId).toBe('9747');
    expect(findDistrictByName('MARMARİS')?.districtId).toBe('17883');
  });

  it('uses the İstanbul time for central Istanbul districts Diyanet does not list separately', () => {
    expect(findDistrictByName('Kadıköy')?.districtId).toBe('9541');
    expect(findDistrictByName('Pendik')?.districtId).toBe('9545');
  });

  it('refuses names that exist in two provinces instead of guessing', () => {
    expect(findDistrictByName('Kemer')).toBeNull(); // Antalya and Burdur
    expect(findDistrictByName('Tuşba')).toBeNull(); // not a Diyanet district
  });

  it('ignores a district id stored by an older version that points elsewhere', () => {
    setDistrictById('9847', 'Van', 'Van'); // 9847 is Sinop
    expect(getSelectedDistrictId()).toBe('9541');
  });

  it('calculates from coordinates when the place has no Diyanet district', () => {
    expect(resolvePrayerDistrictId('Tuşba', true)).toBeNull();
    expect(resolvePrayerDistrictId('Van', true)).toBe('9930');
  });
});

describe('offline calculation matches Diyanet', () => {
  it('gives Diyanet times for Van on 19.11.2026 within a minute', () => {
    // Diyanet (ezanvakti mirror, id 9930): 05:20 06:45 11:57 14:35 16:58 18:18
    const t = offlineCalculatorService.calculatePrayerTimes(38.4942, 43.38, new Date(2026, 10, 19, 12));
    const toMin = (s: string | null | undefined) => { const [h, m] = String(s).split(':').map(Number); return h * 60 + m; };
    const expected = { Fajr: '05:20', Sunrise: '06:45', Dhuhr: '11:57', Asr: '14:35', Maghrib: '16:58', Isha: '18:18' };
    for (const [key, value] of Object.entries(expected)) {
      expect(Math.abs(toMin(t?.[key as keyof typeof t]) - toMin(value)), key).toBeLessThanOrEqual(1);
    }
  });
});

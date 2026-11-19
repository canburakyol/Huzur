import { describe, expect, it, vi } from 'vitest';

vi.mock('./storageService', () => ({ storageService: { getString: () => '', setString: vi.fn(), removeItem: vi.fn() } }));

import { getActiveCampaign, isKandilDay, isRamadan } from './campaignService';

describe('campaign dates follow the Diyanet table', () => {
  it('marks only real kandil days', () => {
    expect(isKandilDay(new Date(2026, 11, 10))).toBe(true); // Regaib 2026
    expect(isKandilDay(new Date(2026, 9, 15))).toBe(false); // old fixed window said October was kandil
  });

  it('spans Ramadan from its first day up to the Eid', () => {
    expect(isRamadan(new Date(2026, 1, 18))).toBe(false);
    expect(isRamadan(new Date(2026, 1, 19))).toBe(true);
    expect(isRamadan(new Date(2026, 2, 19))).toBe(true);
    expect(isRamadan(new Date(2026, 2, 20))).toBe(false);
    expect(isRamadan(new Date(2028, 0, 30))).toBe(true); // Ramadan moves into January by 2028
    expect(isRamadan(new Date(2026, 3, 10))).toBe(false); // old fixed window said April was Ramadan
  });

  it('chooses the campaign by date', () => {
    expect(getActiveCampaign(new Date(2026, 11, 10)).id).toBe('kandil');
    expect(getActiveCampaign(new Date(2026, 1, 25)).id).toBe('ramadan');
  });
});

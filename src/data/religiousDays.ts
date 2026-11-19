// Single source for religious days (Agenda, Dini Günler, Özel Günler takvimi).
// Dates are copied from Diyanet İşleri Başkanlığı, vakithesaplama.diyanet.gov.tr "Dini Günler Listesi"
// for 2025–2028, fetched 2026-11-19. Kandil dates are the day whose evening is the kandil night.
// shortcut: hand-copied table ending Dec 2028; extend from the same Diyanet page before mid-2028.

export type ReligiousDayKind =
  | 'regaib'
  | 'mirac'
  | 'berat'
  | 'ramazan'
  | 'kadir'
  | 'ramazanArefe'
  | 'ramazanBayrami'
  | 'kurbanArefe'
  | 'kurbanBayrami'
  | 'hicriYilbasi'
  | 'asure'
  | 'mevlid';

export interface ReligiousDay {
  /** Local calendar date, YYYY-MM-DD. Parse with parseLocalDate, never new Date(string) (that is UTC). */
  date: string;
  kind: ReligiousDayKind;
  name: string;
}

export const RELIGIOUS_DAY_NAMES: Record<ReligiousDayKind, string> = {
  regaib: 'Regaib Kandili',
  mirac: 'Miraç Kandili',
  berat: 'Berat Kandili',
  ramazan: 'Ramazan Başlangıcı',
  kadir: 'Kadir Gecesi',
  ramazanArefe: 'Ramazan Bayramı Arefesi',
  ramazanBayrami: 'Ramazan Bayramı (1. Gün)',
  kurbanArefe: 'Kurban Bayramı Arefesi',
  kurbanBayrami: 'Kurban Bayramı (1. Gün)',
  hicriYilbasi: 'Hicri Yılbaşı',
  asure: 'Aşure Günü',
  mevlid: 'Mevlid Kandili',
};

const DIYANET_DATES: Array<[string, ReligiousDayKind]> = [
  // 2025
  ['2025-01-02', 'regaib'], ['2025-01-26', 'mirac'], ['2025-02-13', 'berat'], ['2025-03-01', 'ramazan'],
  ['2025-03-26', 'kadir'], ['2025-03-29', 'ramazanArefe'], ['2025-03-30', 'ramazanBayrami'],
  ['2025-06-05', 'kurbanArefe'], ['2025-06-06', 'kurbanBayrami'], ['2025-06-26', 'hicriYilbasi'],
  ['2025-07-05', 'asure'], ['2025-09-03', 'mevlid'], ['2025-12-25', 'regaib'],
  // 2026
  ['2026-01-15', 'mirac'], ['2026-02-02', 'berat'], ['2026-02-19', 'ramazan'], ['2026-03-16', 'kadir'],
  ['2026-03-19', 'ramazanArefe'], ['2026-03-20', 'ramazanBayrami'], ['2026-05-26', 'kurbanArefe'],
  ['2026-05-27', 'kurbanBayrami'], ['2026-06-16', 'hicriYilbasi'], ['2026-06-25', 'asure'],
  ['2026-08-24', 'mevlid'], ['2026-12-10', 'regaib'],
  // 2027
  ['2027-01-04', 'mirac'], ['2027-01-22', 'berat'], ['2027-02-08', 'ramazan'], ['2027-03-05', 'kadir'],
  ['2027-03-08', 'ramazanArefe'], ['2027-03-09', 'ramazanBayrami'], ['2027-05-15', 'kurbanArefe'],
  ['2027-05-16', 'kurbanBayrami'], ['2027-06-06', 'hicriYilbasi'], ['2027-06-15', 'asure'],
  ['2027-08-13', 'mevlid'], ['2027-12-02', 'regaib'], ['2027-12-24', 'mirac'],
  // 2028
  ['2028-01-11', 'berat'], ['2028-01-28', 'ramazan'], ['2028-02-22', 'kadir'], ['2028-02-25', 'ramazanArefe'],
  ['2028-02-26', 'ramazanBayrami'], ['2028-05-04', 'kurbanArefe'], ['2028-05-05', 'kurbanBayrami'],
  ['2028-05-25', 'hicriYilbasi'], ['2028-06-03', 'asure'], ['2028-08-02', 'mevlid'], ['2028-11-23', 'regaib'],
  ['2028-12-13', 'mirac'], ['2028-12-30', 'berat'],
];

export const religiousDays: ReligiousDay[] = DIYANET_DATES.map(([date, kind]) => ({
  date,
  kind,
  name: RELIGIOUS_DAY_NAMES[kind],
}));

export const parseLocalDate = (key: string): Date => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const toLocalDateKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/** Days from today (inclusive) onward, in date order. */
export const upcomingReligiousDays = (from: Date = new Date(), limit = Infinity): ReligiousDay[] => {
  const today = toLocalDateKey(from);
  return religiousDays.filter((day) => day.date >= today).slice(0, limit);
};

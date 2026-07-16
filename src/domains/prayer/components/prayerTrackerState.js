export const PRAYER_TRACKER_KEY = 'prayerTracker';

export const DEFAULT_PRAYER_COUNTS = Object.freeze({
  sabah: 0,
  ogle: 0,
  ikindi: 0,
  aksam: 0,
  yatsi: 0,
  vitir: 0,
  oruc: 0,
});

export const normalizePrayerTrackerCounts = (value) => Object.fromEntries(
  Object.keys(DEFAULT_PRAYER_COUNTS).map((key) => {
    const parsed = Number(value?.[key]);
    return [key, Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : 0];
  }),
);

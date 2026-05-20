export const PRAYER_KEYS_ALL = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

export type PrayerKey = typeof PRAYER_KEYS_ALL[number];

export const NOTIFIABLE_PRAYER_KEYS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

export type NotifiablePrayerKey = typeof NOTIFIABLE_PRAYER_KEYS[number];

export type TimingsRecord = Record<string, string>;

/**
 * API'den gelen timings içinden yalnızca desteklenen anahtarları bırakır.
 * Lastthird, Firstthird, Imsak gibi uygulamada kullanılmayan alanları eler.
 */
export const sanitizePrayerTimings = (timings: TimingsRecord | null | undefined): TimingsRecord | null | undefined => {
  if (!timings || typeof timings !== 'object') return timings;

  return PRAYER_KEYS_ALL.reduce<TimingsRecord>((acc, key) => {
    if (timings[key]) {
      acc[key] = timings[key];
    }
    return acc;
  }, {});
};

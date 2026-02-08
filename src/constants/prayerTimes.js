export const PRAYER_KEYS_ALL = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export const NOTIFIABLE_PRAYER_KEYS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

/**
 * API'den gelen timings içinden yalnızca desteklenen anahtarları bırakır.
 * Lastthird, Firstthird, Imsak gibi uygulamada kullanılmayan alanları eler.
 */
export const sanitizePrayerTimings = (timings) => {
  if (!timings || typeof timings !== 'object') return timings;

  return PRAYER_KEYS_ALL.reduce((acc, key) => {
    if (timings[key]) {
      acc[key] = timings[key];
    }
    return acc;
  }, {});
};


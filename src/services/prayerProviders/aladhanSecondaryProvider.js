import axios from 'axios';

const API_URL_COORDS = 'https://api.aladhan.com/v1/timings';
const API_URL_CITY = 'https://api.aladhan.com/v1/timingsByCity';

/**
 * Secondary source strategy
 * Aynı sağlayıcı üzerinde farklı method ile ikinci referans üretir.
 */
export const fetchSecondaryPrayerTimes = async ({ latitude, longitude, city, country, date, timestamp }) => {
  if (latitude && longitude) {
    const response = await axios.get(`${API_URL_COORDS}/${timestamp}`, {
      params: {
        latitude,
        longitude,
        method: 2
      },
      timeout: 10000
    });

    return response?.data?.data || null;
  }

  const response = await axios.get(API_URL_CITY, {
    params: {
      city,
      country,
      method: 2,
      date
    },
    timeout: 10000
  });

  return response?.data?.data || null;
};


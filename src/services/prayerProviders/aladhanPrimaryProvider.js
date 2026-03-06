import axios from 'axios';

const API_URL_COORDS = 'https://api.aladhan.com/v1/timings';
const API_URL_CITY = 'https://api.aladhan.com/v1/timingsByCity';

// Hanafi school for Asr calculation (Diyanet uses Hanafi)
const CALCULATION_SCHOOL = 1;

const getDeviceTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Istanbul';
  } catch {
    return 'Europe/Istanbul';
  }
};

export const fetchPrimaryPrayerTimes = async ({ latitude, longitude, city, country, date, timestamp }) => {
  if (latitude && longitude) {
    const response = await axios.get(`${API_URL_COORDS}/${timestamp}`, {
      params: {
        latitude,
        longitude,
        method: 13,
        school: CALCULATION_SCHOOL,
        timezonestring: getDeviceTimezone(),
      },
      timeout: 10000
    });

    return response?.data?.data || null;
  }

  const response = await axios.get(API_URL_CITY, {
    params: {
      city,
      country,
      method: 13,
      school: CALCULATION_SCHOOL,
      timezonestring: getDeviceTimezone(),
      date
    },
    timeout: 10000
  });

  return response?.data?.data || null;
};


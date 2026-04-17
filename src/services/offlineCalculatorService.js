import { logger } from '../utils/logger';
import { format } from 'date-fns';
import { Coordinates, CalculationMethod, PrayerTimes, Madhab, SunnahTimes } from 'adhan';

/**
 * Device-side prayer time calculator that does not require network access.
 */
class OfflineCalculatorService {
    formatTimeSafely(time) {
        if (!(time instanceof Date) || Number.isNaN(time.getTime())) {
            return null;
        }

        return format(time, 'HH:mm');
    }

    /**
     * Calculate prayer times for coordinates and date.
     * @param {number} latitude
     * @param {number} longitude
     * @param {Date} date
     * @returns {Object|null}
     */
    calculatePrayerTimes(latitude, longitude, date = new Date()) {
        try {
            const coordinates = new Coordinates(latitude, longitude);

            // Turkey method is the closest built-in setup to Diyanet timings.
            const params = CalculationMethod.Turkey();
            params.madhab = Madhab.Hanafi;

            const prayerTimes = new PrayerTimes(coordinates, date, params);
            const sunnahTimes = new SunnahTimes(prayerTimes);

            return {
                Fajr: this.formatTimeSafely(prayerTimes.fajr),
                Sunrise: this.formatTimeSafely(prayerTimes.sunrise),
                Dhuhr: this.formatTimeSafely(prayerTimes.dhuhr),
                Asr: this.formatTimeSafely(prayerTimes.asr),
                Maghrib: this.formatTimeSafely(prayerTimes.maghrib),
                Isha: this.formatTimeSafely(prayerTimes.isha),
                Imsak: this.formatTimeSafely(prayerTimes.fajr),
                Midnight: this.formatTimeSafely(sunnahTimes.middleOfTheNight),
                Lastthird: this.formatTimeSafely(sunnahTimes.lastThirdOfTheNight)
            };
        } catch (error) {
            logger.error('Offline calculation error:', error);
            return null;
        }
    }

    /**
     * Calculate times for every day in a month.
     */
    calculateMonthlyTimes(latitude, longitude, month, year) {
        const daysInMonth = new Date(year, month, 0).getDate();
        const monthlyData = {};

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month - 1, day);
            const dateKey = format(date, 'dd-MM-yyyy');
            monthlyData[dateKey] = this.calculatePrayerTimes(latitude, longitude, date);
        }

        return monthlyData;
    }
}

export const offlineCalculatorService = new OfflineCalculatorService();

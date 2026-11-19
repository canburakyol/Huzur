import { logger } from '../utils/logger';
import { format } from 'date-fns';
import { Coordinates, CalculationMethod, PrayerTimes, Madhab, SunnahTimes } from 'adhan';

type CalculatedPrayerTimes = {
  Fajr: string | null;
  Sunrise: string | null;
  Dhuhr: string | null;
  Asr: string | null;
  Maghrib: string | null;
  Isha: string | null;
  Imsak: string | null;
  Midnight: string | null;
  Lastthird: string | null;
};

type MonthlyPrayerData = Record<string, CalculatedPrayerTimes | null>;

/**
 * Indonesia, Malaysia, Singapore and Brunei publish times with Fajr 20° / Isha 18°
 * (Kemenag, JAKIM, MUIS); Diyanet's 18°/17° puts Fajr there ~10 min late.
 * shortcut: a lat/lon box (also catches southern Thailand/Philippines and Timor),
 * upgrade to real country lookup if more regional methods are added.
 * Mirrored in PrayerDataSyncWorker.kt.
 */
export const usesSoutheastAsiaMethod = (latitude: number, longitude: number): boolean =>
  latitude >= -11.5 && latitude <= 7.5 && longitude >= 94.5 && longitude <= 141.5;

export const getCalculationMethodName = (latitude: number, longitude: number): string =>
  usesSoutheastAsiaMethod(latitude, longitude) ? 'Kemenag' : 'Diyanet';

class OfflineCalculatorService {
  formatTimeSafely(time: Date): string | null {
    if (!(time instanceof Date) || Number.isNaN(time.getTime())) {
      return null;
    }

    return format(time, 'HH:mm');
  }

  calculatePrayerTimes(latitude: number, longitude: number, date = new Date()): CalculatedPrayerTimes | null {
    try {
      const coordinates = new Coordinates(latitude, longitude);

      const params = CalculationMethod.Turkey();
      if (usesSoutheastAsiaMethod(latitude, longitude)) {
        params.fajrAngle = 20;
        params.ishaAngle = 18;
        params.methodAdjustments = { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 };
      }
      // Diyanet's calendar ikindi is asr-ı evvel (shadow = 1 length), also the Shafi asr used in Southeast Asia.
      params.madhab = Madhab.Shafi;

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

  calculateMonthlyTimes(latitude: number, longitude: number, month: number, year: number): MonthlyPrayerData {
    const daysInMonth = new Date(year, month, 0).getDate();
    const monthlyData: MonthlyPrayerData = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateKey = format(date, 'dd-MM-yyyy');
      monthlyData[dateKey] = this.calculatePrayerTimes(latitude, longitude, date);
    }

    return monthlyData;
  }
}

export const offlineCalculatorService = new OfflineCalculatorService();

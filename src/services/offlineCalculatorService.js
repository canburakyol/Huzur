import { logger } from '../utils/logger';
import { format } from 'date-fns';
import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from 'adhan';

/**
 * Cihaz üzerinde internet olmadan namaz vakti hesaplayan servis
 */
class OfflineCalculatorService {
    /**
     * Verilen koordinatlar ve tarih için namaz vakitlerini hesaplar
     * @param {number} latitude 
     * @param {number} longitude 
     * @param {Date} date 
     * @returns {Object} Uygulama formatında vakitler
     */
    calculatePrayerTimes(latitude, longitude, date = new Date()) {
        try {
            const coordinates = new Coordinates(latitude, longitude);
            
            // Türkiye için standart Diyanet parametreleri
            // adhan kütüphanesinde CalculationMethod.Turkey() Diyanet'e en yakın olandır.
            const params = CalculationMethod.Turkey();
            // Diyanet Hanefi mezhebine göre hesaplar (Asr vakti için kritik)
            params.madhab = Madhab.Hanafi;
            
            const prayerTimes = new PrayerTimes(coordinates, date, params);

            // Formatter fonksiyonu
            const formatTime = (time) => format(time, 'HH:mm');

            // Uygulamanın kullandığı Aladhan API formatına uygun JSON objesi döndür
            return {
                Fajr: formatTime(prayerTimes.fajr),
                Sunrise: formatTime(prayerTimes.sunrise),
                Dhuhr: formatTime(prayerTimes.dhuhr),
                Asr: formatTime(prayerTimes.asr),
                Maghrib: formatTime(prayerTimes.maghrib),
                Isha: formatTime(prayerTimes.isha),
                Imsak: formatTime(prayerTimes.fajr), // Imsak genellikle Fajr ile aynı alınır veya Türkiye'de Fajr - 20dk
                Midnight: formatTime(prayerTimes.middleOfTheNight),
                Lastthird: formatTime(prayerTimes.lastThirdOfTheNight)
            };
        } catch (error) {
            logger.error('Offline calculation error:', error);
            return null;
        }
    }

    /**
     * Belirli bir ayın tüm günleri için vakit hesaplar
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

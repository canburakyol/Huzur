/**
 * Widget Service
 * Android widget ile iletişim için Capacitor plugin wrapper
 */

import { Capacitor } from '@capacitor/core';
import { logger } from '../utils/logger';
import Widget from '../plugins/WidgetPlugin';

const PLUGIN_NAME = 'Widget';

const isWidgetAvailableOnDevice = () => {
  try {
    return Capacitor.getPlatform() !== 'web' && Capacitor.isPluginAvailable(PLUGIN_NAME);
  } catch {
    return false;
  }
};

/**
 * Widget plugin referansını al
 */
const getWidgetPlugin = () => {
  if (!isWidgetAvailableOnDevice()) {
    return null;
  }

  return Widget;
};

/**
 * Widget'ı güncelle
 * @param {Object} data - Widget verileri
 * @param {string} data.nextPrayer - Sonraki namaz
 * @param {string} data.timeRemaining - Kalan süre
 * @param {string} data.location - Konum
 */
export const updateWidget = async (data) => {
  if (!isWidgetAvailableOnDevice()) {
    logger.log('Widget: Web platform - skipped');
    return { success: false, platform: Capacitor.getPlatform() };
  }

  try {
    const widgetPlugin = getWidgetPlugin();
    if (!widgetPlugin) {
      return { success: false, error: 'Widget plugin not available' };
    }

    await widgetPlugin.updateWidget(data);
    logger.log('Widget: Updated successfully', data);
    return { success: true };
  } catch (error) {
    logger.error('Widget: Update error', error);
    return { success: false, error: error.message };
  }
};

/**
 * Widget alarmlarını namaz vakitlerine göre ayarla
 * @param {Object} prayerTimes - Namaz vakitleri
 * @param {string} prayerTimes.Fajr - Sabah
 * @param {string} prayerTimes.Sunrise - Güneş
 * @param {string} prayerTimes.Dhuhr - Öğle
 * @param {string} prayerTimes.Asr - İkindi
 * @param {string} prayerTimes.Maghrib - Akşam
 * @param {string} prayerTimes.Isha - Yatsı
 */
export const scheduleWidgetAlarms = async (prayerTimes) => {
  if (!isWidgetAvailableOnDevice()) {
    logger.log('Widget: Web platform - alarms skipped');
    return { success: false, platform: Capacitor.getPlatform() };
  }

  try {
    const widgetPlugin = getWidgetPlugin();
    if (!widgetPlugin) {
      return { success: false, error: 'Widget plugin not available' };
    }

    const result = await widgetPlugin.scheduleWidgetAlarms({ prayerTimes });
    logger.log('Widget: Alarms scheduled', result);
    return result;
  } catch (error) {
    logger.error('Widget: Schedule alarms error', error);
    return { success: false, error: error.message };
  }
};

/**
 * Widget alarmlarını iptal et
 */
export const cancelWidgetAlarms = async () => {
  if (!isWidgetAvailableOnDevice()) {
    return { success: false, platform: Capacitor.getPlatform() };
  }

  try {
    const widgetPlugin = getWidgetPlugin();
    if (!widgetPlugin) {
      return { success: false, error: 'Widget plugin not available' };
    }

    const result = await widgetPlugin.cancelWidgetAlarms();
    logger.log('Widget: Alarms cancelled', result);
    return result;
  } catch (error) {
    logger.error('Widget: Cancel alarms error', error);
    return { success: false, error: error.message };
  }
};

/**
 * Namaz vakitleri değiştiğinde widget'ı ve alarmları güncelle
 * @param {Object} prayerTimes - Namaz vakitleri
 * @param {Object} currentPrayer - Mevcut namaz bilgisi
 */
export const syncWidgetWithPrayerTimes = async (prayerTimes, currentPrayer) => {
  // Widget verilerini hazırla
  const widgetData = {
    nextPrayer: currentPrayer?.name || '',
    timeRemaining: currentPrayer?.timeRemaining || '--:--',
    location: currentPrayer?.location || 'Huzur App'
  };

  // Widget'ı güncelle
  await updateWidget(widgetData);

  // Alarmları yeniden ayarla
  if (prayerTimes) {
    await scheduleWidgetAlarms(prayerTimes);
  }
};

export default {
  updateWidget,
  scheduleWidgetAlarms,
  cancelWidgetAlarms,
  syncWidgetWithPrayerTimes
};

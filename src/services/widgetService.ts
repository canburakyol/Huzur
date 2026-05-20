import { Capacitor } from '@capacitor/core';
import { logger } from '../utils/logger';
import Widget from '../plugins/WidgetPlugin';

const PLUGIN_NAME = 'Widget';

type WidgetData = {
  nextPrayer: string;
  timeRemaining: string;
  location: string;
};

type PrayerTimes = {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
};

type WidgetResult = {
  success: boolean;
  platform?: string;
  error?: string;
};

const isWidgetAvailableOnDevice = (): boolean => {
  try {
    return Capacitor.getPlatform() !== 'web' && Capacitor.isPluginAvailable(PLUGIN_NAME);
  } catch (error) {
    logger.error('[WidgetService] Availability check failed', error);
    return false;
  }
};

const getWidgetPlugin = () => {
  if (!isWidgetAvailableOnDevice()) {
    return null;
  }

  return Widget;
};

export const updateWidget = async (data: WidgetData): Promise<WidgetResult> => {
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
    return { success: false, error: (error as Error).message };
  }
};

export const scheduleWidgetAlarms = async (prayerTimes: PrayerTimes): Promise<WidgetResult> => {
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
    return result as WidgetResult;
  } catch (error) {
    logger.error('Widget: Schedule alarms error', error);
    return { success: false, error: (error as Error).message };
  }
};

export const cancelWidgetAlarms = async (): Promise<WidgetResult> => {
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
    return result as WidgetResult;
  } catch (error) {
    logger.error('Widget: Cancel alarms error', error);
    return { success: false, error: (error as Error).message };
  }
};

export const syncWidgetWithPrayerTimes = async (prayerTimes: PrayerTimes | undefined, currentPrayer: { name?: string; timeRemaining?: string; location?: string } | undefined): Promise<void> => {
  const widgetData: WidgetData = {
    nextPrayer: currentPrayer?.name || '',
    timeRemaining: currentPrayer?.timeRemaining || '--:--',
    location: currentPrayer?.location || 'Huzur App'
  };

  await updateWidget(widgetData);

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

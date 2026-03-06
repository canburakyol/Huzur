/**
 * Prayer Alarm Bridge Service
 * Bridges React/Capacitor JS → Native Android PrayerAlarmPlugin
 * 
 * Uses AlarmManager.setAlarmClock() under the hood for the most
 * reliable alarm scheduling on Android, bypassing Doze mode.
 */
import { Capacitor, registerPlugin } from '@capacitor/core';

const PrayerAlarm = registerPlugin('PrayerAlarm');

const PLATFORM_ANDROID = 'android';

/**
 * Schedule native Adhan alarms for the given prayer timings.
 * Only works on Android; silently no-ops on other platforms.
 *
 * @param {Object} timings - Prayer times object, e.g. { Fajr: "05:30", Dhuhr: "12:45", ... }
 * @param {string} [adhanSound] - Optional raw resource name for Adhan sound (e.g. "adhan_makkah")
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export const scheduleNativeAdhanAlarms = async (timings, adhanSound = null) => {
  if (Capacitor.getPlatform() !== PLATFORM_ANDROID) {
    return { success: false, message: 'Native alarms only available on Android' };
  }

  if (!timings) {
    return { success: false, message: 'No timings provided' };
  }

  try {
    const params = { timings };
    if (adhanSound) {
      params.adhanSound = adhanSound;
    }
    const result = await PrayerAlarm.scheduleAdhanAlarms(params);
    return result;
  } catch (error) {
    return { success: false, message: `Schedule error: ${error}` };
  }
};

/**
 * Cancel all scheduled native Adhan alarms.
 * @returns {Promise<{success: boolean}>}
 */
export const cancelNativeAdhanAlarms = async () => {
  if (Capacitor.getPlatform() !== PLATFORM_ANDROID) {
    return { success: false };
  }

  try {
    const result = await PrayerAlarm.cancelAdhanAlarms();
    return result;
  } catch (error) {
    return { success: false, message: `Cancel error: ${error}` };
  }
};

/**
 * Set the preferred Adhan sound for native playback.
 * @param {string} soundName - Raw resource name (e.g. "adhan_makkah")
 * @returns {Promise<{success: boolean}>}
 */
export const setNativeAdhanSound = async (soundName) => {
  if (Capacitor.getPlatform() !== PLATFORM_ANDROID) {
    return { success: false };
  }

  try {
    const result = await PrayerAlarm.setAdhanSound({ soundName });
    return result;
  } catch (error) {
    return { success: false, message: `Set sound error: ${error}` };
  }
};

/**
 * Check if native Adhan alarms are currently enabled.
 * @returns {Promise<{enabled: boolean}>}
 */
export const isNativeAdhanEnabled = async () => {
  if (Capacitor.getPlatform() !== PLATFORM_ANDROID) {
    return { enabled: false };
  }

  try {
    const result = await PrayerAlarm.isEnabled();
    return result;
  } catch {
    return { enabled: false };
  }
};

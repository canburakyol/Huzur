import { Capacitor, registerPlugin } from '@capacitor/core';
import { logger } from '../utils/logger';

const SettingsPlugin = registerPlugin('SettingsPlugin', {
  web: () => ({
    async openBatterySettings() {
      return { success: false, platform: 'web' };
    }
  })
});

/**
 * Android arka plan güvenilirliği için yardımcı akışlar.
 */
export const openBatteryOptimizationSettings = async () => {
  if (Capacitor.getPlatform() !== 'android') {
    return { success: false, platform: Capacitor.getPlatform() };
  }

  try {
    await SettingsPlugin.openBatterySettings();
    return { success: true };
  } catch (error) {
    logger.warn('[AndroidReliability] Failed to open battery settings', error);
    return { success: false, error: error?.message || 'unknown_error' };
  }
};

export default {
  openBatteryOptimizationSettings
};


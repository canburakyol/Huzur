import { Capacitor, registerPlugin } from '@capacitor/core';
import { logger } from '../utils/logger';

type SettingsPluginType = {
  openBatterySettings: () => Promise<{ success: boolean; platform?: string }>;
};

const SettingsPlugin = registerPlugin<SettingsPluginType>('SettingsPlugin', {
  web: () => ({
    async openBatterySettings() {
      return { success: false, platform: 'web' };
    }
  })
});

export const openBatteryOptimizationSettings = async (): Promise<{ success: boolean; platform?: string; error?: string }> => {
  if (Capacitor.getPlatform() !== 'android') {
    return { success: false, platform: Capacitor.getPlatform() };
  }

  try {
    await SettingsPlugin.openBatterySettings();
    return { success: true };
  } catch (error) {
    logger.warn('[AndroidReliability] Failed to open battery settings', error);
    return { success: false, error: (error as Error)?.message || 'unknown_error' };
  }
};

export default {
  openBatteryOptimizationSettings
};

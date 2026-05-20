import { logger } from '../utils/logger';
import { Capacitor } from '@capacitor/core';
import { AppUpdate } from '@capawesome/capacitor-app-update';
import { openBatteryOptimizationSettings } from './androidReliabilityService';

type AppUpdateInfo = {
  updateAvailable: boolean;
  [key: string]: unknown;
};

class UpdateService {
  platform: string;

  constructor() {
    this.platform = Capacitor.getPlatform();
  }

  async checkForUpdate(): Promise<AppUpdateInfo> {
    if (this.platform !== 'android') return { updateAvailable: false };

    try {
      const result = await AppUpdate.getAppUpdateInfo();
      return result as AppUpdateInfo;
    } catch (error) {
      logger.warn('Update check failed (likely dev env):', error);
      return { updateAvailable: false };
    }
  }

  async startFlexibleUpdate(): Promise<void> {
    if (this.platform !== 'android') return;
    try {
      await AppUpdate.startFlexibleUpdate();
    } catch (error) {
      logger.error('Flexible update failed:', error);
    }
  }

  async startImmediateUpdate(): Promise<void> {
    if (this.platform !== 'android') return;
    try {
      await AppUpdate.performImmediateUpdate();
    } catch (error) {
      logger.error('Immediate update failed:', error);
    }
  }

  async completeFlexibleUpdate(): Promise<void> {
    if (this.platform !== 'android') return;
    try {
      await AppUpdate.completeFlexibleUpdate();
    } catch (error) {
      logger.error('Complete update failed:', error);
    }
  }

  async openAndroidBatteryOptimizationSettings(): Promise<void> {
    return openBatteryOptimizationSettings();
  }
}

export const updateService = new UpdateService();

import { logger } from '../utils/logger';
import { Capacitor } from '@capacitor/core';
import { AppUpdate } from '@capawesome/capacitor-app-update';
import { openBatteryOptimizationSettings } from './androidReliabilityService';

class UpdateService {
  constructor() {
    this.platform = Capacitor.getPlatform();
  }

  async checkForUpdate() {
    if (this.platform !== 'android') return { updateAvailable: false };

    try {
      const result = await AppUpdate.getAppUpdateInfo();
      return result;
    } catch (error) {
      logger.warn('Update check failed (likely dev env):', error);
      return { updateAvailable: false };
    }
  }

  async startFlexibleUpdate() {
    if (this.platform !== 'android') return;
    try {
      await AppUpdate.startFlexibleUpdate();
    } catch (error) {
      logger.error('Flexible update failed:', error);
    }
  }

  async startImmediateUpdate() {
    if (this.platform !== 'android') return;
    try {
      await AppUpdate.performImmediateUpdate();
    } catch (error) {
      logger.error('Immediate update failed:', error);
    }
  }

  async completeFlexibleUpdate() {
    if (this.platform !== 'android') return;
    try {
      await AppUpdate.completeFlexibleUpdate();
    } catch (error) {
      logger.error('Complete update failed:', error);
    }
  }

  async openAndroidBatteryOptimizationSettings() {
    return openBatteryOptimizationSettings();
  }
}

export const updateService = new UpdateService();

import { AppUpdate } from '@capawesome/capacitor-app-update';
import { Capacitor } from '@capacitor/core';

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
      console.warn('Update check failed (likely dev env):', error);
      return { updateAvailable: false };
    }
  }

  async startFlexibleUpdate() {
    if (this.platform !== 'android') return;
    try {
      await AppUpdate.startFlexibleUpdate();
    } catch (error) {
      console.error('Flexible update failed:', error);
    }
  }

  async startImmediateUpdate() {
    if (this.platform !== 'android') return;
    try {
      await AppUpdate.performImmediateUpdate();
    } catch (error) {
      console.error('Immediate update failed:', error);
    }
  }

  async completeFlexibleUpdate() {
    if (this.platform !== 'android') return;
    try {
      await AppUpdate.completeFlexibleUpdate();
    } catch (error) {
      console.error('Complete update failed:', error);
    }
  }
}

export const updateService = new UpdateService();

import { Capacitor, registerPlugin } from '@capacitor/core';
import { logger } from '../utils/logger';

export interface InstallReferrerResult {
  success: boolean;
  referrer?: string;
  consumed?: boolean;
  platform: string;
  error?: string;
}

export interface InstallReferrerPlugin {
  getInstallReferrerDetails(): Promise<InstallReferrerResult>;
  markInstallReferrerConsumed(): Promise<InstallReferrerResult>;
}

const platform = Capacitor.getPlatform();

const noopPlugin: InstallReferrerPlugin = {
  async getInstallReferrerDetails(): Promise<InstallReferrerResult> {
    return {
      success: false,
      referrer: '',
      consumed: false,
      platform,
      error: 'Plugin not available'
    };
  },
  async markInstallReferrerConsumed(): Promise<InstallReferrerResult> {
    return {
      success: false,
      platform,
      error: 'Plugin not available'
    };
  }
};

let InstallReferrer: InstallReferrerPlugin;
try {
  if (platform === 'android') {
    InstallReferrer = registerPlugin<InstallReferrerPlugin>('InstallReferrer', {
      web: () => noopPlugin
    });
  } else {
    InstallReferrer = noopPlugin;
  }
} catch (error) {
  logger.error('[InstallReferrerPlugin] Failed to register plugin', error);
  InstallReferrer = noopPlugin;
}

export { InstallReferrer };
export default InstallReferrer;

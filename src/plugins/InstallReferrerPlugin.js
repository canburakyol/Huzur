import { Capacitor, registerPlugin } from '@capacitor/core';
import { logger } from '../utils/logger';

const noopPlugin = {
  async getInstallReferrerDetails() {
    return {
      success: false,
      referrer: '',
      consumed: false,
      platform: Capacitor.getPlatform(),
      error: 'Plugin not available'
    };
  },
  async markInstallReferrerConsumed() {
    return {
      success: false,
      platform: Capacitor.getPlatform(),
      error: 'Plugin not available'
    };
  }
};

let InstallReferrer;
try {
  if (Capacitor.getPlatform() === 'android') {
    InstallReferrer = registerPlugin('InstallReferrer', {
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

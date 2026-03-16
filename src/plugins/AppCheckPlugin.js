/**
 * App Check Capacitor Plugin
 * Android MainActivity'deki AppCheckPlugin ile iletişim kurar
 */

import { registerPlugin } from '@capacitor/core';

export const AppCheck = registerPlugin('AppCheck', {
  web: () => ({
    async getFirebaseStatus() {
      return {
        success: true,
        initialized: false,
        configured: false,
        messagingAvailable: false,
        debuggable: false,
        platform: 'web'
      };
    },
    async getAppCheckStatus() {
      return {
        success: true,
        tokenPresent: false,
        platform: 'web',
        message: 'App Check is not available on web platform'
      };
    },
    async forceRefreshToken() {
      return {
        success: false,
        error: 'Not available on web platform'
      };
    }
  })
});

export default AppCheck;

/**
 * App Check Capacitor Plugin
 * Android MainActivity'deki AppCheckPlugin ile iletişim kurar
 */

import { registerPlugin } from '@capacitor/core';

export type FirebaseStatusResult = {
  success: boolean;
  initialized: boolean;
  configured: boolean;
  messagingAvailable: boolean;
  debuggable: boolean;
  platform: string;
}

export type AppCheckStatusResult = {
  success: boolean;
  tokenPresent: boolean;
  platform: string;
  message?: string;
}

export type ForceRefreshTokenResult = {
  success: boolean;
  error?: string;
}

export type AppCheckPlugin = {
  getFirebaseStatus(): Promise<FirebaseStatusResult>;
  getAppCheckStatus(): Promise<AppCheckStatusResult>;
  forceRefreshToken(): Promise<ForceRefreshTokenResult>;
}

const webImplementation: AppCheckPlugin = {
  async getFirebaseStatus(): Promise<FirebaseStatusResult> {
    return {
      success: true,
      initialized: false,
      configured: false,
      messagingAvailable: false,
      debuggable: false,
      platform: 'web'
    };
  },
  async getAppCheckStatus(): Promise<AppCheckStatusResult> {
    return {
      success: true,
      tokenPresent: false,
      platform: 'web',
      message: 'App Check is not available on web platform'
    };
  },
  async forceRefreshToken(): Promise<ForceRefreshTokenResult> {
    return {
      success: false,
      error: 'Not available on web platform'
    };
  }
};

export const AppCheck = registerPlugin<AppCheckPlugin>('AppCheck', {
  web: () => webImplementation
});

export default AppCheck;

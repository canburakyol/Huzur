import { registerPlugin, Capacitor } from '@capacitor/core';
import { logger } from '../utils/logger';

export interface NativeAdResult {
  success: boolean;
  platform: string;
  error?: string;
}

export interface NativeAdBridgePlugin {
  initialize(): Promise<NativeAdResult>;
  loadAd(): Promise<NativeAdResult>;
  reportImpression(): Promise<NativeAdResult>;
  reportClick(): Promise<NativeAdResult>;
  destroy(): Promise<NativeAdResult>;
}

const platform = Capacitor.getPlatform();

const noopPlugin: NativeAdBridgePlugin = {
  async initialize(): Promise<NativeAdResult> {
    return { success: false, platform, error: 'Plugin not available' };
  },
  async loadAd(): Promise<NativeAdResult> {
    return { success: false, platform, error: 'Plugin not available' };
  },
  async reportImpression(): Promise<NativeAdResult> {
    return { success: false, platform, error: 'Plugin not available' };
  },
  async reportClick(): Promise<NativeAdResult> {
    return { success: false, platform, error: 'Plugin not available' };
  },
  async destroy(): Promise<NativeAdResult> {
    return { success: true, platform };
  }
};

let NativeAdBridge: NativeAdBridgePlugin;
try {
  if (platform === 'android') {
    NativeAdBridge = registerPlugin<NativeAdBridgePlugin>('NativeAdBridge', {
      web: () => noopPlugin
    });
  } else {
    NativeAdBridge = noopPlugin;
  }
} catch (error) {
  logger.error('[NativeAdBridgePlugin] Failed to register plugin', error);
  NativeAdBridge = noopPlugin;
}

export { NativeAdBridge };
export default NativeAdBridge;

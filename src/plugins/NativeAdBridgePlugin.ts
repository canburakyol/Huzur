import { registerPlugin, Capacitor } from '@capacitor/core';
import { logger } from '../utils/logger';

export type NativeAdResult = {
  success: boolean;
  platform: string;
  error?: string;
}

export type NativeAdBridgePlugin = {
  initialize(): Promise<NativeAdResult>;
  loadAd(options?: { adUnitId?: string }): Promise<NativeAdResult & { adId?: string }>;
  showAd(options: {
    adId: string;
    x: number;
    y: number;
    width: number;
    height: number;
    dpr: number;
    safeTop: number;
    safeBottom: number;
  }): Promise<NativeAdResult>;
  hideAd(options?: { adId?: string }): Promise<NativeAdResult>;
  reportImpression(options?: { adId?: string }): Promise<NativeAdResult>;
  reportClick(options?: { adId?: string }): Promise<NativeAdResult>;
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
  async showAd(): Promise<NativeAdResult> {
    return { success: false, platform, error: 'Plugin not available' };
  },
  async hideAd(): Promise<NativeAdResult> {
    return { success: true, platform };
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

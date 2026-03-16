import { Capacitor } from '@capacitor/core';
import NativeAdBridge from '../plugins/NativeAdBridgePlugin';
import { getNativeAdUnitId } from './adEnvironmentService';
import { isPro } from './proService';

let isInitialized = false;
let currentAdId = null;

export const nativeAdService = {
  adData: null,

  /**
   * Initialize AdMob SDK
   */
  initialize: async () => {
    if (Capacitor.getPlatform() === 'web') {
      return false;
    }

    if (isInitialized) {
      return true;
    }

    try {
      await NativeAdBridge.initialize();
      isInitialized = true;
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Load a Native Advanced Ad
   * @returns {Promise<object|null>} Ad data or null if failed/pro user
   */
  load: async () => {
    if (Capacitor.getPlatform() === 'web' || isPro()) {
      return null;
    }

    if (!isInitialized) {
      const initSuccess = await nativeAdService.initialize();
      if (!initSuccess) return null;
    }

    try {
      const adUnitId = await getNativeAdUnitId();
      const result = await NativeAdBridge.loadAd({ adUnitId });

      if (result && result.adId) {
        nativeAdService.adData = result;
        currentAdId = result.adId;
        return result;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Record impression when ad is viewed
   */
  recordImpression: async () => {
    if (!currentAdId) return;

    try {
      await NativeAdBridge.reportImpression({ adId: currentAdId });
    } catch {
      // Impression tracking failure should not break the UI
    }
  },

  /**
   * Handle click on ad
   */
  handleClick: async () => {
    if (!currentAdId) return;

    try {
      await NativeAdBridge.reportClick({ adId: currentAdId });
    } catch {
      // Click tracking failure should not break the UI
    }
  }
};

export default nativeAdService;

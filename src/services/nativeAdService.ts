import { Capacitor } from '@capacitor/core';
import NativeAdBridge from '../plugins/NativeAdBridgePlugin';
import { getNativeAdUnitId } from './adEnvironmentService';
import { canInitializeAdMob } from './privacyConsentStore';
import { isPro } from './proService';
import { logger } from '../utils/logger';

type AdData = {
  adId: string;
  [key: string]: unknown;
};

type NativeAdServiceType = {
  adData: AdData | null;
  initialize: () => Promise<boolean>;
  load: () => Promise<AdData | null>;
  recordImpression: () => Promise<void>;
  handleClick: () => Promise<void>;
  destroy: () => Promise<void>;
};

let isInitialized = false;
let currentAdId: string | null = null;

export const nativeAdService: NativeAdServiceType = {
  adData: null,

  initialize: async () => {
    if (Capacitor.getPlatform() === 'web') {
      return false;
    }

    if (!canInitializeAdMob()) {
      logger.log('[NativeAd] Initialize blocked until ad consent is granted');
      return false;
    }

    if (isInitialized) {
      return true;
    }

    try {
      await NativeAdBridge.initialize();
      isInitialized = true;
      return true;
    } catch (error) {
      logger.error('[NativeAd] Initialize failed', error);
      return false;
    }
  },

  load: async () => {
    if (Capacitor.getPlatform() === 'web' || isPro() || !canInitializeAdMob()) {
      return null;
    }

    if (!isInitialized) {
      const initSuccess = await nativeAdService.initialize();
      if (!initSuccess) return null;
    }

    try {
      const adUnitId = await getNativeAdUnitId();
      const result = await NativeAdBridge.loadAd({ adUnitId });

      if (result && (result as AdData).adId) {
        nativeAdService.adData = result as AdData;
        currentAdId = (result as AdData).adId;
        return result as AdData;
      }
      return null;
    } catch (error) {
      logger.error('[NativeAd] Load failed', error);
      return null;
    }
  },

  recordImpression: async () => {
    if (!currentAdId) return;

    try {
      await NativeAdBridge.reportImpression({ adId: currentAdId });
    } catch (error) {
      logger.error('[NativeAd] reportImpression failed', error);
    }
  },

  handleClick: async () => {
    if (!currentAdId) return;

    try {
      await NativeAdBridge.reportClick({ adId: currentAdId });
    } catch (error) {
      logger.error('[NativeAd] reportClick failed', error);
    }
  },

  destroy: async () => {
    nativeAdService.adData = null;
    currentAdId = null;
    isInitialized = false;

    if (Capacitor.getPlatform() === 'web') {
      return;
    }

    try {
      await NativeAdBridge.destroy();
    } catch (error) {
      logger.error('[NativeAd] destroy failed', error);
    }
  }
};

export default nativeAdService;

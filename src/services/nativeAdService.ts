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
    if (Capacitor.getPlatform() === 'web') {
      if (import.meta.env.DEV && !isPro()) {
        return {
          adId: 'mock-web-ad',
          headline: 'Huzur Premium - Reklamsız Deneyim',
          body: 'Premium pakete geçerek reklamları tamamen kaldırın ve tüm premium özelliklerin kilidini açın.',
          store: 'Huzur App Store',
          callToAction: 'Detayları Gör',
          images: [{ url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBB2Vnwfe5Ik83esNAEHbGmy-lvEk2-aDGYcg4y3hDD6tnpLhr3gRq9QsJQCpV7XNL-RDsi19N93-Kid8wlhB8OTR1QVr8-t76vEWo548cr0muD5b2uJycoW87sqMExVd-fgI_VtqQgoLdmsB3brqhcElcg9NnJaK_KGLAySIahDt0zp21GXw8c3YaqQoSXURD1_0cJxEjUeWOCiTKVV0vm390KWEHucW4JgRghi1ahpsMpUZ5VZkcdilQGXrrsZB3USwWli0pV6HWx' }],
          icon: { url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBB2Vnwfe5Ik83esNAEHbGmy-lvEk2-aDGYcg4y3hDD6tnpLhr3gRq9QsJQCpV7XNL-RDsi19N93-Kid8wlhB8OTR1QVr8-t76vEWo548cr0muD5b2uJycoW87sqMExVd-fgI_VtqQgoLdmsB3brqhcElcg9NnJaK_KGLAySIahDt0zp21GXw8c3YaqQoSXURD1_0cJxEjUeWOCiTKVV0vm390KWEHucW4JgRghi1ahpsMpUZ5VZkcdilQGXrrsZB3USwWli0pV6HWx' },
          starRating: 5.0
        };
      }
      return null;
    }

    if (isPro() || !canInitializeAdMob()) {
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

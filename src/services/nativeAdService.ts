import { Capacitor } from '@capacitor/core';
import NativeAdBridge from '../plugins/NativeAdBridgePlugin';
import { getNativeAdUnitId } from './adEnvironmentService';
import { isPro } from './proService';
import { logger } from '../utils/logger';
import { ensureAdMobReady } from './admobService';

type AdData = {
  adId: string;
  [key: string]: unknown;
};

type NativeViewportBounds = {
  top: number;
  bottom: number;
};

type NativeAdServiceType = {
  adData: AdData | null;
  initialize: () => Promise<boolean>;
  load: () => Promise<AdData | null>;
  show: (adId: string, rect: DOMRect, viewportBounds: NativeViewportBounds) => Promise<void>;
  hide: () => Promise<void>;
  recordImpression: () => Promise<void>;
  handleClick: () => Promise<void>;
  destroy: () => Promise<void>;
};

let isInitialized = false;
let currentAdId: string | null = null;
let loadPromise: Promise<AdData | null> | null = null;
let loadGeneration = 0;

const LOAD_RETRY_DELAYS_MS = [0, 1200, 3200];

const wait = (delayMs: number) => new Promise<void>((resolve) => {
  window.setTimeout(resolve, delayMs);
});

export const nativeAdService: NativeAdServiceType = {
  adData: null,

  initialize: async () => {
    if (Capacitor.getPlatform() === 'web') {
      return false;
    }

    if (!(await ensureAdMobReady())) {
      logger.log('[NativeAd] Initialize blocked by the current UMP consent state');
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

    if (isPro()) {
      return null;
    }

    if (nativeAdService.adData) {
      return nativeAdService.adData;
    }

    if (loadPromise) {
      return loadPromise;
    }

    const generation = loadGeneration;
    loadPromise = (async () => {
      if (!isInitialized) {
        const initSuccess = await nativeAdService.initialize();
        if (!initSuccess) return null;
      }

      const adUnitId = await getNativeAdUnitId();
      for (let attempt = 0; attempt < LOAD_RETRY_DELAYS_MS.length; attempt += 1) {
        const delayMs = LOAD_RETRY_DELAYS_MS[attempt];
        if (delayMs > 0) {
          await wait(delayMs);
        }

        if (generation !== loadGeneration || isPro()) {
          return null;
        }

        try {
          const result = await NativeAdBridge.loadAd({ adUnitId });

          if (result && (result as AdData).adId) {
            nativeAdService.adData = result as AdData;
            currentAdId = (result as AdData).adId;
            return result as AdData;
          }
        } catch (error) {
          logger.warn(`[NativeAd] Load attempt ${attempt + 1} failed`, error);
        }
      }

      logger.error('[NativeAd] Load failed after retries');
      return null;
    })().finally(() => {
      loadPromise = null;
    });

    return loadPromise;
  },

  recordImpression: async () => {
    if (!currentAdId) return;

    try {
      await NativeAdBridge.reportImpression({ adId: currentAdId });
    } catch (error) {
      logger.error('[NativeAd] reportImpression failed', error);
    }
  },

  show: async (adId: string, rect: DOMRect, viewportBounds: NativeViewportBounds) => {
    if (Capacitor.getPlatform() !== 'android' || !adId) return;

    try {
      await NativeAdBridge.showAd({
        adId,
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
        dpr: window.devicePixelRatio || 1,
        safeTop: viewportBounds.top,
        safeBottom: viewportBounds.bottom,
      });
    } catch (error) {
      logger.error('[NativeAd] show failed', error);
    }
  },

  hide: async () => {
    if (Capacitor.getPlatform() !== 'android') return;

    try {
      await NativeAdBridge.hideAd();
    } catch (error) {
      logger.error('[NativeAd] hide failed', error);
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
    loadGeneration += 1;
    loadPromise = null;
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

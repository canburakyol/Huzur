import { Capacitor } from '@capacitor/core';
import { AppCheck } from '../plugins/AppCheckPlugin';
import { logger } from '../utils/logger';

const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';
const TEST_REWARDED_ID = 'ca-app-pub-3940256099942544/5224354917';
const TEST_NATIVE_ID = 'ca-app-pub-3940256099942544/2247696110';

const REAL_BANNER_ID = import.meta.env.VITE_ADMOB_BANNER_ID || '';
const REAL_REWARDED_ID = import.meta.env.VITE_ADMOB_REWARDED_ID || '';
const REAL_NATIVE_ID = import.meta.env.VITE_ADMOB_NATIVE_ID || '';

let runtimePromise: Promise<AdRuntime> | null = null;

const forceTestAds = import.meta.env.VITE_ADMOB_FORCE_TEST_IDS === 'true';

type AdRuntime = {
  platform: string;
  isNative: boolean;
  isAndroid: boolean;
  isDebugBuild: boolean;
  useTestAds: boolean;
};

const fallbackRuntime: AdRuntime = {
  platform: Capacitor.getPlatform(),
  isNative: Capacitor.getPlatform() !== 'web',
  isAndroid: Capacitor.getPlatform() === 'android',
  isDebugBuild: import.meta.env.DEV || forceTestAds,
  useTestAds: forceTestAds
};

export const getAdRuntime = async (): Promise<AdRuntime> => {
  if (!fallbackRuntime.isNative) {
    return fallbackRuntime;
  }

  if (!runtimePromise) {
    runtimePromise = (async () => {
      try {
        const firebaseStatus = await AppCheck.getFirebaseStatus();
        const isDebugBuild = (firebaseStatus as { debuggable?: boolean })?.debuggable === true || import.meta.env.DEV || forceTestAds;

        return {
          platform: Capacitor.getPlatform(),
          isNative: true,
          isAndroid: Capacitor.getPlatform() === 'android',
          isDebugBuild,
          useTestAds: forceTestAds
        };
      } catch (error) {
        logger.error('[AdEnvironment] Failed to resolve runtime, using fallback', error);
        return fallbackRuntime;
      }
    })();
  }

  return runtimePromise;
};

export const isRewardedConfigured = async (): Promise<boolean> => {
  const runtime = await getAdRuntime();
  return runtime.useTestAds || Boolean(import.meta.env.VITE_ADMOB_REWARDED_ID || REAL_REWARDED_ID);
};

export const getBannerAdUnitId = async (): Promise<string> => {
  const runtime = await getAdRuntime();
  return runtime.useTestAds ? TEST_BANNER_ID : (REAL_BANNER_ID || TEST_BANNER_ID);
};

export const getRewardedAdUnitId = async (): Promise<string> => {
  const runtime = await getAdRuntime();
  return runtime.useTestAds ? TEST_REWARDED_ID : (REAL_REWARDED_ID || TEST_REWARDED_ID);
};

export const getNativeAdUnitId = async (): Promise<string> => {
  const runtime = await getAdRuntime();
  return runtime.useTestAds ? TEST_NATIVE_ID : (REAL_NATIVE_ID || TEST_NATIVE_ID);
};

export const getAdEnvironmentSnapshot = () => ({
  TEST_BANNER_ID,
  TEST_REWARDED_ID,
  TEST_NATIVE_ID,
  REAL_BANNER_ID,
  REAL_REWARDED_ID,
  REAL_NATIVE_ID
});

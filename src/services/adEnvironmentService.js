import { Capacitor } from '@capacitor/core';
import { AppCheck } from '../plugins/AppCheckPlugin';

const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';
const TEST_REWARDED_ID = 'ca-app-pub-3940256099942544/5224354917';
const TEST_NATIVE_ID = 'ca-app-pub-3940256099942544/2247696110';

const REAL_BANNER_ID = import.meta.env.VITE_ADMOB_BANNER_ID || 'ca-app-pub-3074026744164717/3228028982';
const REAL_REWARDED_ID = import.meta.env.VITE_ADMOB_REWARDED_ID || 'ca-app-pub-3074026744164717/3323945837';
const REAL_NATIVE_ID = import.meta.env.VITE_ADMOB_NATIVE_ID || 'ca-app-pub-3074026744164717/7450989229';

let runtimePromise = null;

const forceTestAds = import.meta.env.VITE_ADMOB_FORCE_TEST_IDS === 'true';

const fallbackRuntime = {
  platform: Capacitor.getPlatform(),
  isNative: Capacitor.getPlatform() !== 'web',
  isAndroid: Capacitor.getPlatform() === 'android',
  isDebugBuild: import.meta.env.DEV || forceTestAds,
  useTestAds: forceTestAds
};

export const getAdRuntime = async () => {
  if (!fallbackRuntime.isNative) {
    return fallbackRuntime;
  }

  if (!runtimePromise) {
    runtimePromise = (async () => {
      try {
        const firebaseStatus = await AppCheck.getFirebaseStatus();
        const isDebugBuild = firebaseStatus?.debuggable === true || import.meta.env.DEV || forceTestAds;

        return {
          platform: Capacitor.getPlatform(),
          isNative: true,
          isAndroid: Capacitor.getPlatform() === 'android',
          isDebugBuild,
          useTestAds: forceTestAds
        };
      } catch {
        return fallbackRuntime;
      }
    })();
  }

  return runtimePromise;
};

export const isRewardedConfigured = async () => {
  const runtime = await getAdRuntime();
  return runtime.useTestAds || Boolean(import.meta.env.VITE_ADMOB_REWARDED_ID || REAL_REWARDED_ID);
};

export const getBannerAdUnitId = async () => {
  const runtime = await getAdRuntime();
  return runtime.useTestAds ? TEST_BANNER_ID : REAL_BANNER_ID;
};

export const getRewardedAdUnitId = async () => {
  const runtime = await getAdRuntime();
  return runtime.useTestAds ? TEST_REWARDED_ID : REAL_REWARDED_ID;
};

export const getNativeAdUnitId = async () => {
  const runtime = await getAdRuntime();
  return runtime.useTestAds ? TEST_NATIVE_ID : REAL_NATIVE_ID;
};

export const getAdEnvironmentSnapshot = () => ({
  TEST_BANNER_ID,
  TEST_REWARDED_ID,
  TEST_NATIVE_ID,
  REAL_BANNER_ID,
  REAL_REWARDED_ID,
  REAL_NATIVE_ID
});

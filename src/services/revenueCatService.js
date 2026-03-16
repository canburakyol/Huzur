import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { setProStatus } from './proService';
import { logger } from '../utils/logger';
import crashlyticsReporter, { buildCrashContext } from '../utils/crashlyticsReporter';

const isDev = import.meta.env.DEV;

const API_KEYS = {
  android: import.meta.env.VITE_REVENUECAT_ANDROID_KEY,
  ios: import.meta.env.VITE_REVENUECAT_IOS_KEY
};

const ENTITLEMENT_ID = 'pro_access';
let isRevenueCatConfigured = false;
let customerInfoListenerRegistered = false;

const syncPurchaseStateWithServer = async () => {
  const { syncProStatusWithRevenueCat } = await import('./subscriptionSyncService');
  return syncProStatusWithRevenueCat();
};

const updateProStatusFromInfo = async (customerInfo) => {
  if (!customerInfo?.entitlements?.active) {
    logger.warn('[RevenueCat] Invalid customerInfo received:', customerInfo);
    await setProStatus(false, null, 'revenuecat_sdk', {
      verificationState: 'negative',
      reason: 'negative'
    });
    crashlyticsReporter.logCrash('[RevenueCat] invalid customerInfo payload').catch(() => {});
    return false;
  }

  const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
  const isPro = typeof entitlement !== 'undefined';
  const expiresAt = entitlement?.expirationDate || null;

  logger.log('[RevenueCat] Pro status check:', {
    entitlementId: ENTITLEMENT_ID,
    activeEntitlements: Object.keys(customerInfo.entitlements.active),
    result: isPro
  });

  await setProStatus(isPro, expiresAt, 'revenuecat_sdk', {
    verificationState: isPro ? 'verified' : 'negative',
    reason: isPro ? 'verified' : 'negative'
  });
  crashlyticsReporter.logCrash(
    `[RevenueCat] entitlement active=${isPro} expiresAt=${expiresAt || 'none'}`
  ).catch(() => {});
  return isPro;
};

export const initializeRevenueCat = async () => {
  try {
    const isNativePlatform = window.Capacitor?.isNativePlatform?.() ?? window.Capacitor?.isNative ?? false;

    logger.log('[RevenueCat] Platform check:', {
      capacitorExists: !!window.Capacitor,
      isNative: window.Capacitor?.isNative,
      isNativePlatform: window.Capacitor?.isNativePlatform?.(),
      result: isNativePlatform
    });

    if (!isNativePlatform) {
      logger.log('[RevenueCat] Not initialized (Web Platform)');
      return;
    }

    if (isRevenueCatConfigured) {
      logger.log('[RevenueCat] Already initialized');
      return;
    }

    await Purchases.setLogLevel({ level: isDev ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO });

    const platform = window.Capacitor.getPlatform();
    const apiKey = platform === 'ios' ? API_KEYS.ios : API_KEYS.android;

    logger.log('[RevenueCat] Configuring with platform:', platform, 'API Key exists:', !!apiKey);

    if (!apiKey) {
      logger.error('[RevenueCat] API Key is missing! Check your .env file.');
      return;
    }

    await Purchases.configure({ apiKey });
    isRevenueCatConfigured = true;

    if (!customerInfoListenerRegistered) {
      Purchases.addCustomerInfoUpdateListener((info) => {
        void updateProStatusFromInfo(info);
      });
      customerInfoListenerRegistered = true;
    }

    void checkSubscriptionStatus();
    logger.log('[RevenueCat] Initialized successfully');
  } catch {
    logger.error('[RevenueCat] Init error');
    crashlyticsReporter.logExceptionWithContext(
      new Error('RevenueCat init failed'),
      buildCrashContext('revenuecat_initialize')
    ).catch(() => {});
  }
};

export const checkSubscriptionStatus = async () => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return await updateProStatusFromInfo(customerInfo);
  } catch (error) {
    logger.error('[RevenueCat] Error checking subscription');
    crashlyticsReporter.logExceptionWithContext(
      error,
      buildCrashContext('revenuecat_check_subscription')
    ).catch(() => {});
    return false;
  }
};

export const purchasePackage = async (packageToPurchase) => {
  try {
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: packageToPurchase });
    const localResult = await updateProStatusFromInfo(customerInfo);

    if (localResult) {
      const synced = await syncPurchaseStateWithServer();
      if (synced && typeof synced.isPro === 'boolean') {
        return synced.isPro;
      }
    }

    return localResult;
  } catch (error) {
    if (error.userCancelled) {
      logger.log('User cancelled purchase');
    } else {
      logger.error('[RevenueCat] Purchase error');
      crashlyticsReporter.logExceptionWithContext(
        error,
        buildCrashContext('revenuecat_purchase')
      ).catch(() => {});
    }
    return false;
  }
};

export const getOfferings = async () => {
  try {
    logger.log('[RevenueCat] Fetching offerings...');
    const offerings = await Purchases.getOfferings();
    logger.log('[RevenueCat] Offerings response:', offerings);

    if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
      logger.log('[RevenueCat] Found packages in current offering');
      return offerings.current.availablePackages;
    }

    logger.warn('[RevenueCat] No current offering, checking all offerings...');
    const allOfferings = Object.values(offerings.all);
    for (const offering of allOfferings) {
      if (offering.availablePackages.length > 0) {
        logger.log('[RevenueCat] Found packages in offering:', offering.identifier);
        return offering.availablePackages;
      }
    }

    logger.error('[RevenueCat] No packages found in any offering');
    return [];
  } catch (error) {
    logger.error('[RevenueCat] Error getting offerings');
    crashlyticsReporter.logExceptionWithContext(
      error,
      buildCrashContext('revenuecat_offerings')
    ).catch(() => {});
    return [];
  }
};

export const restorePurchases = async () => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    const localResult = await updateProStatusFromInfo(customerInfo);
    const synced = await syncPurchaseStateWithServer();

    if (synced && typeof synced.isPro === 'boolean') {
      return synced.isPro;
    }

    return localResult;
  } catch (error) {
    logger.error('[RevenueCat] Error restoring purchases');
    crashlyticsReporter.logExceptionWithContext(
      error,
      buildCrashContext('revenuecat_restore')
    ).catch(() => {});
    return false;
  }
};

export default {
  initializeRevenueCat,
  checkSubscriptionStatus,
  purchasePackage,
  getOfferings,
  restorePurchases
};

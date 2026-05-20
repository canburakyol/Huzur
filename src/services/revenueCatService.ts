import { Purchases, LOG_LEVEL, CustomerInfo, Offering } from "@revenuecat/purchases-capacitor";
import { setProStatus } from "./proService";
import { getCurrentUserIdEnsured } from "./authService";
import { logger } from "../utils/logger";
import crashlyticsReporter, { buildCrashContext } from "../utils/crashlyticsReporter";

interface ApiKeys {
  android: string | undefined;
  ios: string | undefined;
}

interface SyncResult {
  isPro?: boolean;
  source?: string;
}

const isDev = import.meta.env.DEV;

const API_KEYS: ApiKeys = {
  android: import.meta.env.VITE_REVENUECAT_ANDROID_KEY,
  ios: import.meta.env.VITE_REVENUECAT_IOS_KEY,
};

const ENTITLEMENT_ID = "pro_access";
let isRevenueCatConfigured = false;
let customerInfoListenerRegistered = false;
let configuredAppUserId: string | null = null;

const syncPurchaseStateWithServer = async (): Promise<SyncResult> => {
  const { syncProStatusWithRevenueCat } = await import("./subscriptionSyncService");
  return syncProStatusWithRevenueCat();
};

const hasActiveProEntitlement = (customerInfo: CustomerInfo): boolean => {
  if (!customerInfo?.entitlements?.active) {
    logger.warn("[RevenueCat] Invalid customerInfo received:", customerInfo);
    crashlyticsReporter.logCrash("[RevenueCat] invalid customerInfo payload");
    return false;
  }

  const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
  const active = typeof entitlement !== "undefined";

  logger.log("[RevenueCat] Pro status check:", {
    entitlementId: ENTITLEMENT_ID,
    activeEntitlements: Object.keys(customerInfo.entitlements.active),
    result: active,
  });

  return active;
};

const syncVerifiedProStatus = async (context: string): Promise<boolean> => {
  let lastSyncError: unknown = null;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const synced = await syncPurchaseStateWithServer();
      if (synced && typeof synced.isPro === "boolean") {
        return synced.isPro === true;
      }
    } catch (syncError) {
      lastSyncError = syncError;
      logger.warn(`[RevenueCat] Server sync attempt ${attempt} failed during ${context}`, syncError);
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }
  }

  if (lastSyncError) {
    logger.warn(`[RevenueCat] Server sync failed during ${context}`, lastSyncError);
  }
  await setProStatus(false, null, "revenuecat_server_sync_failed", {
    verificationState: "negative",
    reason: "server_sync_failed",
  });
  return false;
};

const ensureRevenueCatAppUserId = async (): Promise<string | null> => {
  const appUserID = await getCurrentUserIdEnsured();
  if (!appUserID) {
    logger.error("[RevenueCat] Cannot configure without authenticated Firebase user");
    return null;
  }

  if (configuredAppUserId === appUserID) {
    return appUserID;
  }

  if (isRevenueCatConfigured) {
    const current = await Purchases.getAppUserID().catch(() => ({ appUserID: "" }));
    if (current.appUserID !== appUserID) {
      await Purchases.logIn({ appUserID });
    }
  }

  configuredAppUserId = appUserID;
  return appUserID;
};

export const initializeRevenueCat = async (): Promise<void> => {
  try {
    const isNativePlatform =
      (window as typeof window & { Capacitor?: { isNativePlatform?: () => boolean; isNative?: boolean; getPlatform?: () => string } }).Capacitor
        ?.isNativePlatform?.() ??
      (window as typeof window & { Capacitor?: { isNative?: boolean } }).Capacitor?.isNative ??
      false;

    logger.log("[RevenueCat] Platform check:", {
      capacitorExists: !!(window as typeof window & { Capacitor?: unknown }).Capacitor,
      isNative: (window as typeof window & { Capacitor?: { isNative?: boolean } }).Capacitor?.isNative,
      isNativePlatform:
        (window as typeof window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.(),
      result: isNativePlatform,
    });

    if (!isNativePlatform) {
      logger.log("[RevenueCat] Not initialized (Web Platform)");
      return;
    }

    const appUserID = await ensureRevenueCatAppUserId();
    if (!appUserID) return;

    if (isRevenueCatConfigured) {
      logger.log("[RevenueCat] Already initialized");
      void checkSubscriptionStatus();
      return;
    }

    const platform = (window as typeof window & { Capacitor?: { getPlatform?: () => string } }).Capacitor?.getPlatform?.() || "web";
    const apiKey = platform === "ios" ? API_KEYS.ios : API_KEYS.android;

    logger.log("[RevenueCat] Configuring with platform:", platform, "API Key exists:", !!apiKey);

    if (!apiKey) {
      logger.error("[RevenueCat] API Key is missing! Check your .env file.");
      return;
    }

    await Purchases.setLogLevel({ level: isDev ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO });
    await Purchases.configure({ apiKey, appUserID });
    isRevenueCatConfigured = true;

    if (!customerInfoListenerRegistered) {
      Purchases.addCustomerInfoUpdateListener((info: CustomerInfo) => {
        hasActiveProEntitlement(info);
        void syncVerifiedProStatus("customer_info_listener");
      });
      customerInfoListenerRegistered = true;
    }

    void checkSubscriptionStatus();
    logger.log("[RevenueCat] Initialized successfully");
  } catch (error) {
    logger.error("[RevenueCat] Init error", error);
    crashlyticsReporter.logExceptionWithContext(new Error("RevenueCat init failed"), buildCrashContext("revenuecat_initialize"));
  }
};

export const checkSubscriptionStatus = async (): Promise<boolean> => {
  try {
    if (!isRevenueCatConfigured) {
      return false;
    }
    const { customerInfo } = await Purchases.getCustomerInfo();
    if (!hasActiveProEntitlement(customerInfo)) {
      return syncVerifiedProStatus("subscription_check");
    }
    return syncVerifiedProStatus("subscription_check");
  } catch (error) {
    logger.error("[RevenueCat] Error checking subscription");
    crashlyticsReporter.logExceptionWithContext(error as Error, buildCrashContext("revenuecat_check_subscription"));
    return false;
  }
};

export const purchasePackage = async (packageToPurchase: { identifier: string }): Promise<boolean> => {
  try {
    if (!isRevenueCatConfigured) {
      await initializeRevenueCat();
    }
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: packageToPurchase });
    if (!hasActiveProEntitlement(customerInfo)) {
      await setProStatus(false, null, "revenuecat_purchase_no_entitlement", {
        verificationState: "negative",
        reason: "missing_entitlement_after_purchase",
      });
      return false;
    }

    return syncVerifiedProStatus("purchase");
  } catch (error) {
    if ((error as { userCancelled?: boolean }).userCancelled) {
      logger.log("User cancelled purchase");
    } else {
      logger.error("[RevenueCat] Purchase error");
      crashlyticsReporter.logExceptionWithContext(error as Error, buildCrashContext("revenuecat_purchase"));
    }
    return false;
  }
};

export const getOfferings = async (): Promise<Offering["availablePackages"]> => {
  try {
    logger.log("[RevenueCat] Fetching offerings...");
    const offerings = await Purchases.getOfferings();
    logger.log("[RevenueCat] Offerings response:", offerings);

    if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
      logger.log("[RevenueCat] Found packages in current offering");
      return offerings.current.availablePackages;
    }

    logger.warn("[RevenueCat] No current offering, checking all offerings...");
    const allOfferings = Object.values(offerings.all);
    for (const offering of allOfferings) {
      if (offering.availablePackages.length > 0) {
        logger.log("[RevenueCat] Found packages in offering:", offering.identifier);
        return offering.availablePackages;
      }
    }

    logger.error("[RevenueCat] No packages found in any offering");
    return [];
  } catch (error) {
    logger.error("[RevenueCat] Error getting offerings");
    crashlyticsReporter.logExceptionWithContext(error as Error, buildCrashContext("revenuecat_offerings"));
    return [];
  }
};

export const restorePurchases = async (): Promise<boolean> => {
  try {
    if (!isRevenueCatConfigured) {
      await initializeRevenueCat();
    }

    const { customerInfo } = await Purchases.restorePurchases();
    if (!hasActiveProEntitlement(customerInfo)) {
      await setProStatus(false, null, "revenuecat_restore_no_entitlement", {
        verificationState: "negative",
        reason: "missing_entitlement_after_restore",
      });
      return false;
    }

    return syncVerifiedProStatus("restore");
  } catch (error) {
    logger.error("[RevenueCat] Error restoring purchases");
    crashlyticsReporter.logExceptionWithContext(error as Error, buildCrashContext("revenuecat_restore"));
    return false;
  }
};

export default {
  initializeRevenueCat,
  checkSubscriptionStatus,
  purchasePackage,
  getOfferings,
  restorePurchases,
};

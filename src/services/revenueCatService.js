import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { setProStatus } from './proService';
import { logger } from '../utils/logger';

// RevenueCat API Keys
const API_KEYS = {
  android: import.meta.env.VITE_REVENUECAT_ANDROID_KEY,
  ios: import.meta.env.VITE_REVENUECAT_IOS_KEY
};

const ENTITLEMENT_ID = 'pro_access'; // RevenueCat'te oluşturduğunuz Entitlement ID

export const initializeRevenueCat = async () => {
  try {
    // Platform kontrolü - daha robust
    const isNativePlatform = window.Capacitor?.isNativePlatform?.() ?? window.Capacitor?.isNative ?? false;
    
    logger.log('[RevenueCat] Platform check:', {
      capacitorExists: !!window.Capacitor,
      isNative: window.Capacitor?.isNative,
      isNativePlatform: window.Capacitor?.isNativePlatform?.(),
      result: isNativePlatform
    });

    if (isNativePlatform) {
        await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
        
        const platform = window.Capacitor.getPlatform();
        const apiKey = platform === 'ios' ? API_KEYS.ios : API_KEYS.android;
        
        logger.log('[RevenueCat] Configuring with platform:', platform, 'API Key exists:', !!apiKey);

        if (!apiKey) {
          console.error('[RevenueCat] API Key is missing! Check your .env file.');
          return;
        }

        await Purchases.configure({ apiKey });
        
        // Kullanıcı bilgilerini ve durumunu kontrol et
        await checkSubscriptionStatus();
        
        // Dinleyici ekle (Satın alma güncellemeleri için)
        Purchases.addCustomerInfoUpdateListener((info) => {
            updateProStatusFromInfo(info);
        });
        
        logger.log('[RevenueCat] Initialized successfully');
    } else {
        logger.log('[RevenueCat] Not initialized (Web Platform)');
    }
  } catch (error) {
    console.error('[RevenueCat] Init error:', error);
  }
};

export const checkSubscriptionStatus = async () => {
    try {
        const customerInfo = await Purchases.getCustomerInfo();
        return updateProStatusFromInfo(customerInfo);
    } catch (error) {
        console.error('Error checking subscription:', error);
        return false;
    }
};

export const purchasePackage = async (packageToPurchase) => {
    try {
        const { customerInfo } = await Purchases.purchasePackage({ aPackage: packageToPurchase });
        return updateProStatusFromInfo(customerInfo);
    } catch (error) {
        if (error.userCancelled) {
            logger.log('User cancelled purchase');
        } else {
            console.error('Purchase error:', error);
        }
        return false;
    }
};

export const getOfferings = async () => {
    try {
        logger.log('[RevenueCat] Fetching offerings...');
        const offerings = await Purchases.getOfferings();
        logger.log('[RevenueCat] Offerings response:', offerings);
        
        // 1. Önce 'current' offering'i dene
        if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
            logger.log('[RevenueCat] Found packages in current offering');
            return offerings.current.availablePackages;
        }
        
        // 2. Eğer current boşsa, herhangi bir offering içindeki paketleri dene (Fallback)
        logger.warn('[RevenueCat] No current offering, checking all offerings...');
        const allOfferings = Object.values(offerings.all);
        for (const offering of allOfferings) {
            if (offering.availablePackages.length > 0) {
                logger.log('[RevenueCat] Found packages in offering:', offering.identifier);
                return offering.availablePackages;
            }
        }
        
        console.error('[RevenueCat] No packages found in any offering');
        return [];
    } catch (error) {
        console.error('[RevenueCat] Error getting offerings:', error);
        return [];
    }
};

export const restorePurchases = async () => {
    try {
        const customerInfo = await Purchases.restorePurchases();
        return updateProStatusFromInfo(customerInfo);
    } catch (error) {
        console.error('Error restoring purchases:', error);
        return false;
    }
};

const updateProStatusFromInfo = (customerInfo) => {
    // Null/undefined güvenlik kontrolü
    if (!customerInfo?.entitlements?.active) {
        logger.warn('[RevenueCat] Invalid customerInfo received:', customerInfo);
        setProStatus(false);
        return false;
    }
    
    const isPro = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined";
    
    logger.log('[RevenueCat] Pro status check:', {
        entitlementId: ENTITLEMENT_ID,
        activeEntitlements: Object.keys(customerInfo.entitlements.active),
        result: isPro
    });
    
    setProStatus(isPro);
    return isPro;
};

export default {
    initializeRevenueCat,
    checkSubscriptionStatus,
    purchasePackage,
    getOfferings,
    restorePurchases
};

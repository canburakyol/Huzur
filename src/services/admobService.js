import {
    AdMob,
    BannerAdSize,
    BannerAdPosition,
    RewardAdPluginEvents
} from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';
import { logger } from '../utils/logger';

// Test IDs (Google Official Test IDs - always work)
const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';

// Real IDs - Huzur App (override with env for release channels)
const REAL_BANNER_ID = import.meta.env.VITE_ADMOB_BANNER_ID || 'ca-app-pub-3074026744164717/3228028982';

// Development mode flag - uses Vite environment
const isDev = import.meta.env.DEV;
const BANNER_ID = isDev ? TEST_BANNER_ID : REAL_BANNER_ID;

export const adMobService = {
    /**
     * Initialize AdMob with GDPR Consent Dialog
     * Shows User Messaging Platform (UMP) consent form for EU users
     */
    initialize: async () => {
        if (Capacitor.getPlatform() === 'web') {
            logger.log('AdMob: Web platform - skipped');
            return;
        }

        try {
            // Step 1: Request consent info (checks if user is in GDPR region)
            const consentInfo = await AdMob.requestConsentInfo();

            // Step 2: Show consent form if required and available
            if (consentInfo.isConsentFormAvailable && consentInfo.status === 'REQUIRED') {
                await AdMob.showConsentForm();
            }

            // Step 3: Set request configuration for content filtering
            // This helps filter out inappropriate ads for a religious application
            try {
                await AdMob.setRequestConfiguration({
                    maxAdContentRating: 'General', // G (General Audiences) - Family friendly
                    tagForChildDirectedTreatment: false,
                    tagForUnderAgeOfConsent: false
                });
                logger.log('AdMob: Request configuration set (General rating)');
            } catch (configError) {
                logger.warn('AdMob: Could not set request configuration:', configError);
            }

            // Step 4: Initialize AdMob after consent handling
            await AdMob.initialize({
                requestTrackingAuthorization: true,
                initializeForTesting: isDev,
            });
            logger.log('AdMob: Initialized successfully');
        } catch (e) {
            logger.error('AdMob: Init Error -', e);
            // Fallback: Try to initialize anyway in case consent API fails
            try {
                await AdMob.initialize({
                    requestTrackingAuthorization: true,
                    initializeForTesting: isDev,
                });
            } catch (fallbackError) {
                logger.error('AdMob: Fallback init also failed -', fallbackError);
            }
        }
    },

    /**
     * Show banner at bottom of screen
     */
    showRectangleBanner: async () => {
        if (Capacitor.getPlatform() === 'web') return;

        try {
            if (!AdMob) {
                logger.warn('AdMob: Plugin not available');
                return;
            }
            await AdMob.showBanner({
                adId: BANNER_ID,
                adSize: BannerAdSize.BANNER, // Standard banner (320x50)
                position: BannerAdPosition.BOTTOM_CENTER,
                margin: 0,
                isTesting: isDev
            });
            logger.log('AdMob: Bottom banner shown');
        } catch (e) {
            logger.error('AdMob: Show Banner Error -', e);
        }
    },

    /**
     * Show Medium Rectangle (300x250) in Center
     * Used for Popup Ad
     */
    showMediumRectangle: async () => {
        if (Capacitor.getPlatform() === 'web') return;

        try {
            if (!AdMob) {
                logger.warn('AdMob: Plugin not available');
                return;
            }
            await AdMob.showBanner({
                adId: BANNER_ID, // Using same ID for now (or use specific if available)
                adSize: BannerAdSize.MEDIUM_RECTANGLE, // 300x250
                position: BannerAdPosition.CENTER,
                margin: 0,
                isTesting: isDev
            });
            logger.log('AdMob: Medium Rectangle shown');
        } catch (e) {
            logger.error('AdMob: Show Medium Rect Error -', e);
        }
    },

    /**
     * Hide banner ad (works for both types as they are banners)
     */
    hideBanner: async () => {
        if (Capacitor.getPlatform() === 'web') return;

        try {
            await AdMob.hideBanner();
            await AdMob.removeBanner();
            logger.log('AdMob: Banner hidden/removed');
        } catch (e) {
            logger.error('AdMob: Hide Banner Error -', e);
        }
    },

    /**
     * Stop all ads (for Pro users)
     */
    stopAds: async () => {
        if (Capacitor.getPlatform() === 'web') return;

        logger.log('AdMob: Stopping all ads...');
        try {
            await AdMob.hideBanner();
        } catch (e) {
            logger.warn('AdMob: Error hiding banner:', e);
        }

        try {
            await AdMob.removeBanner();
        } catch (e) {
            logger.warn('AdMob: Error removing banner:', e);
        }
        logger.log('AdMob: Ads stopped for Pro user');
    }
};

// Rewarded Ad IDs
const TEST_REWARDED_ID = 'ca-app-pub-3940256099942544/5224354917';
const REAL_REWARDED_ID = import.meta.env.VITE_ADMOB_REWARDED_ID || 'ca-app-pub-3074026744164717/7167273995';
const REWARDED_ID = isDev ? TEST_REWARDED_ID : REAL_REWARDED_ID;

/**
 * Show Rewarded Ad for Streak Recovery
 * Reward is granted only if the SDK emits a real reward event.
 * @returns {Promise<{success: boolean, reward?: object, error?: string}>}
 */
export const showRewardedAd = async () => {
    if (Capacitor.getPlatform() === 'web') {
        // Web simulation
        logger.log('AdMob: Web platform - rewarded ad simulated');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true, reward: { amount: 1, type: 'streak_recovery' } };
    }

    try {
        if (!AdMob) {
            logger.warn('AdMob: Plugin not available');
            return { success: false, error: 'Plugin not available' };
        }

        await AdMob.prepareRewardVideoAd({
            adId: REWARDED_ID,
            isTesting: isDev
        });

        let rewardedItem = null;
        const rewardedListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, (item) => {
            rewardedItem = item;
        });

        try {
            const immediateReward = await AdMob.showRewardVideoAd();
            if (!rewardedItem && immediateReward?.amount) {
                rewardedItem = immediateReward;
            }
        } finally {
            rewardedListener.remove();
        }

        const amount = Number(rewardedItem?.amount || 0);
        const type = rewardedItem?.type || 'streak_recovery';

        if (amount > 0) {
            logger.log('AdMob: Reward granted', { type, amount });
            return { success: true, reward: { type, amount } };
        }

        return { success: false, error: 'Reward not granted' };
    } catch (error) {
        logger.error('AdMob: Rewarded Ad Error -', error);
        return { success: false, error: error?.message || 'Rewarded ad failed' };
    }
};

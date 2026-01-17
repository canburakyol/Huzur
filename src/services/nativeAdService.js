import { NativeAd } from '@brandonknudsen/admob-native-advanced';
import { Capacitor } from '@capacitor/core';
import { isPro } from './proService';
import { logger } from '../utils/logger';

// Ad Unit IDs
const REAL_NATIVE_ID = 'ca-app-pub-3074026744164717/7450989229';
const TEST_NATIVE_ID = 'ca-app-pub-3940256099942544/2247696110'; // Google Test ID

const isDev = import.meta.env.DEV;

export const nativeAdService = {
    adData: null,

    /**
     * Load a Native Advanced Ad
     * @returns {Promise<object|null>} Ad data or null if failed/pro user
     */
    load: async () => {
        if (Capacitor.getPlatform() === 'web') {
            logger.log('NativeAd: Web platform - skipped');
            return null;
        }

        if (isPro()) {
            logger.log('NativeAd: Pro user - skipped');
            return null;
        }

        try {
            const adId = isDev ? TEST_NATIVE_ID : REAL_NATIVE_ID;
            logger.log('NativeAd: Loading ad...', { adId });
            
            const result = await NativeAd.loadAd({ adId });
            nativeAdService.adData = result;
            logger.log('NativeAd: Ad loaded successfully');
            return result;
        } catch (e) {
            logger.error('NativeAd: Load Error', e);
            return null;
        }
    },

    /**
     * Record impression when ad is viewed
     */
    recordImpression: async () => {
        if (nativeAdService.adData) {
            try {
                await NativeAd.recordImpression();
                logger.log('NativeAd: Impression recorded');
            } catch (e) {
                logger.error('NativeAd: Record Impression Error', e);
            }
        }
    },

    /**
     * Handle click on ad
     */
    handleClick: async () => {
        if (nativeAdService.adData) {
            try {
                await NativeAd.performClick();
                logger.log('NativeAd: Click performed');
            } catch (e) {
                logger.error('NativeAd: Click Error', e);
            }
        }
    }
};

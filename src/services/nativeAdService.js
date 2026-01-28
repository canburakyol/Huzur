import { AdMobNativeAdvanced } from '@brandonknudsen/admob-native-advanced';
import { Capacitor } from '@capacitor/core';
import { isPro } from './proService';

// AdMob App ID and Ad Unit IDs
const ADMOB_APP_ID = 'ca-app-pub-3074026744164717~7167273995';
const REAL_NATIVE_ID = 'ca-app-pub-3074026744164717/7450989229';
const TEST_NATIVE_ID = 'ca-app-pub-3940256099942544/2247696110'; // Google Test ID

const isDev = import.meta.env.DEV;

let isInitialized = false;
let currentAdId = null;

export const nativeAdService = {
    adData: null,

    /**
     * Initialize AdMob SDK
     */
    initialize: async () => {
        if (Capacitor.getPlatform() === 'web') {
            console.log('NativeAdService: Web platform - skipped init');
            return false;
        }

        if (isInitialized) {
            console.log('NativeAdService: Already initialized');
            return true;
        }

        try {
            console.log('NativeAdService: Initializing with app ID:', ADMOB_APP_ID);
            await AdMobNativeAdvanced.initialize({ appId: ADMOB_APP_ID });
            isInitialized = true;
            console.log('NativeAdService: Initialized successfully');
            return true;
        } catch (e) {
            console.error('NativeAdService: Init Error:', e);
            return false;
        }
    },

    /**
     * Load a Native Advanced Ad
     * @returns {Promise<object|null>} Ad data or null if failed/pro user
     */
    load: async () => {
        if (Capacitor.getPlatform() === 'web') {
            console.log('NativeAdService: Web platform - skipped load');
            return null;
        }

        if (isPro()) {
            console.log('NativeAdService: Pro user - skipped load');
            return null;
        }

        // Ensure initialized
        if (!isInitialized) {
            const initSuccess = await nativeAdService.initialize();
            if (!initSuccess) {
                console.log('NativeAdService: Failed to initialize, skipping load');
                return null;
            }
        }

        try {
            const adUnitId = isDev ? TEST_NATIVE_ID : REAL_NATIVE_ID;
            console.log('NativeAdService: Loading ad with unit ID:', adUnitId);
            
            if (!AdMobNativeAdvanced) {
                console.warn('NativeAdService: Plugin not available');
                return null;
            }

            const result = await AdMobNativeAdvanced.loadAd({ adUnitId });
            console.log('NativeAdService: Ad loaded result:', result);
            
            if (result && result.adId) {
                nativeAdService.adData = result;
                currentAdId = result.adId;
                return result;
            } else {
                console.warn('NativeAdService: Ad loaded but result is invalid');
                return null;
            }
        } catch (e) {
            console.error('NativeAdService: Load Error:', e);
            return null;
        }
    },

    /**
     * Record impression when ad is viewed
     */
    recordImpression: async () => {
        if (currentAdId) {
            try {
                await AdMobNativeAdvanced.reportImpression(currentAdId);
                console.log('NativeAdService: Impression recorded for:', currentAdId);
            } catch (e) {
                console.error('NativeAdService: Record Impression Error:', e);
            }
        }
    },

    /**
     * Handle click on ad
     */
    handleClick: async () => {
        if (currentAdId) {
            try {
                await AdMobNativeAdvanced.reportClick(currentAdId);
                console.log('NativeAdService: Click reported for:', currentAdId);
            } catch (e) {
                console.error('NativeAdService: Click Error:', e);
            }
        }
    }
};

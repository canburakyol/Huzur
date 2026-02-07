import { Capacitor } from '@capacitor/core';
import NativeAdBridge from '../plugins/NativeAdBridgePlugin';
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
            return true;
        }

        try {
            console.log('NativeAdService: Initializing NativeAdBridge...');
            await NativeAdBridge.initialize();
            isInitialized = true;
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
        if (Capacitor.getPlatform() === 'web' || isPro()) {
            return null;
        }

        // Ensure initialized
        if (!isInitialized) {
            const initSuccess = await nativeAdService.initialize();
            if (!initSuccess) return null;
        }

        try {
            const adUnitId = isDev ? TEST_NATIVE_ID : REAL_NATIVE_ID;
            const result = await NativeAdBridge.loadAd({ adUnitId });
            
            if (result && result.adId) {
                nativeAdService.adData = result;
                currentAdId = result.adId;
                return result;
            }
            return null;
        } catch (e) {
            console.error('NativeAdService: Load Error:', e);
            return null;
        }
    },

    /**
     * Record impression when ad is viewed
     */
    recordImpression: async () => {
        if (!currentAdId) return;

        try {
            await NativeAdBridge.reportImpression({ adId: currentAdId });
        } catch (e) {
            console.error('NativeAdService: Impression Error:', e);
        }
    },

    /**
     * Handle click on ad
     */
    handleClick: async () => {
        if (!currentAdId) return;

        try {
            await NativeAdBridge.reportClick({ adId: currentAdId });
        } catch (e) {
            console.error('NativeAdService: Click Error:', e);
        }
    }
};

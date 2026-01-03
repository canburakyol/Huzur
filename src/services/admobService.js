import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

// Test IDs (Google Official Test IDs - always work)
const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';

// Real IDs - Huzur App
const REAL_BANNER_ID = 'ca-app-pub-3074026744164717/3228028982'; // Bottom Banner (320x50)

// Development mode flag
const isDev = false; // Production mode - using real ads
const BANNER_ID = isDev ? TEST_BANNER_ID : REAL_BANNER_ID;

export const adMobService = {
    /**
     * Initialize AdMob with GDPR Consent Dialog
     * Shows User Messaging Platform (UMP) consent form for EU users
     */
    initialize: async () => {
        if (Capacitor.getPlatform() === 'web') {
            console.log('AdMob: Web platform - skipped');
            return;
        }

        try {
            // Step 1: Request consent info (checks if user is in GDPR region)
            const consentInfo = await AdMob.requestConsentInfo();
            
            // Step 2: Show consent form if required and available
            if (consentInfo.isConsentFormAvailable && 
                consentInfo.status === 'REQUIRED') {
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
                console.log('AdMob: Request configuration set (General rating)');
            } catch (configError) {
                console.warn('AdMob: Could not set request configuration:', configError);
            }

            // Step 4: Initialize AdMob after consent handling
            await AdMob.initialize({
                requestTrackingAuthorization: true,
                initializeForTesting: isDev,
            });
            console.log('AdMob: Initialized successfully');
        } catch (e) {
            console.error('AdMob: Init Error -', e);
            // Fallback: Try to initialize anyway in case consent API fails
            try {
                await AdMob.initialize({
                    requestTrackingAuthorization: true,
                    initializeForTesting: isDev,
                });
            } catch (fallbackError) {
                console.error('AdMob: Fallback init also failed -', fallbackError);
            }
        }
    },

    /**
     * Show banner at bottom of screen
     */
    showRectangleBanner: async () => {
        if (Capacitor.getPlatform() === 'web') return;

        try {
            await AdMob.showBanner({
                adId: BANNER_ID,
                adSize: BannerAdSize.BANNER, // Standard banner (320x50)
                position: BannerAdPosition.BOTTOM_CENTER,
                margin: 0,
                isTesting: isDev
            });
            console.log('AdMob: Bottom banner shown');
        } catch (e) {
            console.error('AdMob: Show Banner Error -', e);
        }
    },

    /**
     * Show Medium Rectangle (300x250) in Center
     * Used for Popup Ad
     */
    showMediumRectangle: async () => {
        if (Capacitor.getPlatform() === 'web') return;

        try {
            await AdMob.showBanner({
                adId: BANNER_ID, // Using same ID for now (or use specific if available)
                adSize: BannerAdSize.MEDIUM_RECTANGLE, // 300x250
                position: BannerAdPosition.CENTER,
                margin: 0,
                isTesting: isDev
            });
            console.log('AdMob: Medium Rectangle shown');
        } catch (e) {
            console.error('AdMob: Show Medium Rect Error -', e);
        }
    },

    /**
     * Hide banner ad (works for both types as they are banners)
     */
    hideBanner: async () => {
        if (Capacitor.getPlatform() === 'web') return;

        try {
            await AdMob.hideBanner();
            // await AdMob.removeBanner(); // Don't remove, just hide to resume faster if needed? 
            // Actually removeBanner is safer to switch sizes
            await AdMob.removeBanner();
            console.log('AdMob: Banner hidden/removed');
        } catch (e) {
            console.error('AdMob: Hide Banner Error -', e);
        }
    },

    /**
     * Stop all ads (for Pro users)
     */
    stopAds: async () => {
        if (Capacitor.getPlatform() === 'web') return;

        console.log('AdMob: Stopping all ads...');
        try {
            await AdMob.hideBanner();
        } catch (e) {
            console.warn('AdMob: Error hiding banner:', e);
        }
        
        try {
            await AdMob.removeBanner();
        } catch (e) {
            console.warn('AdMob: Error removing banner:', e);
        }
        console.log('AdMob: Ads stopped for Pro user');
    }
};


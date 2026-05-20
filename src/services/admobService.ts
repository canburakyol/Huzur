import {
    AdMob,
    BannerAdSize,
    BannerAdPosition,
    BannerAdPluginEvents,
    RewardAdPluginEvents
} from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';
import { logger } from '../utils/logger';
import crashlyticsReporter from '../utils/crashlyticsReporter';
import {
    getAdRuntime,
    getBannerAdUnitId,
    getRewardedAdUnitId,
    isRewardedConfigured
} from './adEnvironmentService';
import { canInitializeAdMob } from './privacyConsentStore';

type AdRuntime = {
    isDebugBuild: boolean;
    useTestAds: boolean;
};

type AdMobServiceType = {
    initialize: () => Promise<boolean>;
    showRectangleBanner: () => Promise<void>;
    showMediumRectangle: () => Promise<void>;
    hideBanner: () => Promise<void>;
    stopAds: () => Promise<void>;
};

type RewardedAdResult = {
    success: boolean;
    reward?: {
        amount: number;
        type: string;
    };
    error?: string;
};

type BannerAdOptions = {
    adId: string;
    adSize: BannerAdSize;
    position: BannerAdPosition;
    margin: number;
    isTesting: boolean;
};

type RewardAdItem = {
    amount?: number;
    type?: string;
};

type PluginListenerHandle = {
    remove: () => Promise<void> | void;
};

let isInitialized = false;
let initializePromise: Promise<boolean> | null = null;
let listenersRegistered = false;
const adListenerHandles: PluginListenerHandle[] = [];
const BOTTOM_BANNER_MARGIN = 0;

const isNativePlatform = (): boolean => Capacitor.getPlatform() !== 'web';

const adLog = async (...args: unknown[]): Promise<void> => {
    const runtime = await getAdRuntime();
    if (runtime.isDebugBuild) {
        console.info(...args);
    } else {
        logger.log(...args);
    }
};

const adWarn = async (...args: unknown[]): Promise<void> => {
    const runtime = await getAdRuntime();
    if (runtime.isDebugBuild) {
        console.warn(...args);
    } else {
        logger.warn(...args);
    }
};

const registerAdListeners = async (): Promise<void> => {
    if (listenersRegistered || !isNativePlatform()) {
        return;
    }

    listenersRegistered = true;

    adListenerHandles.push(await AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
        void adLog('[AdMob] banner loaded');
        void crashlyticsReporter.logCrash('[AdMob] banner_loaded');
    }));

    adListenerHandles.push(await AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (info: { code?: number } | undefined) => {
        void adWarn('[AdMob] banner failed to load', info);
        void crashlyticsReporter.logCrash(`[AdMob] banner_failed code=${info?.code ?? 'unknown'}`);
    }));

    adListenerHandles.push(await AdMob.addListener(BannerAdPluginEvents.AdImpression, () => {
        void adLog('[AdMob] banner impression');
    }));

    adListenerHandles.push(await AdMob.addListener(RewardAdPluginEvents.Loaded, () => {
        void adLog('[AdMob] rewarded loaded');
    }));

    adListenerHandles.push(await AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (info: { code?: number } | undefined) => {
        void adWarn('[AdMob] rewarded failed to load', info);
        void crashlyticsReporter.logCrash(`[AdMob] rewarded_failed code=${info?.code ?? 'unknown'}`);
    }));
};

const removeAdListeners = async (): Promise<void> => {
    const handles = adListenerHandles.splice(0, adListenerHandles.length);
    await Promise.all(handles.map(async (handle) => {
        try {
            await handle.remove();
        } catch (error) {
            await adWarn('[AdMob] listener remove failed', error);
        }
    }));
    listenersRegistered = false;
};

const ensureInitialized = async (): Promise<boolean> => {
    if (!isNativePlatform()) {
        return false;
    }

    if (!canInitializeAdMob()) {
        await adLog('[AdMob] initialization blocked until ad consent is granted');
        return false;
    }

    if (isInitialized) {
        return true;
    }

    if (!initializePromise) {
        initializePromise = (async () => {
            try {
                const runtime = await getAdRuntime();

                try {
                    await AdMob.setRequestConfiguration({
                        maxAdContentRating: 'General',
                        tagForChildDirectedTreatment: false,
                        tagForUnderAgeOfConsent: false
                    });
                    await adLog('[AdMob] request configuration set');
                } catch (configError) {
                    await adWarn('[AdMob] request configuration failed', configError);
                }

                await AdMob.initialize({
                    requestTrackingAuthorization: true,
                    initializeForTesting: runtime.useTestAds,
                });

                const consentInfo = await AdMob.requestConsentInfo();
                if (consentInfo.isConsentFormAvailable && consentInfo.status === 'REQUIRED') {
                    await AdMob.showConsentForm();
                }

                await registerAdListeners();
                isInitialized = true;
                await adLog(`[AdMob] initialized useTestAds=${runtime.useTestAds}`);
                void crashlyticsReporter.logCrash(`[AdMob] initialized useTestAds=${runtime.useTestAds}`);
                return true;
            } catch (e) {
                await adWarn('[AdMob] init failed, trying fallback', e);

                try {
                    const runtime = await getAdRuntime();
                    await AdMob.initialize({
                        requestTrackingAuthorization: true,
                        initializeForTesting: runtime.useTestAds,
                    });
                    await registerAdListeners();
                    isInitialized = true;
                    void crashlyticsReporter.logCrash(`[AdMob] initialized via fallback useTestAds=${runtime.useTestAds}`);
                    return true;
                } catch (fallbackError) {
                    await adWarn('[AdMob] fallback init failed', fallbackError);
                    void crashlyticsReporter.logExceptionWithContext(fallbackError as Error, {
                        surface: 'admob_init'
                    });
                    return false;
                }
            } finally {
                initializePromise = null;
            }
        })();
    }

    return initializePromise;
};

export const adMobService: AdMobServiceType = {
    initialize: async () => {
        if (!isNativePlatform()) {
            logger.log('AdMob: Web platform - skipped');
            return false;
        }

        return await ensureInitialized();
    },

    showRectangleBanner: async () => {
        if (!isNativePlatform()) return;
        if (!canInitializeAdMob()) return;

        try {
            if (!AdMob) {
                await adWarn('[AdMob] plugin not available for banner');
                return;
            }
            if (!(await ensureInitialized())) {
                return;
            }
            const runtime = await getAdRuntime();
            const bannerId = await getBannerAdUnitId();
            await AdMob.showBanner({
                adId: bannerId,
                adSize: BannerAdSize.BANNER,
                position: BannerAdPosition.BOTTOM_CENTER,
                margin: BOTTOM_BANNER_MARGIN,
                isTesting: runtime.useTestAds
            });
            await adLog(`[AdMob] banner requested id=${bannerId} test=${runtime.useTestAds} margin=${BOTTOM_BANNER_MARGIN}`);
        } catch (e) {
            await adWarn('[AdMob] show banner failed', e);
        }
    },

    showMediumRectangle: async () => {
        if (!isNativePlatform()) return;
        if (!canInitializeAdMob()) return;

        try {
            if (!AdMob) {
                await adWarn('[AdMob] plugin not available for medium rectangle');
                return;
            }
            if (!(await ensureInitialized())) {
                return;
            }
            const runtime = await getAdRuntime();
            const bannerId = await getBannerAdUnitId();
            await AdMob.showBanner({
                adId: bannerId,
                adSize: BannerAdSize.MEDIUM_RECTANGLE,
                position: BannerAdPosition.CENTER,
                margin: 0,
                isTesting: runtime.useTestAds
            });
            await adLog(`[AdMob] medium rectangle requested id=${bannerId} test=${runtime.useTestAds}`);
        } catch (e) {
            await adWarn('[AdMob] show medium rectangle failed', e);
        }
    },

    hideBanner: async () => {
        if (!isNativePlatform()) return;

        try {
            await AdMob.hideBanner();
            await AdMob.removeBanner();
            await adLog('[AdMob] banner hidden and removed');
        } catch (e) {
            await adWarn('[AdMob] hide banner failed', e);
        }
    },

    stopAds: async () => {
        if (!isNativePlatform()) return;

        await adLog('[AdMob] stopping all ads');
        try {
            await AdMob.hideBanner();
        } catch (e) {
            await adWarn('[AdMob] hide banner during stop failed', e);
        }

        try {
            await AdMob.removeBanner();
        } catch (e) {
            await adWarn('[AdMob] remove banner during stop failed', e);
        }
        try {
            const { nativeAdService } = await import('./nativeAdService');
            await nativeAdService.destroy();
        } catch (e) {
            await adWarn('[AdMob] destroy native ad during stop failed', e);
        }
        await removeAdListeners();
        isInitialized = false;
        initializePromise = null;
        await adLog('[AdMob] ads stopped for pro user');
    }
};

export const showRewardedAd = async (): Promise<RewardedAdResult> => {
    if (!canInitializeAdMob()) {
        return { success: false, error: 'Ad consent required' };
    }

    if (!isNativePlatform()) {
        logger.log('AdMob: Web platform - rewarded ad simulated');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true, reward: { amount: 1, type: 'streak_recovery' } };
    }

    try {
        if (!AdMob) {
            await adWarn('[AdMob] plugin not available for rewarded');
            return { success: false, error: 'Plugin not available' };
        }
        if (!(await isRewardedConfigured())) {
            await adWarn('[AdMob] rewarded unit is not configured');
            return { success: false, error: 'Rewarded ad unit is not configured' };
        }
        if (!(await ensureInitialized())) {
            return { success: false, error: 'AdMob could not initialize' };
        }

        const runtime = await getAdRuntime();
        const rewardedId = await getRewardedAdUnitId();

        await AdMob.prepareRewardVideoAd({
            adId: rewardedId,
            isTesting: runtime.useTestAds
        });

        await adLog(`[AdMob] rewarded requested id=${rewardedId} test=${runtime.useTestAds}`);

        let rewardedItem: RewardAdItem | null = null;
        const rewardedListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, (item: RewardAdItem) => {
            rewardedItem = item;
        });

        try {
            const immediateReward = await AdMob.showRewardVideoAd();
            if (!rewardedItem && (immediateReward as RewardAdItem)?.amount) {
                rewardedItem = immediateReward as RewardAdItem;
            }
        } finally {
            rewardedListener.remove();
        }

        const amount = Number(rewardedItem?.amount || 0);
        const type = rewardedItem?.type || 'streak_recovery';

        if (amount > 0) {
            await adLog('[AdMob] reward granted', { type, amount });
            void crashlyticsReporter.logCrash(`[AdMob] rewarded_success type=${type} amount=${amount}`);
            return { success: true, reward: { type, amount } };
        }

        return { success: false, error: 'Reward not granted' };
    } catch (error) {
        await adWarn('[AdMob] rewarded ad failed', error);
        void crashlyticsReporter.logExceptionWithContext(error as Error, {
            surface: 'rewarded_ad'
        });
        return { success: false, error: (error as Error)?.message || 'Rewarded ad failed' };
    }
};

export default adMobService;

import { PushNotifications, Token, PushNotificationSchema, PushNotificationActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import AppCheck from '../plugins/AppCheckPlugin';
import { storageService } from './storageService';
import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';
import { getCurrentUserIdEnsured } from './authService';
import { getFunctionsInstance } from './firebase';
import { logNotificationTapped } from './analyticsService';
import { schedulePrayerNotifications } from './smartNotificationService';
import {
    createNotificationChannels as ensureNotificationChannels
} from './notificationPlatformService';

interface FirebaseStatus {
    initialized: boolean;
    configured: boolean;
    messagingAvailable: boolean;
}

interface InitializeOptions {
    requestPermission?: boolean;
}

interface PrayerTimes {
  [key: string]: string;
}

interface FCMServiceInstance {
    token: string | null;
    listenersSetup: boolean;
    getFirebaseStatus(): Promise<FirebaseStatus>;
    syncTokenWithServer(token: string): Promise<boolean>;
    initialize(options?: InitializeOptions): Promise<string | null>;
    setupListeners(): void;
    getToken(): string;
    removeListeners(): Promise<void>;
}

const SUPPORTED_PRAYER_KEYS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export const FCMService: FCMServiceInstance = {
    token: null,
    listenersSetup: false,

    async getFirebaseStatus(): Promise<FirebaseStatus> {
        if (!Capacitor.isNativePlatform()) {
            return {
                initialized: false,
                configured: false,
                messagingAvailable: false
            };
        }

        try {
            const status = await AppCheck.getFirebaseStatus();
            return {
                initialized: !!status?.initialized,
                configured: !!status?.configured,
                messagingAvailable: !!status?.messagingAvailable
            };
        } catch (error) {
            logger.warn('[FCM] Failed to get Firebase runtime status:', error);
            return {
                initialized: false,
                configured: false,
                messagingAvailable: false
            };
        }
    },

    async syncTokenWithServer(token: string): Promise<boolean> {
        if (!Capacitor.isNativePlatform()) {
            return false;
        }

        const normalizedToken = typeof token === 'string' ? token.trim() : '';
        if (!normalizedToken) {
            return false;
        }

        try {
            const userId = await getCurrentUserIdEnsured();
            if (!userId) {
                return false;
            }

            const { httpsCallable } = await import('firebase/functions');
            const functions = await getFunctionsInstance();
            const syncFcmToken = httpsCallable(functions, 'syncFcmToken');
            await syncFcmToken({ token: normalizedToken });
            return true;
        } catch (error) {
            logger.warn('[FCM] Token sync failed:', error);
            return false;
        }
    },

    async initialize(options: InitializeOptions = {}): Promise<string | null> {
        if (!Capacitor.isNativePlatform()) {
            logger.log('[FCM] Web platform - skipped');
            return null;
        }

        try {
            const { requestPermission = true } = options;
            const firebaseStatus = await this.getFirebaseStatus();

            if (!firebaseStatus.initialized) {
                logger.warn('[FCM] Native Firebase is unavailable; skipping push registration');
                return null;
            }

            const permStatus = requestPermission
                ? await PushNotifications.requestPermissions()
                : await PushNotifications.checkPermissions();

            if (!requestPermission && permStatus.receive === 'prompt') {
                logger.log('[FCM] Push permission has not been requested yet');
                return null;
            }

            if (permStatus.receive !== 'granted') {
                logger.warn('[FCM] Push notification permission denied');
                return null;
            }

            this.setupListeners();
            await PushNotifications.register();

            logger.log('[FCM] Initialized successfully, waiting for token...');
            return null;
        } catch (error) {
            logger.error('[FCM] Initialization error:', error);
            return null;
        }
    },

    setupListeners(): void {
        if (this.listenersSetup) {
            logger.log('[FCM] Listeners already setup, skipping');
            return;
        }
        this.listenersSetup = true;

        PushNotifications.addListener('registration', (token: Token) => {
            logger.sensitive('[FCM] Registration token received');
            this.token = token.value;
            storageService.removeItem(STORAGE_KEYS.FCM_TOKEN);
            this.syncTokenWithServer(token.value).catch((error: Error) => {
                logger.warn('[FCM] Token sync failed', error);
            });

            window.dispatchEvent(new CustomEvent('fcmTokenReceived', {
                detail: { tokenPresent: true }
            }));
        });

        PushNotifications.addListener('registrationError', (error: Error) => {
            logger.error('[FCM] Registration error:', error);
        });

        PushNotifications.addListener('pushNotificationReceived', async (notification: PushNotificationSchema) => {
            logger.log('[FCM] Push received (foreground)');

            await LocalNotifications.schedule({
                notifications: [{
                    title: notification.title || 'Huzur',
                    body: notification.body || '',
                    id: Math.floor(Math.random() * 100000),
                    schedule: { at: new Date(Date.now() + 100) },
                    sound: 'default',
                    extra: notification.data
                }]
            });
        });

        PushNotifications.addListener('pushNotificationActionPerformed', (notification: PushNotificationActionPerformed) => {
            logger.log('[FCM] Push action performed');

            const data = notification.notification.data || {};
            logNotificationTapped((data as Record<string, unknown>).type as string || (data as Record<string, unknown>).action as string || 'push', (data as Record<string, unknown>).prayer as string || null);
            if (data && (data as Record<string, unknown>).action) {
                window.dispatchEvent(new CustomEvent('pushNotificationAction', {
                    detail: data
                }));
            }
        });
    },

    getToken(): string {
        return this.token || '';
    },

    async removeListeners(): Promise<void> {
        if (!Capacitor.isNativePlatform()) return;
        try {
            await PushNotifications.removeAllListeners();
            this.listenersSetup = false;
        } catch (error) {
            logger.warn('[FCM] Failed to remove listeners:', error);
        }
    }
};

export const schedulePrayerAlarms = async (prayerTimes: PrayerTimes): Promise<void> => {
    return schedulePrayerNotifications(prayerTimes);
};

export const createNotificationChannels = async (): Promise<void> => {
    return ensureNotificationChannels();
};

export default FCMService;

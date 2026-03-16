/**
 * Firebase Cloud Messaging (FCM) Service
 * Handles push notifications for prayer time reminders
 * Works even when app is closed or phone is in Doze Mode
 */

import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import AppCheck from '../plugins/AppCheckPlugin';
import { storageService } from './storageService';
import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';
import {
    createNotificationChannels as ensureNotificationChannels
} from './notificationPlatformService';

const SUPPORTED_PRAYER_KEYS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

/**
 * FCM Service Object
 */
export const FCMService = {
    token: null,
    listenersSetup: false,

    async getFirebaseStatus() {
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

    async syncTokenWithServer(token) {
        if (!Capacitor.isNativePlatform()) {
            return false;
        }

        const normalizedToken = typeof token === 'string' ? token.trim() : '';
        if (!normalizedToken) {
            return false;
        }

        try {
            const [{ getFunctionsInstance }, { getCurrentUserIdEnsured }, { httpsCallable }] = await Promise.all([
                import('./firebase'),
                import('./authService'),
                import('firebase/functions')
            ]);

            const userId = await getCurrentUserIdEnsured();
            if (!userId) {
                return false;
            }

            const functions = await getFunctionsInstance();
            const syncFcmToken = httpsCallable(functions, 'syncFcmToken');
            await syncFcmToken({ token: normalizedToken });
            return true;
        } catch (error) {
            logger.warn('[FCM] Token sync failed:', error);
            return false;
        }
    },

    /**
     * Initialize FCM and request permissions
     * @returns {Promise<string|null>} FCM token or null if failed
     */
    async initialize(options = {}) {
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

            const storedToken = storageService.getString(STORAGE_KEYS.FCM_TOKEN);
            if (storedToken) {
                this.token = storedToken;
                await this.syncTokenWithServer(storedToken);
                logger.log('[FCM] Using stored token');
                return storedToken;
            }

            logger.log('[FCM] Initialized successfully, waiting for token...');
            return null;
        } catch (error) {
            logger.error('[FCM] Initialization error:', error);
            return null;
        }
    },

    /**
     * Set up FCM event listeners
     * Includes guard to prevent duplicate listener registration (memory leak prevention)
     */
    setupListeners() {
        if (this.listenersSetup) {
            logger.log('[FCM] Listeners already setup, skipping');
            return;
        }
        this.listenersSetup = true;

        PushNotifications.addListener('registration', (token) => {
            logger.sensitive('[FCM] Registration token received');
            this.token = token.value;
            storageService.setString(STORAGE_KEYS.FCM_TOKEN, token.value);
            this.syncTokenWithServer(token.value).catch(() => {});

            window.dispatchEvent(new CustomEvent('fcmTokenReceived', {
                detail: { token: token.value }
            }));
        });

        PushNotifications.addListener('registrationError', (error) => {
            logger.error('[FCM] Registration error:', error);
        });

        PushNotifications.addListener('pushNotificationReceived', async (notification) => {
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

        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
            logger.log('[FCM] Push action performed');

            const data = notification.notification.data;
            if (data && data.action) {
                window.dispatchEvent(new CustomEvent('pushNotificationAction', {
                    detail: data
                }));
            }
        });
    },

    /**
     * Get current FCM token
     * @returns {string|null}
     */
    getToken() {
        return this.token || storageService.getString(STORAGE_KEYS.FCM_TOKEN, '');
    },

    /**
     * Remove all listeners (cleanup)
     */
    async removeListeners() {
        if (!Capacitor.isNativePlatform()) return;
        try {
            await PushNotifications.removeAllListeners();
            this.listenersSetup = false;
        } catch (error) {
            logger.warn('[FCM] Failed to remove listeners:', error);
        }
    }
};

/**
 * Schedule prayer notifications
 * Redirection to centralized smartNotificationService
 */
export const schedulePrayerAlarms = async (prayerTimes) => {
    const { schedulePrayerNotifications } = await import('./smartNotificationService');
    return schedulePrayerNotifications(prayerTimes);
};

/**
 * Create notification channels (Android 8+)
 */
export const createNotificationChannels = async () => {
    return ensureNotificationChannels();
};

export default FCMService;

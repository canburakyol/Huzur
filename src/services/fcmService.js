/**
 * Firebase Cloud Messaging (FCM) Service
 * Handles push notifications for prayer time reminders
 * Works even when app is closed or phone is in Doze Mode
 */

import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { storageService } from './storageService';
import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';

// FCM Token storage key
const FCM_TOKEN_KEY = 'fcm_token';

/**
 * FCM Service Object
 */
export const FCMService = {
    token: null,
    listenersSetup: false, // Prevents duplicate listener registration (memory leak fix)

    /**
     * Initialize FCM and request permissions
     * @returns {Promise<string|null>} FCM token or null if failed
     */
    async initialize() {
        if (!Capacitor.isNativePlatform()) {
            logger.log('[FCM] Web platform - skipped');
            return null;
        }

        try {
            // Step 1: Request permission
            const permStatus = await PushNotifications.requestPermissions();
            
            if (permStatus.receive !== 'granted') {
                logger.warn('[FCM] Push notification permission denied');
                return null;
            }

            // Step 2: Register for push notifications
            await PushNotifications.register();

            // Step 3: Set up listeners
            this.setupListeners();

            // Step 4: Get stored token or wait for new one
            const storedToken = storageService.getString(STORAGE_KEYS.FCM_TOKEN);
            if (storedToken) {
                this.token = storedToken;
                logger.log('[FCM] Using stored token');
                return storedToken;
            }

            logger.log('[FCM] Initialized successfully, waiting for token...');
            return null;
        } catch (error) {
            console.error('[FCM] Initialization error:', error);
            return null;
        }
    },

    /**
     * Set up FCM event listeners
     * Includes guard to prevent duplicate listener registration (memory leak prevention)
     */
    setupListeners() {
        // Prevent duplicate listener registration
        if (this.listenersSetup) {
            logger.log('[FCM] Listeners already setup, skipping');
            return;
        }
        this.listenersSetup = true;

        // Registration success - get token
        PushNotifications.addListener('registration', (token) => {
            logger.sensitive('[FCM] Registration token received');
            this.token = token.value;
            storageService.setString(STORAGE_KEYS.FCM_TOKEN, token.value);
            
            // Dispatch event for other components
            window.dispatchEvent(new CustomEvent('fcmTokenReceived', { 
                detail: { token: token.value } 
            }));
        });

        // Registration error
        PushNotifications.addListener('registrationError', (error) => {
            console.error('[FCM] Registration error:', error);
        });

        // Push notification received (foreground)
        PushNotifications.addListener('pushNotificationReceived', async (notification) => {
            logger.log('[FCM] Push received (foreground)');
            
            // Show as local notification when app is in foreground
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

        // Push notification action (user tapped)
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
            logger.log('[FCM] Push action performed');
            
            // Handle notification tap - navigate to relevant screen
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
        return this.token || storageService.getString(STORAGE_KEYS.FCM_TOKEN);
    },

    /**
     * Remove all listeners (cleanup)
     */
    async removeListeners() {
        if (!Capacitor.isNativePlatform()) return;
        try {
            await PushNotifications.removeAllListeners();
        } catch (error) {
            logger.warn('[FCM] Failed to remove listeners:', error);
        }
    }
};

/**
 * Schedule prayer notifications using exact alarms
 * This function schedules local notifications with exact timing
 */
export const schedulePrayerAlarms = async (prayerTimes, settings = {}) => {
    if (!Capacitor.isNativePlatform()) {
        logger.log('[Alarm] Web platform - using fallback');
        return;
    }

    const { 
        preAlertMinutes = 15, 
        enablePreAlert = true,
        enableMainAlert = true 
    } = settings;
    
    const notifications = [];
    let idCounter = 3000; // Different range from other notifications

    // Prayer name translations
    const prayerNames = {
        Fajr: 'Sabah',
        Sunrise: 'Güneş',
        Dhuhr: 'Öğle',
        Asr: 'İkindi',
        Maghrib: 'Akşam',
        Isha: 'Yatsı'
    };

    // Cancel existing scheduled notifications first
    try {
        const pending = await LocalNotifications.getPending();
        const prayerIds = pending.notifications
            .filter(n => n.id >= 3000 && n.id < 4000)
            .map(n => ({ id: n.id }));
        
        if (prayerIds.length > 0) {
            await LocalNotifications.cancel({ notifications: prayerIds });
        }
    } catch (e) {
        logger.warn('[Alarm] Could not cancel existing notifications:', e);
    }

    Object.entries(prayerTimes).forEach(([key, timeStr]) => {
        if (!timeStr || key === 'Sunrise') return; // Skip invalid and sunrise

        const name = prayerNames[key] || key;
        const [hours, minutes] = timeStr.split(':').map(Number);
        
        // Schedule for today and tomorrow
        for (let dayOffset = 0; dayOffset <= 1; dayOffset++) {
            const prayerDate = new Date();
            prayerDate.setDate(prayerDate.getDate() + dayOffset);
            prayerDate.setHours(hours, minutes, 0, 0);

            // Skip if time has passed
            if (prayerDate <= new Date()) continue;

            // 1. Main Prayer Time Notification
            if (enableMainAlert) {
                notifications.push({
                    id: idCounter++,
                    title: `🕌 ${name} Namazı Vakti`,
                    body: `${name} namazı vakti girdi. Haydi namaza!`,
                    schedule: { 
                        at: prayerDate,
                        allowWhileIdle: true // Critical for Doze Mode
                    },
                    sound: 'default',
                    channelId: 'prayer_times',
                    smallIcon: 'ic_stat_icon',
                    largeIcon: 'ic_launcher'
                });
            }

            // 2. Pre-alert notification
            if (enablePreAlert && preAlertMinutes > 0) {
                const preAlertDate = new Date(prayerDate.getTime() - (preAlertMinutes * 60000));
                
                if (preAlertDate > new Date()) {
                    notifications.push({
                        id: idCounter++,
                        title: `⏰ ${name} Vaktine ${preAlertMinutes} dk`,
                        body: `${name} namazına ${preAlertMinutes} dakika kaldı. Hazırlanabilirsiniz.`,
                        schedule: { 
                            at: preAlertDate,
                            allowWhileIdle: true
                        },
                        sound: 'default',
                        channelId: 'prayer_reminders',
                        smallIcon: 'ic_stat_icon'
                    });
                }
            }
        }
    });

    if (notifications.length === 0) {
        logger.log('[Alarm] No notifications to schedule');
        return;
    }

    try {
        await LocalNotifications.schedule({ notifications });
        logger.log(`[Alarm] Scheduled ${notifications.length} prayer notifications`);
        
        // Store scheduling info
        storageService.setItem(STORAGE_KEYS.LAST_PRAYER_SCHEDULE, {
            timestamp: new Date().toISOString(),
            count: notifications.length,
            settings: { preAlertMinutes, enablePreAlert, enableMainAlert }
        });
    } catch (error) {
        console.error('[Alarm] Failed to schedule notifications:', error);
    }
};

/**
 * Create notification channels (Android 8+)
 */
export const createNotificationChannels = async () => {
    if (!Capacitor.isNativePlatform()) return;

    try {
        await LocalNotifications.createChannel({
            id: 'prayer_times',
            name: 'Namaz Vakitleri',
            description: 'Namaz vakti bildirimleri',
            importance: 5, // Max importance
            visibility: 1, // Public
            sound: 'default',
            vibration: true,
            lights: true
        });

        await LocalNotifications.createChannel({
            id: 'prayer_reminders',
            name: 'Vakit Hatırlatmaları',
            description: 'Namaz vaktinden önce hatırlatmalar',
            importance: 4, // High
            visibility: 1,
            sound: 'default',
            vibration: true
        });

        await LocalNotifications.createChannel({
            id: 'sticky_counter',
            name: 'Vakit Sayacı',
            description: 'Kalıcı geri sayım bildirimi',
            importance: 2, // Low - no sound
            visibility: 1,
            sound: null,
            vibration: false
        });

        logger.log('[Channels] Notification channels created');
    } catch (error) {
        console.error('[Channels] Failed to create channels:', error);
    }
};

export default FCMService;

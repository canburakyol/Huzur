/**
 * Daily Reminder Notification Service
 * Schedules morning motivation and evening summary reminders
 */

import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { storageService } from './storageService';
import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';

// Notification IDs (reserved range: 5000-5100)
const MORNING_REMINDER_ID = 5001;
const EVENING_REMINDER_ID = 5002;

/**
 * Schedule daily reminder notifications
 * @param {Object} settings - { morningEnabled, eveningEnabled }
 */
export const scheduleDailyReminders = async (settings = {}) => {
    if (!Capacitor.isNativePlatform()) {
        logger.log('[Reminder] Web platform - skipped');
        return;
    }

    const {
        morningEnabled = true,
        eveningEnabled = true
    } = settings;

    try {
        // Request permission first
        const permStatus = await LocalNotifications.requestPermissions();
        if (permStatus.display !== 'granted') {
            logger.warn('[Reminder] Notification permission denied');
            return;
        }

        // Cancel existing daily reminders first
        await cancelDailyReminders();

        const notifications = [];

        // Morning reminder at 08:00
        if (morningEnabled) {
            const morningTime = getNextScheduledTime(8, 0);
            notifications.push({
                id: MORNING_REMINDER_ID,
                title: '🌅 Günaydın!',
                body: 'Sabah namazını kıldın mı? Güne bereketli başla.',
                schedule: {
                    at: morningTime,
                    repeats: true,
                    every: 'day'
                },
                sound: 'default',
                channelId: 'daily_reminders'
            });
            logger.log('[Reminder] Morning reminder scheduled for', morningTime);
        }

        // Evening reminder at 21:00
        if (eveningEnabled) {
            const eveningTime = getNextScheduledTime(21, 0);
            notifications.push({
                id: EVENING_REMINDER_ID,
                title: '📿 Akşam Hatırlatması',
                body: 'Bugün kaç vakit namaz kıldın? Takibini yap.',
                schedule: {
                    at: eveningTime,
                    repeats: true,
                    every: 'day'
                },
                sound: 'default',
                channelId: 'daily_reminders'
            });
            logger.log('[Reminder] Evening reminder scheduled for', eveningTime);
        }

        if (notifications.length > 0) {
            await LocalNotifications.schedule({ notifications });
            logger.log('[Reminder] Daily reminders scheduled successfully');
        }

    } catch (error) {
        console.error('[Reminder] Failed to schedule reminders:', error);
    }
};

/**
 * Cancel all daily reminder notifications
 */
export const cancelDailyReminders = async () => {
    if (!Capacitor.isNativePlatform()) return;

    try {
        await LocalNotifications.cancel({
            notifications: [
                { id: MORNING_REMINDER_ID },
                { id: EVENING_REMINDER_ID }
            ]
        });
        logger.log('[Reminder] Daily reminders cancelled');
    } catch (error) {
        console.error('[Reminder] Failed to cancel reminders:', error);
    }
};

/**
 * Get next scheduled time for given hour/minute
 * If time has passed today, schedule for tomorrow
 */
const getNextScheduledTime = (hour, minute) => {
    const now = new Date();
    const scheduled = new Date();
    scheduled.setHours(hour, minute, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (scheduled <= now) {
        scheduled.setDate(scheduled.getDate() + 1);
    }

    return scheduled;
};

/**
 * Initialize reminders based on saved settings
 */
export const initializeDailyReminders = async () => {
    const morningEnabled = storageService.getBoolean(STORAGE_KEYS.MORNING_REMINDER, false);
    const eveningEnabled = storageService.getBoolean(STORAGE_KEYS.EVENING_REMINDER, false);

    if (morningEnabled || eveningEnabled) {
        await scheduleDailyReminders({ morningEnabled, eveningEnabled });
    }
};

export default {
    scheduleDailyReminders,
    cancelDailyReminders,
    initializeDailyReminders
};

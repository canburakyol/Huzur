import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { storageService } from './storageService';
import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';
import i18n from '../i18n';
import { startAmbientPulse, isAmbientPulseEnabled } from './ambientPrayerPulseService';

const MORNING_REMINDER_ID = 5001;
const EVENING_REMINDER_ID = 5002;

type ReminderRegion = 'TR' | 'EU_DIASPORA';

type TimeWindow = {
  hour: number;
  minute: number;
};

type ReminderWindowConfig = {
  morning: TimeWindow;
  evening: TimeWindow;
};

const REMINDER_WINDOW_CONFIG: Record<ReminderRegion, ReminderWindowConfig> = {
    TR: {
        morning: { hour: 8, minute: 0 },
        evening: { hour: 21, minute: 0 }
    },
    EU_DIASPORA: {
        morning: { hour: 7, minute: 30 },
        evening: { hour: 20, minute: 30 }
    }
};

const EUROPE_TIMEZONE_PREFIXES = ['Europe/'];

type ReminderScheduleWindow = {
  region: ReminderRegion;
  morning: TimeWindow;
  evening: TimeWindow;
};

type ReminderSettings = {
  morningEnabled?: boolean;
  eveningEnabled?: boolean;
};

export const getReminderRegion = (): ReminderRegion => {
    try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Istanbul';
        if (tz === 'Europe/Istanbul') return 'TR';
        if (EUROPE_TIMEZONE_PREFIXES.some(prefix => tz.startsWith(prefix))) return 'EU_DIASPORA';
        return 'TR';
    } catch (error) {
        logger.error('[ReminderService] Region detection failed', error);
        return 'TR';
    }
};

export const getReminderScheduleWindow = (): ReminderScheduleWindow => {
    const region = getReminderRegion();
    return {
        region,
        ...REMINDER_WINDOW_CONFIG[region]
    };
};

export const scheduleDailyReminders = async (settings: ReminderSettings = {}): Promise<void> => {
    if (!Capacitor.isNativePlatform()) {
        logger.log('[Reminder] Web platform - skipped');
        return;
    }

    const {
        morningEnabled = true,
        eveningEnabled = true
    } = settings;

    try {
        const permStatus = await LocalNotifications.requestPermissions();
        if (permStatus.display !== 'granted') {
            logger.warn('[Reminder] Notification permission denied');
            return;
        }

        await cancelDailyReminders();

        const notifications: Array<{
          id: number;
          title: string;
          body: string;
          schedule: { at: Date; repeats: boolean; every: 'day' };
          sound: string;
          channelId: string;
        }> = [];

        const scheduleWindow = getReminderScheduleWindow();

        if (morningEnabled) {
            const morningTime = getNextScheduledTime(scheduleWindow.morning.hour, scheduleWindow.morning.minute);
            notifications.push({
                id: MORNING_REMINDER_ID,
                title: i18n.t('reminders.morning.title', '🌅 Günaydın!'),
                body: i18n.t('reminders.morning.body', 'Sabah namazını kıldın mı? Güne bereketli başla.'),
                schedule: {
                    at: morningTime,
                    repeats: true,
                    every: 'day'
                },
                sound: 'default',
                channelId: 'daily_reminders'
            });
            logger.log('[Reminder] Morning reminder scheduled for', morningTime, 'region:', scheduleWindow.region);
        }

        if (eveningEnabled) {
            const eveningTime = getNextScheduledTime(scheduleWindow.evening.hour, scheduleWindow.evening.minute);
            notifications.push({
                id: EVENING_REMINDER_ID,
                title: i18n.t('reminders.evening.title', '📿 Akşam Hatırlatması'),
                body: i18n.t('reminders.evening.body', 'Bugün kaç vakit namaz kıldın? Takibini yap.'),
                schedule: {
                    at: eveningTime,
                    repeats: true,
                    every: 'day'
                },
                sound: 'default',
                channelId: 'daily_reminders'
            });
            logger.log('[Reminder] Evening reminder scheduled for', eveningTime, 'region:', scheduleWindow.region);
        }

        if (notifications.length > 0) {
            await LocalNotifications.schedule({ notifications });
            logger.log('[Reminder] Daily reminders scheduled successfully');
        }

    } catch (error) {
        logger.error('[Reminder] Failed to schedule reminders:', error);
    }
};

export const cancelDailyReminders = async (): Promise<void> => {
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
        logger.error('[Reminder] Failed to cancel reminders:', error);
    }
};

const getNextScheduledTime = (hour: number, minute: number): Date => {
    const now = new Date();
    const scheduled = new Date();
    scheduled.setHours(hour, minute, 0, 0);

    if (scheduled <= now) {
        scheduled.setDate(scheduled.getDate() + 1);
    }

    return scheduled;
};

export const initializeDailyReminders = async (): Promise<void> => {
    const morningEnabled = storageService.getBoolean(STORAGE_KEYS.MORNING_REMINDER, false);
    const eveningEnabled = storageService.getBoolean(STORAGE_KEYS.EVENING_REMINDER, false);

    if (morningEnabled || eveningEnabled) {
        await scheduleDailyReminders({ morningEnabled, eveningEnabled });
    }
};

export const checkAndTriggerAmbientPulse = (minutesUntilPrayer: number): void => {
    if (minutesUntilPrayer <= 15 && minutesUntilPrayer > 14 && isAmbientPulseEnabled()) {
        startAmbientPulse();
        logger.log('[Reminder] Ambient prayer pulse triggered,', minutesUntilPrayer, 'min before prayer');
    }
};

export default {
    scheduleDailyReminders,
    cancelDailyReminders,
    initializeDailyReminders,
    checkAndTriggerAmbientPulse
};

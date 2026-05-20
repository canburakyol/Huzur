import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { logger } from '../utils/logger';

type NotificationChannel = {
  id: string;
  name: string;
  description: string;
  importance: number;
  visibility: number;
  sound: string | null;
  vibration: boolean;
  lights: boolean;
};

export const NOTIFICATION_CHANNELS: Record<string, NotificationChannel> = {
  PRAYER: {
    id: 'prayer_times',
    name: 'Namaz Vakitleri',
    description: 'Namaz vakti bildirimleri',
    importance: 5,
    visibility: 1,
    sound: 'default',
    vibration: true,
    lights: true
  },
  PRAYER_REMINDER: {
    id: 'prayer_reminders',
    name: 'Vakit Hatırlatmaları',
    description: 'Namaz vaktinden önce hatırlatmalar',
    importance: 4,
    visibility: 1,
    sound: 'default',
    vibration: true,
    lights: true
  },
  STICKY_COUNTER: {
    id: 'sticky_counter',
    name: 'Vakit Sayacı',
    description: 'Kalıcı geri sayım bildirimi',
    importance: 2,
    visibility: 1,
    sound: null,
    vibration: false,
    lights: false
  },
  STREAK: {
    id: 'streak_channel',
    name: 'Seri Uyarıları',
    description: 'Seri koruma bildirimleri',
    importance: 4,
    visibility: 1,
    sound: 'default',
    vibration: true,
    lights: true
  },
  REMINDER: {
    id: 'daily_reminders',
    name: 'Günlük Hatırlatıcılar',
    description: 'Günlük zikir ve görev hatırlatmaları',
    importance: 3,
    visibility: 1,
    sound: 'default',
    vibration: true,
    lights: true
  },
  UPDATES: {
    id: 'updates_channel',
    name: 'Uygulama Güncellemeleri',
    description: 'Yeni özellik ve duyuru bildirimleri',
    importance: 2,
    visibility: 1,
    sound: 'default',
    vibration: false,
    lights: false
  }
};

const CHANNEL_LIST = Object.values(NOTIFICATION_CHANNELS);

export const STICKY_NOTIFICATION_ID = 1001;
export const PRAYER_NOTIFICATION_ID_RANGE = { min: 3000, max: 3999 };

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (Capacitor.getPlatform() === 'web') {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  try {
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  } catch (error) {
    logger.error('[NotificationPlatform] Permission request failed', error);
    return false;
  }
};

export const checkNotificationPermission = async (): Promise<boolean> => {
  if (Capacitor.getPlatform() === 'web') {
    if (!('Notification' in window)) return false;
    return Notification.permission === 'granted';
  }

  try {
    const result = await LocalNotifications.checkPermissions();
    return result.display === 'granted';
  } catch (error) {
    logger.error('[NotificationPlatform] Permission check failed', error);
    return false;
  }
};

export const createNotificationChannels = async (): Promise<void> => {
  if (Capacitor.getPlatform() !== 'android') return;

  try {
    await Promise.all(CHANNEL_LIST.map((channel) => LocalNotifications.createChannel(channel)));
    logger.log('[NotificationPlatform] Notification channels ensured');
  } catch (error) {
    logger.error('[NotificationPlatform] Channel creation failed', error);
  }
};

export const clearPrayerNotificationsInRange = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const pending = await LocalNotifications.getPending();
    const ids = pending.notifications
      .filter((n) => n.id >= PRAYER_NOTIFICATION_ID_RANGE.min && n.id <= PRAYER_NOTIFICATION_ID_RANGE.max)
      .map((n) => ({ id: n.id }));

    if (ids.length) {
      await LocalNotifications.cancel({ notifications: ids });
    }
  } catch (error) {
    logger.warn('[NotificationPlatform] Failed to clear prayer notification range', error);
  }
};

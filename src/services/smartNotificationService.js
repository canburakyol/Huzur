/**
 * Smart Notification Service
 * Akıllı bildirimler ile kullanıcıyı uygulamaya geri getir
 * Centralized notification management for Huzur App
 */

import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { storageService } from './storageService';
import { logger } from '../utils/logger';
import { analyticsService, ANALYTICS_EVENTS } from './analyticsService';
import { getExperimentVariant } from './experimentService';
import { getActiveCampaign, resolveCampaignCopy } from './campaignService';
import {
  NOTIFICATION_CHANNELS,
  requestNotificationPermission,
  createNotificationChannels,
  STICKY_NOTIFICATION_ID
} from './notificationPlatformService';

export { requestNotificationPermission };
export { NOTIFICATION_CHANNELS };

const NOTIFICATION_STORAGE_KEY = 'huzur_scheduled_notifications';
const NOTIFICATION_HISTORY_KEY = 'huzur_notification_history';
const NOTIFICATION_PREFS_KEY = 'huzur_notification_prefs';

// Namaz vakitleri bildirim mesajları
const PRAYER_NOTIFICATIONS = {
  Fajr: {
    title: '🌅 Fajr Prayer Time',
    body: 'Start your day with blessing. Fajr time is approaching!',
    minutesBefore: 15
  },
  Sunrise: { // Güneş (İşrak)
    title: '☀️ Sunrise',
    body: 'The sun has risen. Prepare for Ishraq prayer.',
    minutesBefore: 5
  },
  Dhuhr: {
    title: '🕌 Dhuhr Prayer Time',
    body: 'Dhuhr prayer time is approaching. Take a short break for prayer.',
    minutesBefore: 15
  },
  Asr: {
    title: '🌤️ Asr Prayer Time',
    body: 'Asr prayer time is coming. Pause your daily work for prayer.',
    minutesBefore: 15
  },
  Maghrib: {
    title: '🌇 Maghrib Prayer Time',
    body: 'Sunset is near, Maghrib prayer time is approaching.',
    minutesBefore: 10
  },
  Isha: {
    title: '🌙 Isha Prayer Time',
    body: 'Isha prayer time is coming. End your day with prayer.',
    minutesBefore: 15
  }
};

// Streak bildirim mesajları
const STREAK_NOTIFICATIONS = [
  {
    title: '🔥 Your Streak Is at Risk!',
    body: 'You have not opened the app today. Open now to protect your {days}-day streak!',
    hour: 20,
    minute: 0
  },
  {
    title: '⏰ Last 4 Hours!',
    body: 'Only 4 hours left to save your streak. Open the app now!',
    hour: 23,
    minute: 0
  }
];

// Günlük hatırlatıcı bildirimler
const DAILY_REMINDERS = [
  {
    id: 'zikir_morning',
    title: '📿 Daily Dhikr Reminder',
    body: 'Have you completed your dhikr today?',
    hour: 10,
    minute: 0
  },
  {
    id: 'quran_afternoon',
    title: '📖 Quran Reading Time',
    body: 'A great time to complete your daily Quran reading goal!',
    hour: 14,
    minute: 0
  },
  {
    id: 'tasks_evening',
    title: '✅ Daily Tasks',
    body: 'Have you completed today’s worship tasks?',
    hour: 18,
    minute: 0
  }
];

/**
 * Kullanıcı tercihlerini al
 */
export const getNotificationPreferences = () => {
  const defaults = {
    prayer: true,
    streak: true,
    reminder: true,
    updates: true,
    preAlertMinutes: 15,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00'
  };
  return storageService.getItem(NOTIFICATION_PREFS_KEY) || defaults;
};

const parseHourMinute = (timeValue, fallbackHour, fallbackMinute) => {
  const [h, m] = String(timeValue || '').split(':').map((v) => Number(v));
  if (Number.isInteger(h) && Number.isInteger(m) && h >= 0 && h <= 23 && m >= 0 && m <= 59) {
    return { hour: h, minute: m };
  }
  return { hour: fallbackHour, minute: fallbackMinute };
};

const isInQuietHours = (date, prefs) => {
  if (!prefs?.quietHoursEnabled) return false;

  const { hour: startHour, minute: startMinute } = parseHourMinute(prefs.quietHoursStart, 22, 0);
  const { hour: endHour, minute: endMinute } = parseHourMinute(prefs.quietHoursEnd, 7, 0);

  const nowMinutes = date.getHours() * 60 + date.getMinutes();
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  if (startMinutes === endMinutes) return true;
  if (startMinutes < endMinutes) {
    return nowMinutes >= startMinutes && nowMinutes < endMinutes;
  }

  return nowMinutes >= startMinutes || nowMinutes < endMinutes;
};

const shouldScheduleAt = (date, prefs, type) => {
  if (!date || !(date instanceof Date)) return false;
  if (!isInQuietHours(date, prefs)) return true;

  analyticsService.logQuietHoursSkipped(type, date.getHours(), date.getMinutes());
  return false;
};

const getPushCopyVariantText = ({ variant, campaign, baseTitle, baseBody }) => {
  const id = campaign?.id || 'evergreen';
  const group = {
    A: {
      title: `${baseTitle}`,
      body: `${baseBody}`
    },
    B: {
      title: id === 'ramadan' ? '🌙 Ramazan Vakti Yaklaşıyor' : `⏰ ${baseTitle}`,
      body: id === 'friday'
        ? 'Cuma gününün bereketi için kısa bir hazırlık yap.'
        : `${baseBody} Şimdi niyetlenmek için güzel bir an.`
    },
    C: {
      title: id === 'kandil' ? '🕯️ Manevi Hatırlatma' : `✨ ${baseTitle}`,
      body: `${baseBody} Huzur için küçük bir mola ver.`
    }
  };

  return group[variant] || group.A;
};

/**
 * Kullanıcı tercihlerini güncelle
 */
export const updateNotificationPreferences = async (newPrefs) => {
  const current = getNotificationPreferences();
  const updated = { ...current, ...newPrefs };
  storageService.setItem(NOTIFICATION_PREFS_KEY, updated);
  
  // Tercihler değiştiğinde gerekli aksiyonları al (örn: bildirimleri iptal et)
  if (!updated.prayer) await cancelNotificationsByType('prayer');
  if (!updated.streak) await cancelNotificationsByType('streak');
  if (!updated.reminder) await cancelNotificationsByType('reminder');
  
  return updated;
};

/**
 * Namaz vakti bildirimlerini planla
 * @param {Object} prayerTimes - Namaz vakitleri
 * @param {Date} date - Hangi gün için
 */
export const schedulePrayerNotifications = async (prayerTimes, date = new Date()) => {
  const prefs = getNotificationPreferences();
  if (!prefs.prayer || !prayerTimes) return;

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  const notifications = [];
  const baseId = date.getDate() * 100; // Günlük benzersiz ID base
  const campaign = getActiveCampaign(date);
  analyticsService.logCampaignResolved(campaign.id, campaign.region, campaign.variant);
  const pushVariant = getExperimentVariant('push_copy_v1');
  analyticsService.logExperimentAssigned('push_copy_v1', pushVariant, 'schedule_prayer_notifications');

  // Vakit adları mapping
  const prayerNames = {
    Fajr: 'Sabah',
    Sunrise: 'Güneş',
    Dhuhr: 'Öğle',
    Asr: 'İkindi',
    Maghrib: 'Akşam',
    Isha: 'Yatsı'
  };

  Object.entries(PRAYER_NOTIFICATIONS).forEach(([prayer, config], index) => {
    const timeStr = prayerTimes[prayer];
    if (!timeStr) return;

    const [hours, minutes] = timeStr.split(':').map(Number);
    
    // 1. Ana Vakit Bildirimi
    const prayerTime = new Date(date);
    prayerTime.setHours(hours, minutes, 0, 0);

    // Geçmişte değilse planla
    if (prayerTime > new Date()) {
      if (!shouldScheduleAt(prayerTime, prefs, 'prayer_main')) return;

      const campaignCopy = resolveCampaignCopy({
        campaign,
        type: 'reminder',
        fallbackTitle: `Ezan Vakti: ${prayerNames[prayer] || prayer}`,
        fallbackBody: 'Vakit girdi. Haydi namaza!'
      });
      const variantCopy = getPushCopyVariantText({
        variant: pushVariant,
        campaign,
        baseTitle: campaignCopy.title,
        baseBody: campaignCopy.body
      });

      notifications.push({
        id: baseId + index,
        title: variantCopy.title,
        body: variantCopy.body,
        schedule: { at: prayerTime },
        sound: NOTIFICATION_CHANNELS.PRAYER.sound,
        channelId: NOTIFICATION_CHANNELS.PRAYER.id,
        smallIcon: 'ic_notification',
        actionTypeId: 'PRAYER_ACTION',
        extra: {
          type: 'prayer',
          prayer: prayer,
          action: 'now',
          campaign: campaign.id,
          campaign_variant: campaign.variant,
          push_variant: pushVariant
        }
      });

      analyticsService.logPushVariantDelivered(pushVariant, campaign.id, 'prayer_main');
    }

    // 2. Vakit Öncesi Hatırlatma
    if (config.minutesBefore > 0) {
      const preTime = new Date(prayerTime.getTime() - (config.minutesBefore * 60000));
      
      if (preTime > new Date()) {
        if (!shouldScheduleAt(preTime, prefs, 'prayer_pre')) return;

        const campaignCopy = resolveCampaignCopy({
          campaign,
          type: 'reminder',
          fallbackTitle: config.title,
          fallbackBody: config.body
        });
        const variantCopy = getPushCopyVariantText({
          variant: pushVariant,
          campaign,
          baseTitle: campaignCopy.title,
          baseBody: campaignCopy.body
        });

        notifications.push({
          id: baseId + 50 + index, // Farklı ID aralığı
          title: variantCopy.title,
          body: variantCopy.body,
          schedule: { at: preTime },
          sound: 'default',
          channelId: NOTIFICATION_CHANNELS.PRAYER.id,
          smallIcon: 'ic_notification',
          extra: {
            type: 'prayer_pre',
            prayer: prayer,
            campaign: campaign.id,
            campaign_variant: campaign.variant,
            push_variant: pushVariant
          }
        });

        analyticsService.logPushVariantDelivered(pushVariant, campaign.id, 'prayer_pre');
      }
    }
  });

  try {
    if (Capacitor.getPlatform() !== 'web') {
      await LocalNotifications.schedule({ notifications });
    }
    
    saveScheduledNotifications('prayer', notifications);
    
    // Analytics: Log scheduling (as proxy for received)
     analyticsService.logEvent(ANALYTICS_EVENTS.NOTIFICATION_RECEIVED, {
       type: 'prayer_schedule_batch',
       count: notifications.length
     });
     
    logger.log('Notifications: Prayer notifications scheduled', notifications.length);
  } catch (error) {
    logger.error('Notifications: Schedule error', error);
  }
};

/**
 * Streak uyarı bildirimlerini planla
 */
export const scheduleStreakNotifications = async (currentStreak) => {
  const prefs = getNotificationPreferences();
  if (!prefs.streak || currentStreak < 2) return; // En az 2 gün streak olsun

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  const notifications = [];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  STREAK_NOTIFICATIONS.forEach((config, index) => {
    const scheduleTime = new Date(tomorrow);
    scheduleTime.setHours(config.hour, config.minute, 0, 0);

    if (!shouldScheduleAt(scheduleTime, prefs, 'streak')) return;

    notifications.push({
      id: 1000 + index,
      title: config.title,
      body: config.body.replace('{days}', currentStreak),
      schedule: { at: scheduleTime },
      sound: NOTIFICATION_CHANNELS.STREAK.sound,
      channelId: NOTIFICATION_CHANNELS.STREAK.id,
      smallIcon: 'ic_notification',
      largeIcon: 'ic_fire', // Eğer varsa
      extra: { type: 'streak', streak: currentStreak }
    });
  });

  try {
    if (Capacitor.getPlatform() !== 'web') {
      await LocalNotifications.schedule({ notifications });
    }
    
    saveScheduledNotifications('streak', notifications);
    logger.log('Notifications: Streak notifications scheduled');
  } catch (error) {
    logger.error('Notifications: Streak schedule error', error);
  }
};

/**
 * Günlük hatırlatıcı bildirimleri planla
 */
export const scheduleDailyReminders = async () => {
  const prefs = getNotificationPreferences();
  if (!prefs.reminder) return;

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  const notifications = [];
  
  // Önceki hatırlatıcıları temizle
  await cancelNotificationsByType('reminder');

  DAILY_REMINDERS.forEach((config, index) => {
    const scheduleTime = new Date();
    scheduleTime.setHours(config.hour, config.minute, 0, 0);

    // Eğer saat geçtiyse yarın için planla
    if (scheduleTime <= new Date()) {
      scheduleTime.setDate(scheduleTime.getDate() + 1);
    }

    if (!shouldScheduleAt(scheduleTime, prefs, 'reminder')) return;

    const campaign = getActiveCampaign(scheduleTime);
    const pushVariant = getExperimentVariant('push_copy_v1');
    const campaignCopy = resolveCampaignCopy({
      campaign,
      type: 'reminder',
      fallbackTitle: config.title,
      fallbackBody: config.body
    });
    const variantCopy = getPushCopyVariantText({
      variant: pushVariant,
      campaign,
      baseTitle: campaignCopy.title,
      baseBody: campaignCopy.body
    });

    analyticsService.logCampaignResolved(campaign.id, campaign.region, campaign.variant);
    analyticsService.logExperimentAssigned('push_copy_v1', pushVariant, 'schedule_daily_reminders');
    analyticsService.logPushVariantDelivered(pushVariant, campaign.id, 'daily_reminder');

    notifications.push({
      id: 2000 + index,
      title: variantCopy.title,
      body: variantCopy.body,
      schedule: { 
        at: scheduleTime,
        repeats: true, 
        every: 'day'
      },
      sound: NOTIFICATION_CHANNELS.REMINDER.sound,
      channelId: NOTIFICATION_CHANNELS.REMINDER.id,
      smallIcon: 'ic_notification',
      extra: {
        type: 'reminder',
        reminderId: config.id,
        campaign: campaign.id,
        campaign_variant: campaign.variant,
        push_variant: pushVariant
      }
    });
  });

  try {
    if (notifications.length === 0) return;

    if (Capacitor.getPlatform() !== 'web') {
      await LocalNotifications.schedule({ notifications });
    }
    
    saveScheduledNotifications('reminder', notifications);
    logger.log('Notifications: Daily reminders scheduled');
  } catch (error) {
    logger.error('Notifications: Reminder schedule error', error);
  }
};

/**
 * Anlık bildirim göster
 */
export const showInstantNotification = async (title, body, extra = {}) => {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  const prefs = getNotificationPreferences();
  if (isInQuietHours(new Date(), prefs)) {
    analyticsService.logQuietHoursSkipped(extra.type || 'instant', new Date().getHours(), new Date().getMinutes());
    return;
  }

  const id = Math.floor(Date.now() / 1000); // Integer ID required by some plugins

  const notification = {
    id,
    title,
    body,
    sound: 'default',
    channelId: NOTIFICATION_CHANNELS.UPDATES.id,
    smallIcon: 'ic_notification',
    schedule: { at: new Date(Date.now() + 100) }, // Hemen
    extra
  };

  try {
    if (Capacitor.getPlatform() !== 'web') {
      await LocalNotifications.schedule({ notifications: [notification] });
    } else if ('Notification' in window) {
      new Notification(title, { body, icon: '/pwa-192x192.png' });
    }
    
    saveToHistory({ title, body, date: new Date().toISOString(), type: extra.type || 'general' });
    logger.log('Notifications: Instant notification shown', { title, body });
  } catch (error) {
    logger.error('Notifications: Instant notification error', error);
  }
};

/**
 * Belirli bir tipteki bildirimleri iptal et
 */
export const cancelNotificationsByType = async (type) => {
  try {
    const scheduled = getScheduledNotifications();
    const notificationsToCancel = scheduled[type] || [];
    
    if (notificationsToCancel.length > 0 && Capacitor.getPlatform() !== 'web') {
      const ids = notificationsToCancel.map(n => ({ id: n.id }));
      await LocalNotifications.cancel({ notifications: ids });
    }
    
    scheduled[type] = [];
    storageService.setItem(NOTIFICATION_STORAGE_KEY, scheduled);
    
    logger.log('Notifications: Cancelled type', type);
  } catch (error) {
    logger.error('Notifications: Cancel error', error);
  }
};

/**
 * Kalıcı bildirim göster (Vakit sayacı için)
 */
export const showStickyNotification = async (title, body) => {
  if (Capacitor.getPlatform() === 'web') return;

  try {
     const hasPermission = await requestNotificationPermission();
     if (!hasPermission) return;

     await LocalNotifications.schedule({
        notifications: [
            {
                title: title,
                body: body,
                id: STICKY_NOTIFICATION_ID,
                ongoing: true, // Kalıcı
                autoCancel: false,
                silent: true,
                smallIcon: 'ic_stat_icon',
                channelId: NOTIFICATION_CHANNELS.STICKY_COUNTER.id
            }
        ]
     });
  } catch (error) {
    logger.error('Notifications: Sticky error', error);
  }
};

/**
 * Kalıcı bildirimi iptal et
 */
export const cancelStickyNotification = async () => {
    if (Capacitor.getPlatform() === 'web') return;
    try {
        await LocalNotifications.cancel({ notifications: [{ id: STICKY_NOTIFICATION_ID }] });
    } catch (error) {
        logger.error('Notifications: Sticky cancel error', error);
    }
};

/**
 * Tüm bildirimleri iptal et
 */
export const cancelAllNotifications = async () => {
  try {
    if (Capacitor.getPlatform() !== 'web') {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }
    }
    
    storageService.removeItem(NOTIFICATION_STORAGE_KEY);
    logger.log('Notifications: All notifications cancelled');
  } catch (error) {
    logger.error('Notifications: Cancel all error', error);
  }
};

/**
 * Planlanan bildirimleri depola (Referans için)
 */
const saveScheduledNotifications = (type, notifications) => {
  const scheduled = getScheduledNotifications();
  scheduled[type] = notifications;
  storageService.setItem(NOTIFICATION_STORAGE_KEY, scheduled);
};

const getScheduledNotifications = () => {
  return storageService.getItem(NOTIFICATION_STORAGE_KEY) || {
    prayer: [],
    streak: [],
    reminder: []
  };
};

/**
 * Bildirim geçmişine kaydet
 */
const saveToHistory = (notification) => {
  try {
    const history = storageService.getItem(NOTIFICATION_HISTORY_KEY) || [];
    history.unshift({
      ...notification,
      id: notification.id || Date.now(),
      read: false,
      timestamp: new Date().toISOString()
    });
    
    // Son 50 bildirimi tut
    if (history.length > 50) history.pop();
    
    storageService.setItem(NOTIFICATION_HISTORY_KEY, history);
  } catch (e) {
    logger.error('Save history error', e);
  }
};

/**
 * Bildirim geçmişini getir
 */
export const getNotificationHistory = () => {
  return storageService.getItem(NOTIFICATION_HISTORY_KEY) || [];
};

/**
 * Bildirim geçmişini temizle
 */
export const clearNotificationHistory = () => {
  storageService.removeItem(NOTIFICATION_HISTORY_KEY);
};

/**
 * Bildirim tıklama olaylarını dinle
 */
export const addNotificationClickListener = (callback) => {
  if (Capacitor.getPlatform() === 'web') return;

  // Temizle ve yeniden ekle
  LocalNotifications.removeAllListeners();

  LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
    logger.log('Notifications: Clicked', notification);
    
    // Analytics
    analyticsService.logNotificationTapped(
      notification.notification.extra?.type || 'unknown',
      notification.notification.extra?.prayer || null
    );

    if (callback) callback(notification);
  });
  
  LocalNotifications.addListener('localNotificationReceived', (notification) => {
      // Analytics for foreground receipt
      logger.log('Notification received in foreground:', notification);
  });
};

/**
 * Tüm bildirim servislerini başlat
 */
export const initializeSmartNotifications = async (options = {}) => {
  const { prayerTimes, currentStreak } = options;
  
  logger.log('Notifications: Initializing smart notifications');
  
  // 1. Kanalları oluştur (Android)
  await createNotificationChannels();

  // 2. İzin iste
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    logger.warn('Notifications: Permission denied');
    return;
  }
  
  // 3. Bildirimleri Planla
  const prefs = getNotificationPreferences();

  if (prayerTimes && prefs.prayer) {
    await schedulePrayerNotifications(prayerTimes);
  }
  
  if (currentStreak && prefs.streak) {
    await scheduleStreakNotifications(currentStreak);
  }
  
  if (prefs.reminder) {
    await scheduleDailyReminders();
  }
  
  logger.log('Notifications: Smart notifications initialized');
};

export default {
  requestNotificationPermission,
  schedulePrayerNotifications,
  scheduleStreakNotifications,
  scheduleDailyReminders,
  showInstantNotification,
  showStickyNotification,
  cancelStickyNotification,
  cancelNotificationsByType,
  cancelAllNotifications,
  addNotificationClickListener,
  initializeSmartNotifications,
  getNotificationPreferences,
  updateNotificationPreferences,
  getNotificationHistory,
  clearNotificationHistory,
  NOTIFICATION_CHANNELS
};

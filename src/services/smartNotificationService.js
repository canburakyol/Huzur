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

const NOTIFICATION_STORAGE_KEY = 'huzur_scheduled_notifications';
const NOTIFICATION_HISTORY_KEY = 'huzur_notification_history';
const NOTIFICATION_PREFS_KEY = 'huzur_notification_prefs';

// Notification Categories & Channels
export const NOTIFICATION_CHANNELS = {
  PRAYER: {
    id: 'prayer_channel',
    name: 'Ezan Vakitleri',
    description: 'Namaz vakti hatırlatmaları',
    importance: 5, // High
    sound: 'ezan_default.mp3',
    visibility: 1
  },
  STREAK: {
    id: 'streak_channel',
    name: 'Seri Uyarıları',
    description: 'Seri koruma hatırlatmaları',
    importance: 4,
    sound: 'streak_alert.wav',
    visibility: 1
  },
  REMINDER: {
    id: 'reminder_channel',
    name: 'Günlük Hatırlatıcılar',
    description: 'Zikir ve günlük görev hatırlatmaları',
    importance: 3,
    sound: 'gentle_reminder.wav',
    visibility: 1
  },
  UPDATES: {
    id: 'updates_channel',
    name: 'Uygulama Güncellemeleri',
    description: 'Yeni özellikler ve duyurular',
    importance: 2,
    sound: 'default',
    visibility: 1
  }
};

// Namaz vakitleri bildirim mesajları
const PRAYER_NOTIFICATIONS = {
  Fajr: {
    title: '🌅 Sabah Namazı Vakti',
    body: 'Günün bereketini sabah namazı ile başlatın. Vakit yaklaşıyor!',
    minutesBefore: 15
  },
  Sunrise: { // Güneş (İşrak)
    title: '☀️ Güneş Doğuyor',
    body: 'Güneş doğdu, sabah namazı vakti çıkıyor. İshrak namazı için hazır olun.',
    minutesBefore: 5
  },
  Dhuhr: {
    title: '🕌 Öğle Namazı Vakti',
    body: 'Öğle namazı vakti yaklaşıyor. Mola verip namazınızı kılın.',
    minutesBefore: 15
  },
  Asr: {
    title: '🌤️ İkindi Namazı Vakti',
    body: 'İkindi namazı vakti geliyor. Günlük işlerinize ara verin.',
    minutesBefore: 15
  },
  Maghrib: {
    title: '🌇 Akşam Namazı Vakti',
    body: 'Gün batıyor, akşam namazı vakti yaklaşıyor. Oruçlarınızı açmaya hazırlanın.',
    minutesBefore: 10
  },
  Isha: {
    title: '🌙 Yatsı Namazı Vakti',
    body: 'Yatsı namazı vakti geliyor. Günü namazla tamamlayın.',
    minutesBefore: 15
  }
};

// Streak bildirim mesajları
const STREAK_NOTIFICATIONS = [
  {
    title: '🔥 Seriniz Kırılmak Üzere!',
    body: 'Bugün uygulamayı açmadınız. {days} günlük serinizi korumak için hemen açın!',
    hour: 20,
    minute: 0
  },
  {
    title: '⏰ Son 4 Saat!',
    body: 'Serinizi kurtarmak için son 4 saatiniz kaldı. Hemen uygulamayı açın!',
    hour: 23,
    minute: 0
  }
];

// Günlük hatırlatıcı bildirimler
const DAILY_REMINDERS = [
  {
    id: 'zikir_morning',
    title: '📿 Günlük Zikir Hatırlatması',
    body: 'Bugün zikirlerinizi tamamladınız mı? Sebvha, tekbir ve tesbihat vakitleri...',
    hour: 10,
    minute: 0
  },
  {
    id: 'quran_afternoon',
    title: '📖 Kuran Okuma Vakti',
    body: 'Günlük Kuran okuma hedefinizi tamamlamak için harika bir zaman!',
    hour: 14,
    minute: 0
  },
  {
    id: 'tasks_evening',
    title: '✅ Günlük Görevler',
    body: 'Bugünkü ibadet görevlerinizi tamamladınız mı? Kontrol edin!',
    hour: 18,
    minute: 0
  }
];

/**
 * Bildirim izni kontrol et ve iste
 */
export const requestNotificationPermission = async () => {
  if (Capacitor.getPlatform() === 'web') {
    logger.log('Notifications: Web platform - using web notifications');
    if ('Notification' in window) {
      if (Notification.permission === 'granted') return true;
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  try {
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  } catch (error) {
    logger.error('Notifications: Permission error', error);
    return false;
  }
};

/**
 * Android Bildirim Kanallarını Oluştur
 */
const createNotificationChannels = async () => {
  if (Capacitor.getPlatform() !== 'android') return;

  try {
    const channels = Object.values(NOTIFICATION_CHANNELS).map(channel => ({
      id: channel.id,
      name: channel.name,
      description: channel.description,
      importance: channel.importance,
      visibility: channel.visibility,
      sound: channel.sound
    }));

    await LocalNotifications.createChannel
      ? Promise.all(channels.map(c => LocalNotifications.createChannel(c)))
      : null; // Some plugin versions might use a different method or list
      
    logger.log('Notifications: Channels created');
  } catch (error) {
    logger.error('Notifications: Channel creation error', error);
  }
};

/**
 * Kullanıcı tercihlerini al
 */
export const getNotificationPreferences = () => {
  const defaults = {
    prayer: true,
    streak: true,
    reminder: true,
    updates: true,
    preAlertMinutes: 15
  };
  return storageService.getItem(NOTIFICATION_PREFS_KEY) || defaults;
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
      notifications.push({
        id: baseId + index,
        title: `Ezan Vakti: ${prayerNames[prayer] || prayer}`,
        body: `Vakit girdi. Haydi namaza!`,
        schedule: { at: prayerTime },
        sound: NOTIFICATION_CHANNELS.PRAYER.sound,
        channelId: NOTIFICATION_CHANNELS.PRAYER.id,
        smallIcon: 'ic_notification',
        actionTypeId: 'PRAYER_ACTION',
        extra: { type: 'prayer', prayer: prayer, action: 'now' }
      });
    }

    // 2. Vakit Öncesi Hatırlatma
    if (config.minutesBefore > 0) {
      const preTime = new Date(prayerTime.getTime() - (config.minutesBefore * 60000));
      
      if (preTime > new Date()) {
        notifications.push({
          id: baseId + 50 + index, // Farklı ID aralığı
          title: config.title,
          body: config.body,
          schedule: { at: preTime },
          sound: 'default',
          channelId: NOTIFICATION_CHANNELS.PRAYER.id,
          smallIcon: 'ic_notification',
          extra: { type: 'prayer_pre', prayer: prayer }
        });
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

    notifications.push({
      id: 2000 + index,
      title: config.title,
      body: config.body,
      schedule: { 
        at: scheduleTime,
        repeats: true, 
        every: 'day'
      },
      sound: NOTIFICATION_CHANNELS.REMINDER.sound,
      channelId: NOTIFICATION_CHANNELS.REMINDER.id,
      smallIcon: 'ic_notification',
      extra: { type: 'reminder', reminderId: config.id }
    });
  });

  try {
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
    console.error('Save history error', e);
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
      console.log('Notification received in foreground:', notification);
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

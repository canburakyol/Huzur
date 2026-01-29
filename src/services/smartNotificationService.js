/**
 * Smart Notification Service
 * Akıllı bildirimler ile kullanıcıyı uygulamaya geri getir
 */

import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { storageService } from './storageService';
import { logger } from '../utils/logger';

const NOTIFICATION_STORAGE_KEY = 'huzur_scheduled_notifications';

// Namaz vakitleri bildirim mesajları
const PRAYER_NOTIFICATIONS = {
  Fajr: {
    title: '🌅 Sabah Namazı Vakti',
    body: 'Günün bereketini sabah namazı ile başlatın. Vakit yaklaşıyor!',
    minutesBefore: 15
  },
  Sunrise: {
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
    title: '📿 Günlük Zikir Hatırlatması',
    body: 'Bugün zikirlerinizi tamamladınız mı? Sebvha, tekbir ve tesbihat vakitleri...',
    hour: 10,
    minute: 0
  },
  {
    title: '📖 Kuran Okuma Vakti',
    body: 'Günlük Kuran okuma hedefinizi tamamlamak için harika bir zaman!',
    hour: 14,
    minute: 0
  },
  {
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
 * Namaz vakti bildirimlerini planla
 * @param {Object} prayerTimes - Namaz vakitleri (Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha)
 * @param {Date} date - Hangi gün için planlanacak
 */
export const schedulePrayerNotifications = async (prayerTimes, date = new Date()) => {
  if (!prayerTimes) return;

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    logger.warn('Notifications: Permission not granted');
    return;
  }

  const notifications = [];
  const baseId = date.getDate() * 100; // Günlük benzersiz ID

  Object.entries(PRAYER_NOTIFICATIONS).forEach(([prayer, config], index) => {
    const prayerTime = prayerTimes[prayer];
    if (!prayerTime) return;

    // Namaz vaktinden X dakika önce
    const [hours, minutes] = prayerTime.split(':').map(Number);
    const notificationTime = new Date(date);
    notificationTime.setHours(hours, minutes - config.minutesBefore, 0, 0);

    // Geçmişte değilse planla
    if (notificationTime > new Date()) {
      notifications.push({
        id: baseId + index,
        title: config.title,
        body: config.body,
        schedule: { at: notificationTime },
        sound: 'notification_sound.wav',
        smallIcon: 'ic_notification',
        largeIcon: 'ic_launcher',
        extra: { type: 'prayer', prayer: prayer }
      });
    }
  });

  try {
    if (Capacitor.getPlatform() !== 'web') {
      await LocalNotifications.schedule({ notifications });
    }
    
    // Planlanan bildirimleri kaydet
    saveScheduledNotifications('prayer', notifications);
    logger.log('Notifications: Prayer notifications scheduled', notifications.length);
  } catch (error) {
    logger.error('Notifications: Schedule error', error);
  }
};

/**
 * Streak uyarı bildirimlerini planla
 * @param {number} currentStreak - Mevcut streak sayısı
 */
export const scheduleStreakNotifications = async (currentStreak) => {
  if (currentStreak < 3) return; // 3 günden az streak için bildirim gösterme

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
      sound: 'streak_alert.wav',
      smallIcon: 'ic_notification',
      largeIcon: 'ic_launcher',
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
        repeats: true, // Her gün tekrarla
        every: 'day'
      },
      sound: 'gentle_reminder.wav',
      smallIcon: 'ic_notification',
      largeIcon: 'ic_launcher',
      extra: { type: 'reminder', reminderId: index }
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
 * @param {string} title - Bildirim başlığı
 * @param {string} body - Bildirim içeriği
 * @param {Object} extra - Ekstra veri
 */
export const showInstantNotification = async (title, body, extra = {}) => {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  const notification = {
    id: Date.now(),
    title,
    body,
    sound: 'notification_sound.wav',
    smallIcon: 'ic_notification',
    largeIcon: 'ic_launcher',
    extra
  };

  try {
    if (Capacitor.getPlatform() !== 'web') {
      await LocalNotifications.schedule({ notifications: [notification] });
    } else if ('Notification' in window) {
      new Notification(title, { body, icon: '/pwa-192x192.png' });
    }
    
    logger.log('Notifications: Instant notification shown', { title, body });
  } catch (error) {
    logger.error('Notifications: Instant notification error', error);
  }
};

/**
 * Belirli bir tipteki bildirimleri iptal et
 * @param {string} type - Bildirim tipi (prayer, streak, reminder)
 */
export const cancelNotificationsByType = async (type) => {
  try {
    const scheduled = getScheduledNotifications();
    const notificationsToCancel = scheduled[type] || [];
    
    if (notificationsToCancel.length > 0 && Capacitor.getPlatform() !== 'web') {
      const ids = notificationsToCancel.map(n => n.id);
      await LocalNotifications.cancel({ notifications: ids.map(id => ({ id })) });
    }
    
    // Storage'dan temizle
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
      await LocalNotifications.cancel({ notifications: [] });
    }
    
    storageService.removeItem(NOTIFICATION_STORAGE_KEY);
    logger.log('Notifications: All notifications cancelled');
  } catch (error) {
    logger.error('Notifications: Cancel all error', error);
  }
};

/**
 * Planlanan bildirimleri kaydet
 */
const saveScheduledNotifications = (type, notifications) => {
  const scheduled = getScheduledNotifications();
  scheduled[type] = notifications;
  storageService.setItem(NOTIFICATION_STORAGE_KEY, scheduled);
};

/**
 * Planlanan bildirimleri al
 */
const getScheduledNotifications = () => {
  return storageService.getItem(NOTIFICATION_STORAGE_KEY) || {
    prayer: [],
    streak: [],
    reminder: []
  };
};

/**
 * Bildirim tıklama olaylarını dinle
 * @param {Function} callback - Tıklama callback'i
 */
export const addNotificationClickListener = (callback) => {
  if (Capacitor.getPlatform() === 'web') return;

  LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
    logger.log('Notifications: Clicked', notification);
    callback(notification);
  });
};

/**
 * Tüm bildirim servislerini başlat
 * @param {Object} options - Başlangıç seçenekleri
 */
export const initializeSmartNotifications = async (options = {}) => {
  const { prayerTimes, currentStreak, enableReminders = true } = options;
  
  logger.log('Notifications: Initializing smart notifications');
  
  // İzin iste
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    logger.warn('Notifications: Permission denied');
    return;
  }
  
  // Namaz bildirimleri
  if (prayerTimes) {
    await schedulePrayerNotifications(prayerTimes);
  }
  
  // Streak bildirimleri
  if (currentStreak && currentStreak >= 3) {
    await scheduleStreakNotifications(currentStreak);
  }
  
  // Günlük hatırlatıcılar
  if (enableReminders) {
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
  initializeSmartNotifications
};
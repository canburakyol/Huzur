import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { logger } from '../utils/logger';
import smartNotificationService from './smartNotificationService';

const NOTIFICATION_ID = 1001;

// Tekil fonksiyonlar (App.jsx uyumluluğu için)
export const requestNotificationPermission = async () => {
    return smartNotificationService.requestNotificationPermission();
};

export const sendNotification = async (title, body, id = null) => {
    return smartNotificationService.showInstantNotification(title, body, { id });
};

// Gelişmiş Bildirim Planlayıcı (DEPRECATED - Redirects to SmartNotificationService)
export const schedulePrayerNotifications = async (prayerTimes) => {
    console.warn('Deprecated: notificationService.schedulePrayerNotifications is using SmartNotificationService underneath.');
    
    // Eski settings parametrelerini yeni yapıya uygun hale getirme gerekirse burada yapılabilir
    // Ancak SmartNotificationService kendi ayarlarını storage'dan okuyor, bu yüzden sadece times'ı paslıyoruz.
    
    return smartNotificationService.schedulePrayerNotifications(prayerTimes);
};


// Servis Objesi (Sticky Notification için)
export const NotificationService = {
    // İzin iste
    async requestPermissions() {
        return await requestNotificationPermission();
    },

    // İzin durumunu kontrol et
    async checkPermissions() {
        if (!Capacitor.isNativePlatform()) {
            return true;
        }
        const result = await LocalNotifications.checkPermissions();
        return result.display === 'granted';
    },

    // Kalıcı bildirim oluştur veya güncelle
    async showStickyNotification(title, body) {
        if (!Capacitor.isNativePlatform()) {
            // logger.log('Web platformunda sticky notification:', title, body);
            return;
        }

        try {
            // Önce izni kontrol et
            const granted = await this.checkPermissions();
            if (!granted) return;

            await LocalNotifications.schedule({
                notifications: [
                    {
                        title: title,
                        body: body,
                        id: NOTIFICATION_ID,
                        ongoing: true, // Kalıcı bildirim (Kullanıcı silemez)
                        autoCancel: false, // Tıklayınca kapanmasın
                        silent: true, // Ses çıkarmasın (güncellenirken rahatsız etmesin)
                        smallIcon: 'ic_stat_icon', // Android için ikon (varsayılanı kullanır yoksa)
                        actionTypeId: '',
                        extra: null
                    }
                ]
            });
        } catch (error) {
            logger.error('Bildirim hatası:', error);
        }
    },

    // Bildirimi iptal et
    async cancelNotification() {
        if (!Capacitor.isNativePlatform()) {
            return;
        }

        try {
            await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_ID }] });
        } catch (error) {
            logger.error('Bildirim iptal hatası:', error);
        }
    }
};

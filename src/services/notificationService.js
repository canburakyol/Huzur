import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

const NOTIFICATION_ID = 1001;

// Tekil fonksiyonlar (App.jsx uyumluluğu için)
export const requestNotificationPermission = async () => {
    if (!Capacitor.isNativePlatform()) {

        return true;
    }
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
};

export const sendNotification = async (title, body, id = null) => {
    if (!Capacitor.isNativePlatform()) {

        if (Notification.permission === 'granted') {
            new Notification(title, { body });
        }
        return;
    }

    try {
        await LocalNotifications.schedule({
            notifications: [
                {
                    title,
                    body,
                    id: id || Math.floor(Math.random() * 100000),
                    schedule: { at: new Date(Date.now() + 100) },
                    // Uses default system notification sound
                    actionTypeId: "",
                    extra: null
                }
            ]
        });
    } catch (error) {
        console.error('Bildirim gönderme hatası:', error);
    }
};

// Gelişmiş Bildirim Planlayıcı
export const schedulePrayerNotifications = async (prayerTimes, settings = {}) => {
    if (!Capacitor.isNativePlatform()) return;

    const { preAlertMinutes = 15, enablePreAlert = false } = settings;
    const notifications = [];
    let idCounter = 2000;

    Object.entries(prayerTimes).forEach(([name, timeStr]) => {
        if (!timeStr) return;

        // Saat stringini (HH:mm) Date objesine çevir
        const [hours, minutes] = timeStr.split(':').map(Number);
        const prayerDate = new Date();
        prayerDate.setHours(hours, minutes, 0, 0);

        // Eğer vakit geçtiyse yarına planla (Basit mantık, detaylandırılabilir)
        if (prayerDate < new Date()) {
            prayerDate.setDate(prayerDate.getDate() + 1);
        }

        // 1. Ana Vakit Bildirimi
        notifications.push({
            id: idCounter++,
            title: `Ezan Vakti: ${name}`,
            body: `${name} namazı vakti girdi. Haydi namaza!`,
            schedule: { at: prayerDate },
            // Uses default system notification sound
        });

        // 2. Vakit Öncesi Uyarı
        if (enablePreAlert) {
            const preAlertDate = new Date(prayerDate.getTime() - (preAlertMinutes * 60000));
            if (preAlertDate > new Date()) {
                notifications.push({
                    id: idCounter++,
                    title: `Vakte ${preAlertMinutes} dk Kaldı`,
                    body: `${name} namazına ${preAlertMinutes} dakika kaldı. Hazırlanabilirsiniz.`,
                    schedule: { at: preAlertDate },
                    // Uses default system notification sound
                });
            }
        }
    });

    try {
        // Önce eski planları temizle (ID aralığına göre)
        // Not: Gerçek uygulamada ID yönetimi daha hassas yapılmalı
        await LocalNotifications.schedule({ notifications });

    } catch (error) {
        console.error('Bildirim planlama hatası:', error);
    }
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
            // console.log('Web platformunda sticky notification:', title, body);
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
            console.error('Bildirim hatası:', error);
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
            console.error('Bildirim iptal hatası:', error);
        }
    }
};

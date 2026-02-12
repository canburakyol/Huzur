import React, { useState, useEffect } from 'react';
import { 
  getNotificationPreferences, 
  updateNotificationPreferences, 
  NOTIFICATION_CHANNELS,
  requestNotificationPermission
} from '../services/smartNotificationService';
import { useTranslation } from 'react-i18next';
import './NotificationSettings.css'; // Stil dosyasını oluşturmamız gerekebilir veya inline kullanabiliriz

const NotificationSettings = () => {
  const { t } = useTranslation();
  const [prefs, setPrefs] = useState({
    prayer: true,
    streak: true,
    reminder: true,
    updates: true,
    preAlertMinutes: 15,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00'
  });
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    const loadPrefs = () => {
      const saved = getNotificationPreferences();
      setPrefs(saved);
    };

    const checkPermission = async () => {
      // Bu metod SmartNotificationService içinde public değilse,
      // basitçe Notification API kontrolü veya bir wrapper kullanabiliriz.
      // Şimdilik varsayım olarak:
      if ('Notification' in window) {
        setPermissionGranted(Notification.permission === 'granted');
      }
    };

    loadPrefs();
    checkPermission();
  }, []);

  const handleToggle = async (key) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);
    await updateNotificationPreferences(newPrefs);
  };

  const handleTimeChange = async (e) => {
    const minutes = parseInt(e.target.value);
    const newPrefs = { ...prefs, preAlertMinutes: minutes };
    setPrefs(newPrefs);
    await updateNotificationPreferences(newPrefs);
  };

  const handleQuietHoursTimeChange = async (key, value) => {
    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs);
    await updateNotificationPreferences(newPrefs);
  };

  const requestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermissionGranted(granted);
  };

  return (
    <div className="notification-settings-container p-4">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <span className="text-2xl mr-2">🔔</span> {t('settings.notificationSettingsTitle', 'Bildirim Ayarları')}
      </h2>

      {!permissionGranted && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
          <p className="font-bold">{t('settings.notificationPermissionRequiredTitle', 'Bildirim İzni Gerekli')}</p>
          <p>{t('settings.notificationPermissionRequiredDesc', 'Bildirimleri alabilmek için lütfen izin verin.')}</p>
          <button 
            onClick={requestPermission}
            className="mt-2 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
          >
            {t('settings.allowPermission', 'İzin Ver')}
          </button>
        </div>
      )}

      <div className="space-y-4">
        {/* Ezan Vakitleri */}
        <div className="glass-card notification-card" style={{ borderLeft: '4px solid #FBBF24' }}>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <span className="text-xl mr-3">🕌</span>
              <div>
                <h3 className="setting-title">{t('notifications.channels.prayer.name', NOTIFICATION_CHANNELS.PRAYER.name)}</h3>
                <p className="setting-desc">{t('notifications.channels.prayer.description', NOTIFICATION_CHANNELS.PRAYER.description)}</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={prefs.prayer} 
                onChange={() => handleToggle('prayer')}
              />
              <span className="slider round"></span>
            </label>
          </div>
          
          {prefs.prayer && (
            <div className="mt-3 pl-8 text-sm val-selection">
              <label className="flex items-center justify-between">
                <span>{t('settings.preAlertMinutes', 'Vakit Öncesi Uyarı (dk):')}</span>
                <select 
                  value={prefs.preAlertMinutes} 
                  onChange={handleTimeChange}
                  className="themed-select-min"
                >
                  <option value="15">{t('settings.minutesValue', { count: 15, defaultValue: '15 dk' })}</option>
                  <option value="30">{t('settings.minutesValue', { count: 30, defaultValue: '30 dk' })}</option>
                  <option value="45">{t('settings.minutesValue', { count: 45, defaultValue: '45 dk' })}</option>
                  <option value="0">{t('settings.off', 'Kapalı')}</option>
                </select>
              </label>
            </div>
          )}
        </div>

        {/* Günlük Hatırlatıcılar */}
        <div className="glass-card notification-card" style={{ borderLeft: '4px solid #10B981' }}>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-xl mr-3">📿</span>
              <div>
                <h3 className="setting-title">{t('notifications.channels.reminder.name', NOTIFICATION_CHANNELS.REMINDER.name)}</h3>
                <p className="setting-desc">{t('notifications.channels.reminder.description', NOTIFICATION_CHANNELS.REMINDER.description)}</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={prefs.reminder} 
                onChange={() => handleToggle('reminder')}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>

        {/* Seri Koruması */}
        <div className="glass-card notification-card" style={{ borderLeft: '4px solid #F59E0B' }}>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-xl mr-3">🔥</span>
              <div>
                <h3 className="setting-title">{t('notifications.channels.streak.name', NOTIFICATION_CHANNELS.STREAK.name)}</h3>
                <p className="setting-desc">{t('notifications.channels.streak.description', NOTIFICATION_CHANNELS.STREAK.description)}</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={prefs.streak} 
                onChange={() => handleToggle('streak')}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>

        {/* Güncellemeler */}
        <div className="glass-card notification-card" style={{ borderLeft: '4px solid #3B82F6' }}>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-xl mr-3">📢</span>
              <div>
                <h3 className="setting-title">{t('notifications.channels.updates.name', NOTIFICATION_CHANNELS.UPDATES.name)}</h3>
                <p className="setting-desc">{t('notifications.channels.updates.description', NOTIFICATION_CHANNELS.UPDATES.description)}</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={prefs.updates} 
                onChange={() => handleToggle('updates')}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>

        {/* Sessiz Saatler */}
        <div className="glass-card notification-card" style={{ borderLeft: '4px solid #8B5CF6' }}>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-xl mr-3">🌙</span>
              <div>
                <h3 className="setting-title">{t('settings.quietHoursTitle', 'Sessiz Saatler')}</h3>
                <p className="setting-desc">{t('settings.quietHoursDesc', 'Bu aralıkta push bildirim gönderilmez')}</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={prefs.quietHoursEnabled}
                onChange={() => handleToggle('quietHoursEnabled')}
              />
              <span className="slider round"></span>
            </label>
          </div>

          {prefs.quietHoursEnabled && (
            <div className="quiet-hours-grid mt-3 text-sm text-gray-600 dark:text-gray-300">
              <label className="quiet-hours-item">
                <span>{t('settings.start', 'Başlangıç')}</span>
                <input
                  type="time"
                  value={prefs.quietHoursStart}
                  onChange={(e) => handleQuietHoursTimeChange('quietHoursStart', e.target.value)}
                />
              </label>
              <label className="quiet-hours-item">
                <span>{t('settings.end', 'Bitiş')}</span>
                <input
                  type="time"
                  value={prefs.quietHoursEnd}
                  onChange={(e) => handleQuietHoursTimeChange('quietHoursEnd', e.target.value)}
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;

import React, { useState, useEffect } from 'react';
import { 
  getNotificationPreferences, 
  updateNotificationPreferences, 
  NOTIFICATION_CHANNELS,
  requestNotificationPermission
} from '../services/smartNotificationService';
import './NotificationSettings.css'; // Stil dosyasını oluşturmamız gerekebilir veya inline kullanabiliriz

const NotificationSettings = () => {
  const [prefs, setPrefs] = useState({
    prayer: true,
    streak: true,
    reminder: true,
    updates: true,
    preAlertMinutes: 15
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

  const requestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermissionGranted(granted);
  };

  return (
    <div className="notification-settings-container p-4">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <span className="text-2xl mr-2">🔔</span> Bildirim Ayarları
      </h2>

      {!permissionGranted && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
          <p className="font-bold">Bildirim İzni Gerekli</p>
          <p>Bildirimleri alabilmek için lütfen izin verin.</p>
          <button 
            onClick={requestPermission}
            className="mt-2 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
          >
            İzin Ver
          </button>
        </div>
      )}

      <div className="space-y-4">
        {/* Ezan Vakitleri */}
        <div className="setting-card bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <span className="text-xl mr-3">🕌</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{NOTIFICATION_CHANNELS.PRAYER.name}</h3>
                <p className="text-xs text-gray-500">{NOTIFICATION_CHANNELS.PRAYER.description}</p>
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
            <div className="mt-3 pl-8 text-sm text-gray-600 dark:text-gray-400">
              <label className="flex items-center justify-between">
                <span>Vakit Öncesi Uyarı (dk):</span>
                <select 
                  value={prefs.preAlertMinutes} 
                  onChange={handleTimeChange}
                  className="ml-2 border rounded p-1 dark:bg-gray-700 dark:text-white"
                >
                  <option value="15">15 dk</option>
                  <option value="30">30 dk</option>
                  <option value="45">45 dk</option>
                  <option value="0">Kapalı</option>
                </select>
              </label>
            </div>
          )}
        </div>

        {/* Günlük Hatırlatıcılar */}
        <div className="setting-card bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-xl mr-3">📿</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{NOTIFICATION_CHANNELS.REMINDER.name}</h3>
                <p className="text-xs text-gray-500">{NOTIFICATION_CHANNELS.REMINDER.description}</p>
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
        <div className="setting-card bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-xl mr-3">🔥</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{NOTIFICATION_CHANNELS.STREAK.name}</h3>
                <p className="text-xs text-gray-500">{NOTIFICATION_CHANNELS.STREAK.description}</p>
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
        <div className="setting-card bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-xl mr-3">📢</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{NOTIFICATION_CHANNELS.UPDATES.name}</h3>
                <p className="text-xs text-gray-500">{NOTIFICATION_CHANNELS.UPDATES.description}</p>
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
      </div>
    </div>
  );
};

export default NotificationSettings;

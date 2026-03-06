import React, { useState, useEffect } from 'react';
import { 
  getNotificationPreferences, 
  updateNotificationPreferences, 
  NOTIFICATION_CHANNELS,
  requestNotificationPermission
} from '../services/smartNotificationService';
import { useTranslation } from 'react-i18next';
import { 
    BellRing, Bell, Flame, Megaphone, Moon, 
    AlertCircle, ChevronDown, Clock
} from 'lucide-react';
import './Navigation.css';
import './NotificationSettings.css';

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
    <div className="notification-settings-section">
      <div className="settings-group-title" style={{ marginTop: '24px' }}>{t('settings.notificationSettingsTitle', 'Bildirim Kanalları')}</div>

      {!permissionGranted && (
        <div className="settings-card" style={{ background: '#fffbeb', borderColor: '#fef3c7', flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <AlertCircle size={24} color="#f59e0b" />
            <div>
              <div className="settings-label" style={{ color: '#92400e' }}>{t('settings.notificationPermissionRequiredTitle')}</div>
              <div className="settings-desc" style={{ color: '#b45309' }}>{t('settings.notificationPermissionRequiredDesc')}</div>
            </div>
          </div>
          <button 
            onClick={requestPermission}
            className="hamburger-pro-badge"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {t('settings.allowPermission')}
          </button>
        </div>
      )}

      <div className="settings-group">
        {/* Ezan Vakitleri */}
        <div className="settings-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => handleToggle('prayer')}>
            <div className="settings-card-left">
                <div className="settings-icon-box" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                    <BellRing size={20} />
                </div>
                <div>
                    <div className="settings-label">{t('notifications.channels.prayer.name', NOTIFICATION_CHANNELS.PRAYER.name)}</div>
                    <div className="settings-desc">{t('notifications.channels.prayer.description', NOTIFICATION_CHANNELS.PRAYER.description)}</div>
                </div>
            </div>
            <div className={`velocity-switch ${prefs.prayer ? 'active' : ''}`}>
                <div className="velocity-knob" />
            </div>
          </div>
          
          {prefs.prayer && (
            <div className="val-selection" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--nav-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="settings-desc" style={{ fontSize: '14px', color: 'var(--nav-text)' }}>{t('settings.preAlertMinutes')}</span>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <select 
                        value={prefs.preAlertMinutes} 
                        onChange={handleTimeChange}
                        className="themed-select-min"
                        style={{ paddingRight: '24px', background: 'var(--nav-hover)', border: '1px solid var(--nav-border)', borderRadius: '8px', color: 'var(--nav-text)', appearance: 'none' }}
                    >
                        <option value="15">15 {t('common.minutes', 'dk')}</option>
                        <option value="30">30 {t('common.minutes', 'dk')}</option>
                        <option value="45">45 {t('common.minutes', 'dk')}</option>
                        <option value="0">{t('settings.off', 'Kapalı')}</option>
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: '8px', pointerEvents: 'none', color: 'var(--nav-text-muted)' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Günlük Hatırlatıcılar */}
        <div className="settings-card" onClick={() => handleToggle('reminder')}>
          <div className="settings-card-left">
              <div className="settings-icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                  <Bell size={20} />
              </div>
              <div>
                  <div className="settings-label">{t('notifications.channels.reminder.name', NOTIFICATION_CHANNELS.REMINDER.name)}</div>
                  <div className="settings-desc">{t('notifications.channels.reminder.description', NOTIFICATION_CHANNELS.REMINDER.description)}</div>
              </div>
          </div>
          <div className={`velocity-switch ${prefs.reminder ? 'active' : ''}`}>
              <div className="velocity-knob" />
          </div>
        </div>

        {/* Seri Koruması */}
        <div className="settings-card" onClick={() => handleToggle('streak')}>
          <div className="settings-card-left">
              <div className="settings-icon-box" style={{ background: 'rgba(249, 115, 22, 0.1)', color: '#f97316' }}>
                  <Flame size={20} />
              </div>
              <div>
                  <div className="settings-label">{t('notifications.channels.streak.name', NOTIFICATION_CHANNELS.STREAK.name)}</div>
                  <div className="settings-desc">{t('notifications.channels.streak.description', NOTIFICATION_CHANNELS.STREAK.description)}</div>
              </div>
          </div>
          <div className={`velocity-switch ${prefs.streak ? 'active' : ''}`}>
              <div className="velocity-knob" />
          </div>
        </div>

        {/* Güncellemeler */}
        <div className="settings-card" onClick={() => handleToggle('updates')}>
          <div className="settings-card-left">
              <div className="settings-icon-box" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                  <Megaphone size={20} />
              </div>
              <div>
                  <div className="settings-label">{t('notifications.channels.updates.name', NOTIFICATION_CHANNELS.UPDATES.name)}</div>
                  <div className="settings-desc">{t('notifications.channels.updates.description', NOTIFICATION_CHANNELS.UPDATES.description)}</div>
              </div>
          </div>
          <div className={`velocity-switch ${prefs.updates ? 'active' : ''}`}>
              <div className="velocity-knob" />
          </div>
        </div>

        {/* Sessiz Saatler */}
        <div className="settings-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => handleToggle('quietHoursEnabled')}>
            <div className="settings-card-left">
                <div className="settings-icon-box" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                    <Moon size={20} />
                </div>
                <div>
                    <div className="settings-label">{t('settings.quietHoursTitle')}</div>
                    <div className="settings-desc">{t('settings.quietHoursDesc')}</div>
                </div>
            </div>
            <div className={`velocity-switch ${prefs.quietHoursEnabled ? 'active' : ''}`}>
                <div className="velocity-knob" />
            </div>
          </div>

          {prefs.quietHoursEnabled && (
            <div className="quiet-hours-grid" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--nav-border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span className="settings-desc" style={{ fontWeight: '700' }}>{t('settings.start')}</span>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                        type="time"
                        value={prefs.quietHoursStart}
                        onChange={(e) => handleQuietHoursTimeChange('quietHoursStart', e.target.value)}
                        style={{ width: '100%', padding: '10px', background: 'var(--nav-hover)', border: '1px solid var(--nav-border)', borderRadius: '8px', color: 'var(--nav-text)', outline: 'none' }}
                    />
                    <Clock size={14} style={{ position: 'absolute', right: '10px', pointerEvents: 'none', color: 'var(--nav-text-muted)' }} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span className="settings-desc" style={{ fontWeight: '700' }}>{t('settings.end')}</span>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                        type="time"
                        value={prefs.quietHoursEnd}
                        onChange={(e) => handleQuietHoursTimeChange('quietHoursEnd', e.target.value)}
                        style={{ width: '100%', padding: '10px', background: 'var(--nav-hover)', border: '1px solid var(--nav-border)', borderRadius: '8px', color: 'var(--nav-text)', outline: 'none' }}
                    />
                    <Clock size={14} style={{ position: 'absolute', right: '10px', pointerEvents: 'none', color: 'var(--nav-text-muted)' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;

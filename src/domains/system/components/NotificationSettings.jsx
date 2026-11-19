import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Bell, BellRing, Flame, Megaphone, Moon } from 'lucide-react';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  NOTIFICATION_CHANNELS,
  requestNotificationPermission
} from '../../../services/smartNotificationService';
import { checkNotificationPermission } from '../../../services/notificationPlatformService';
import SettingsActionRow from '../../settings/components/SettingsActionRow';
import SettingsToggle from '../../settings/components/SettingsToggle';

const ICON = { size: 20, strokeWidth: 1.75 };
const fieldStyle = {
  minHeight: 40,
  padding: '0 var(--space-3)',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--line)',
  background: 'var(--paper-raised)',
  color: 'var(--ink)',
  font: '500 14px/20px var(--font-sans)',
};
const subPanelStyle = {
  marginTop: 'calc(-1 * var(--space-2))',
  padding: 'var(--space-3)',
  borderRadius: '0 0 var(--radius-md) var(--radius-md)',
  border: '1px solid var(--line)',
  borderTop: 0,
  background: 'var(--paper-sunken)',
};

const NotificationSettings = () => {
  const { t } = useTranslation();
  const [prefs, setPrefs] = useState(() => getNotificationPreferences());
  // null until checked, so the warning does not flash before the real answer arrives.
  const [permissionGranted, setPermissionGranted] = useState(null);

  useEffect(() => {
    let cancelled = false;
    // The web Notification API does not exist in the Android WebView; ask the native layer instead.
    void checkNotificationPermission().then((granted) => {
      if (!cancelled) setPermissionGranted(granted);
    });
    return () => { cancelled = true; };
  }, []);

  const savePrefs = async (newPrefs) => {
    setPrefs(newPrefs);
    await updateNotificationPreferences(newPrefs);
  };

  const handleToggle = (key) => savePrefs({ ...prefs, [key]: !prefs[key] });

  const requestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermissionGranted(granted);
  };

  const channelRow = (key, channelKey, channel, icon) => (
    <SettingsActionRow
      checked={Boolean(prefs[key])}
      description={t(`notifications.channels.${channelKey}.description`, channel.description)}
      icon={icon}
      onClick={() => handleToggle(key)}
      rightContent={<SettingsToggle active={Boolean(prefs[key])} />}
      title={t(`notifications.channels.${channelKey}.name`, channel.name)}
    />
  );

  return (
    <div className="settings-group">
      <div className="settings-group-title hz-overline">{t('settings.notificationSettingsTitle', 'Bildirim Kanalları')}</div>

      {permissionGranted === false && (
        <div className="hz-card" style={{ display: 'grid', gap: 'var(--space-3)', borderColor: 'var(--gold)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
            <AlertCircle {...ICON} aria-hidden="true" style={{ flex: 'none', color: 'var(--gold-ink)' }} />
            <div style={{ display: 'grid', gap: 2 }}>
              <div className="hz-row__title">{t('settings.notificationPermissionRequiredTitle')}</div>
              <div className="hz-label">{t('settings.notificationPermissionRequiredDesc')}</div>
            </div>
          </div>
          <button type="button" className="hz-btn hz-btn--primary" onClick={requestPermission}>
            {t('settings.allowPermission')}
          </button>
        </div>
      )}

      {channelRow('prayer', 'prayer', NOTIFICATION_CHANNELS.PRAYER, <BellRing {...ICON} />)}
      {prefs.prayer && (
        <label style={{ ...subPanelStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
          <span className="hz-label">{t('settings.preAlertMinutes')}</span>
          <select
            value={prefs.preAlertMinutes}
            onChange={(e) => savePrefs({ ...prefs, preAlertMinutes: parseInt(e.target.value, 10) })}
            style={fieldStyle}
          >
            <option value="15">15 {t('common.minutes', 'dk')}</option>
            <option value="30">30 {t('common.minutes', 'dk')}</option>
            <option value="45">45 {t('common.minutes', 'dk')}</option>
            <option value="0">{t('settings.off', 'Kapalı')}</option>
          </select>
        </label>
      )}

      {channelRow('reminder', 'reminder', NOTIFICATION_CHANNELS.REMINDER, <Bell {...ICON} />)}
      {channelRow('streak', 'streak', NOTIFICATION_CHANNELS.STREAK, <Flame {...ICON} />)}
      {channelRow('updates', 'updates', NOTIFICATION_CHANNELS.UPDATES, <Megaphone {...ICON} />)}

      <SettingsActionRow
        checked={Boolean(prefs.quietHoursEnabled)}
        description={t('settings.quietHoursDesc')}
        icon={<Moon {...ICON} />}
        onClick={() => handleToggle('quietHoursEnabled')}
        rightContent={<SettingsToggle active={Boolean(prefs.quietHoursEnabled)} />}
        title={t('settings.quietHoursTitle')}
      />
      {prefs.quietHoursEnabled && (
        <div style={{ ...subPanelStyle, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <label style={{ display: 'grid', gap: 'var(--space-1)' }}>
            <span className="hz-label">{t('settings.start')}</span>
            <input
              type="time"
              value={prefs.quietHoursStart}
              onChange={(e) => savePrefs({ ...prefs, quietHoursStart: e.target.value })}
              style={fieldStyle}
            />
          </label>
          <label style={{ display: 'grid', gap: 'var(--space-1)' }}>
            <span className="hz-label">{t('settings.end')}</span>
            <input
              type="time"
              value={prefs.quietHoursEnd}
              onChange={(e) => savePrefs({ ...prefs, quietHoursEnd: e.target.value })}
              style={fieldStyle}
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;

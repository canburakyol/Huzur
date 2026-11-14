import { Clock, History } from 'lucide-react';

import NotificationSettings from '../../system/components/NotificationSettings';
import SettingsActionRow from './SettingsActionRow';
import SettingsToggle from './SettingsToggle';

function SettingsNotificationSection({
  onShowHistory,
  onToggleStickyNotification,
  stickyNotification,
  t
}) {
  return (
    <>
      <NotificationSettings />

      <div className="settings-group">
        <div className="settings-group-title premium-text">{t('settings.notifications')}</div>

        <SettingsActionRow
          description={t('settings.historyDesc')}
          icon={<History size={20} />}
          onClick={onShowHistory}
          title={t('settings.historyTitle', 'Bildirim Geçmişi')}
        />


        <SettingsActionRow
          description={t('settings.stickyCounterDesc')}
          icon={<Clock size={20} />}
          onClick={onToggleStickyNotification}
          rightContent={<SettingsToggle active={stickyNotification} />}
          title={t('settings.stickyCounter')}
        />
      </div>
    </>
  );
}

export default SettingsNotificationSection;

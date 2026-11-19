import { Eye, Trophy } from 'lucide-react';

import SettingsActionRow from './SettingsActionRow';
import SettingsToggle from './SettingsToggle';

function SettingsMiniLeagueSection({
  miniLeaguePreferences,
  miniLeagueSummary,
  onToggleMiniLeague,
  onToggleVisibility,
  t
}) {
  return (
    <div className="settings-group">
      <div className="settings-group-title hz-overline">
        {t('socialRetention.settingsTitle', 'Sosyal Ritim')}
      </div>

      <SettingsActionRow
        description={t('socialRetention.miniLeagueDesc', 'Sadece ritim bandın görünür; isim ve ham puan paylaşılmaz.')}
        checked={Boolean(miniLeaguePreferences?.optedIn)}
        icon={<Trophy size={20} strokeWidth={1.75} />}
        onClick={onToggleMiniLeague}
        rightContent={<SettingsToggle active={miniLeaguePreferences?.optedIn} />}
        title={t('socialRetention.miniLeagueTitle', 'Anonim mini lig')}
      />

      <SettingsActionRow
        description={
          miniLeaguePreferences?.optedIn
            ? t('socialRetention.visibilityCurrent', {
                mode: t(`socialRetention.visibility_${miniLeaguePreferences.visibilityMode}`, miniLeaguePreferences.visibilityMode),
                detail: t(miniLeagueSummary?.standingKey || 'socialRetention.defaultStanding', 'Ritmin sakin bir band olarak gosterilir.')
              })
            : t('socialRetention.visibilityOffDesc', 'Mini lig kapalıyken görünürlük kapalı kalır.')
        }
        dimmed={!miniLeaguePreferences?.optedIn}
        icon={<Eye size={20} strokeWidth={1.75} />}
        onClick={onToggleVisibility}
        title={t('socialRetention.visibilityTitle', 'Görünürlük seviyesi')}
      />
    </div>
  );
}

export default SettingsMiniLeagueSection;

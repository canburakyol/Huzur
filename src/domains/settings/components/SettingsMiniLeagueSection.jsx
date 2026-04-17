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
      <div className="settings-group-title premium-text">
        {t('socialRetention.settingsTitle', 'Sosyal Ritim')}
      </div>

      <SettingsActionRow
        description={t('socialRetention.miniLeagueDesc', 'Sadece ritim bandin gorunur; isim ve ham puan paylasilmaz.')}
        icon={<span style={{ fontSize: '18px', fontWeight: '900' }}>%</span>}
        iconStyle={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}
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
            : t('socialRetention.visibilityOffDesc', 'Mini lig kapaliyken gorunurluk kapali kalir.')
        }
        icon={<span style={{ fontSize: '16px', fontWeight: '900' }}>#</span>}
        iconStyle={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}
        onClick={onToggleVisibility}
        style={{ opacity: miniLeaguePreferences?.optedIn ? 1 : 0.55 }}
        title={t('socialRetention.visibilityTitle', 'Gorunurluk seviyesi')}
      />
    </div>
  );
}

export default SettingsMiniLeagueSection;

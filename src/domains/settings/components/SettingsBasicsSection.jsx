import { Info, Moon, Sun } from 'lucide-react';

import { APP_VERSION } from '../../../constants';
import SettingsActionRow from './SettingsActionRow';
import SettingsToggle from './SettingsToggle';

function getLanguageBadge(languageCode) {
  return String(languageCode || '').slice(0, 2).toUpperCase() || 'GL';
}

function SettingsBasicsSection({
  currentLang,
  darkMode,
  onLanguageChange,
  onToggleDarkMode,
  supportedLanguages,
  t
}) {
  return (
    <>
      <div className="settings-group">
        <div className="settings-group-title hz-overline">{t('settings.language')}</div>
        <div className="settings-languages" role="group" aria-label={t('settings.language')}>
          <>
            {supportedLanguages.map((language) => {
              const isActive = currentLang === language.code;

              return (
                <button
                  type="button"
                  key={language.code}
                  aria-pressed={isActive}
                  className={`settings-language-button ${isActive ? 'active' : ''}`}
                  onClick={() => onLanguageChange(language.code)}
                >
                  <span className="settings-language-badge">
                    {getLanguageBadge(language.code)}
                  </span>
                  <span>{language.nativeName}</span>
                </button>
              );
            })}
          </>
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-group-title hz-overline">{t('settings.appearance', 'Gorunum')}</div>
        <SettingsActionRow
          description={darkMode ? t('settings.darkMode') : t('settings.lightMode')}
          checked={darkMode}
          icon={darkMode ? <Moon size={20} strokeWidth={1.75} /> : <Sun size={20} strokeWidth={1.75} />}
          onClick={onToggleDarkMode}
          rightContent={<SettingsToggle active={darkMode} />}
          title={t('settings.theme')}
        />
      </div>

      <div className="hz-card" style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
        <Info size={20} strokeWidth={1.75} aria-hidden="true" style={{ flex: 'none', color: 'var(--gold-ink)', marginTop: 2 }} />
        <div style={{ display: 'grid', gap: 'var(--space-1)' }}>
          <div className="hz-row__title">{t('settings.about')}</div>
          <div className="hz-label">{t('app.name')} {t('settings.appName')} v{APP_VERSION}</div>
          <div className="hz-label">{t('settings.appDescription')}</div>
        </div>
      </div>

    </>
  );
}

export default SettingsBasicsSection;

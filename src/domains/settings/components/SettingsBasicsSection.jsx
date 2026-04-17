import { Info, Moon, Sun } from 'lucide-react';

import { APP_VERSION } from '../../../constants';
import SettingsActionRow from './SettingsActionRow';
import SettingsToggle from './SettingsToggle';

function getLanguageBadge(languageCode) {
  const normalizedCode = String(languageCode || '').toUpperCase();

  if (normalizedCode === 'TR' || normalizedCode === 'EN' || normalizedCode === 'AR') {
    return normalizedCode;
  }

  return 'GL';
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
        <div className="settings-group-title premium-text">{t('settings.language')}</div>
        <div className="settings-card premium-glass hover-lift" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {supportedLanguages.map((language) => {
              const isActive = currentLang === language.code;

              return (
                <button
                  key={language.code}
                  onClick={() => onLanguageChange(language.code)}
                  style={{
                    flex: '1',
                    minWidth: '80px',
                    padding: '12px',
                    borderRadius: '16px',
                    border: isActive ? '2px solid var(--nav-accent)' : '1px solid var(--nav-border)',
                    background: isActive ? 'rgba(245, 158, 11, 0.1)' : 'var(--nav-hover)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: isActive ? '800' : '600',
                    color: 'var(--nav-text)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '16px', fontWeight: '900', letterSpacing: '0.08em' }}>
                    {getLanguageBadge(language.code)}
                  </span>
                  <span>{language.nativeName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-group-title premium-text">{t('settings.appearance', 'Gorunum')}</div>
        <SettingsActionRow
          description={darkMode ? t('settings.darkMode') : t('settings.lightMode')}
          icon={darkMode ? <Moon size={20} /> : <Sun size={20} />}
          onClick={onToggleDarkMode}
          rightContent={<SettingsToggle active={darkMode} />}
          title={t('settings.theme')}
        />
      </div>

      <div
        style={{
          marginBottom: '16px',
          padding: '16px',
          background: 'var(--card-bg)',
          borderRadius: '14px',
          border: '1px solid var(--glass-border)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <Info size={22} color="var(--primary-color)" />
          <div style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text-color)' }}>
            {t('settings.about')}
          </div>
        </div>
        <div style={{ fontSize: '14px', color: 'var(--text-color-muted)' }}>
          <div>{t('app.name')} {t('settings.appName')} v{APP_VERSION}</div>
          <div style={{ marginTop: '4px' }}>{t('settings.appDescription')}</div>
        </div>
      </div>
    </>
  );
}

export default SettingsBasicsSection;

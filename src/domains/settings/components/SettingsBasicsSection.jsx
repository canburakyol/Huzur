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
        <div className="settings-card premium-glass hover-lift flex flex-col items-stretch">
          <div className="flex gap-8 flex-wrap">
            {supportedLanguages.map((language) => {
              const isActive = currentLang === language.code;

              return (
                <button
                  key={language.code}
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

      <div className="settings-basics-about-card">
        <div className="settings-basics-about-header">
          <Info size={22} color="var(--primary)" />
          <div className="settings-basics-about-title">
            {t('settings.about')}
          </div>
        </div>
        <div className="settings-basics-about-body">
          <div>{t('app.name')} {t('settings.appName')} v{APP_VERSION}</div>
          <div className="mt-4">{t('settings.appDescription')}</div>
        </div>
      </div>

      <style>{`
        .settings-language-button {
          flex: 1;
          min-width: 80px;
          padding: 12px;
          border-radius: 16px;
          border: 1px solid var(--nav-border);
          background: var(--nav-hover);
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          color: var(--nav-text);
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .settings-language-button.active {
          border: 2px solid var(--nav-accent);
          background: rgba(245, 158, 11, 0.1);
          font-weight: 800;
        }

        .settings-language-badge {
          font-size: 16px;
          font-weight: 900;
          letter-spacing: 0.08em;
        }

        .settings-basics-about-card {
          margin-bottom: 16px;
          padding: 16px;
          background: var(--card-bg);
          border-radius: 14px;
          border: 1px solid var(--glass-border);
        }

        .settings-basics-about-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }

        .settings-basics-about-title {
          font-weight: 600;
          font-size: 15px;
          color: var(--text-color);
        }

        .settings-basics-about-body {
          font-size: 14px;
          color: var(--text-color-muted);
        }
      `}</style>
    </>
  );
}

export default SettingsBasicsSection;

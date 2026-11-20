import { createElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Sun, Moon, Monitor } from 'lucide-react';
import PageHeader from './shared/PageHeader';
import { storageService } from '../services/storageService';
import { STORAGE_KEYS } from '../constants';
import { useAppStore } from '../stores/useAppStore';
import { normalizeThemeMode, resolveThemeMode } from '../services/themeModeService';
import '../styles/PracticePages.css';

// The app has one palette (Huzur Mushaf); the only choice left is light, dark or follow the device.
const MODES = [
    { id: 'light', Icon: Sun, labelKey: 'settings.lightMode', label: 'Açık Mod', descKey: 'settings.lightModeDesc', desc: 'Temiz ve enerjik görünüm' },
    { id: 'dark', Icon: Moon, labelKey: 'settings.darkMode', label: 'Karanlık Mod', descKey: 'settings.darkModeDesc', desc: 'Göz yormayan gece deneyimi' },
    { id: 'system', Icon: Monitor, labelKey: 'settings.systemMode', label: 'Sistem', descKey: 'settings.systemModeDesc', desc: 'Cihaz ayarlarına göre değişir' },
];

function ThemeSelector({ onClose }) {
    const { t } = useTranslation();
    const setTheme = useAppStore((s) => s.setTheme);
    const [themeMode, setThemeMode] = useState(() => normalizeThemeMode(storageService.getString(STORAGE_KEYS.THEME)));

    const handleThemeModeChange = (mode) => {
        setThemeMode(mode);
        setTheme(mode);
        const targetTheme = resolveThemeMode(normalizeThemeMode(mode), window.matchMedia('(prefers-color-scheme: dark)').matches);
        document.documentElement.setAttribute('data-theme', targetTheme);
    };

    return (
        <div className="practice-page">
            <PageHeader title={t('menu.theme', 'Görünüm ve Tema')} onBack={onClose} />

            <section className="practice-section">
                <h2 className="practice-section-title">{t('settings.themeMode', 'Görünüm Modu')}</h2>
                <div className="practice-list" role="radiogroup" aria-label={t('settings.themeMode', 'Görünüm Modu')}>
                    {MODES.map(({ id, Icon: icon, labelKey, label, descKey, desc }) => {
                        const active = themeMode === id;
                        return (
                            <button
                                key={id}
                                type="button"
                                role="radio"
                                aria-checked={active}
                                className={`practice-row ${active ? 'practice-row--done' : ''}`}
                                onClick={() => handleThemeModeChange(id)}
                            >
                                <span className="practice-row__icon">{createElement(icon, { size: 18, strokeWidth: 1.75, 'aria-hidden': true })}</span>
                                <span className="practice-row__body">
                                    <span className="practice-row__title">{t(labelKey, label)}</span>
                                    <span className="practice-row__text">{t(descKey, desc)}</span>
                                </span>
                                {active ? <Check size={20} aria-hidden="true" /> : null}
                            </button>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}

export default ThemeSelector;

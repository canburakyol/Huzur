import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Sun, Moon, Monitor, Palette } from 'lucide-react';
import IslamicBackButton from './shared/IslamicBackButton';
import { storageService } from '../services/storageService';
import { STORAGE_KEYS } from '../constants';
import { ACCENT_COLORS } from '../data/themes';
import './Navigation.css';

function ThemeSelector({ onClose }) {
    const { t } = useTranslation();
    
    const [themeMode, setThemeMode] = useState(() => {
        return storageService.getString(STORAGE_KEYS.THEME) || 'light';
    });

    const [accentColor, setAccentColor] = useState(() => {
        return storageService.getString('app_accent_color') || 'orange';
    });

    const handleThemeModeChange = (mode) => {
        setThemeMode(mode);
        storageService.setString(STORAGE_KEYS.THEME, mode);
        
        let targetTheme = mode;
        if (mode === 'system') {
            targetTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        
        document.documentElement.setAttribute('data-theme', targetTheme);
        window.dispatchEvent(new CustomEvent('themeModeChanged', { detail: { mode } }));
    };

    const handleAccentChange = (accentId) => {
        const accent = ACCENT_COLORS.find(a => a.id === accentId);
        if (!accent) return;

        setAccentColor(accentId);
        storageService.setString('app_accent_color', accentId);
        
        document.documentElement.style.setProperty('--nav-accent', accent.color);
        window.dispatchEvent(new CustomEvent('accentColorChanged', { detail: { color: accent.color } }));
    };

    return (
        <div className="settings-container reveal-stagger" style={{ minHeight: '100vh' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <IslamicBackButton onClick={onClose} size="medium" />
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: 'var(--nav-text)' }}>
                    {t('menu.theme', 'Görünüm ve Tema')}
                </h2>
            </div>

            <div className="settings-group">
                <div className="settings-group-title">{t('settings.themeMode', 'Görünüm Modu')}</div>
                
                <div className="settings-card" onClick={() => handleThemeModeChange('light')} style={{ border: themeMode === 'light' ? '2px solid var(--nav-accent)' : '' }}>
                    <div className="settings-card-left">
                        <div className="settings-icon-box" style={{ background: themeMode === 'light' ? 'var(--nav-accent)' : '', color: themeMode === 'light' ? 'white' : '' }}>
                            <Sun size={20} />
                        </div>
                        <div>
                            <div className="settings-label">{t('settings.lightMode', 'Açık Mod')}</div>
                            <div className="settings-desc">{t('settings.lightModeDesc', 'Temiz ve enerjik görünüm')}</div>
                        </div>
                    </div>
                    {themeMode === 'light' && <Check size={20} color="var(--nav-accent)" />}
                </div>

                <div className="settings-card" onClick={() => handleThemeModeChange('dark')} style={{ border: themeMode === 'dark' ? '2px solid var(--nav-accent)' : '' }}>
                    <div className="settings-card-left">
                        <div className="settings-icon-box" style={{ background: themeMode === 'dark' ? 'var(--nav-accent)' : '', color: themeMode === 'dark' ? 'white' : '' }}>
                            <Moon size={20} />
                        </div>
                        <div>
                            <div className="settings-label">{t('settings.darkMode', 'Karanlık Mod')}</div>
                            <div className="settings-desc">{t('settings.darkModeDesc', 'Göz yormayan gece deneyimi')}</div>
                        </div>
                    </div>
                    {themeMode === 'dark' && <Check size={20} color="var(--nav-accent)" />}
                </div>

                <div className="settings-card" onClick={() => handleThemeModeChange('system')} style={{ border: themeMode === 'system' ? '2px solid var(--nav-accent)' : '' }}>
                    <div className="settings-card-left">
                        <div className="settings-icon-box" style={{ background: themeMode === 'system' ? 'var(--nav-accent)' : '', color: themeMode === 'system' ? 'white' : '' }}>
                            <Monitor size={20} />
                        </div>
                        <div>
                            <div className="settings-label">{t('settings.systemMode', 'Sistem')}</div>
                            <div className="settings-desc">{t('settings.systemModeDesc', 'Cihaz ayarlarına göre değişir')}</div>
                        </div>
                    </div>
                    {themeMode === 'system' && <Check size={20} color="var(--nav-accent)" />}
                </div>
            </div>

            <div className="settings-group">
                <div className="settings-group-title">{t('settings.accentColor', 'Vurgu Rengi')}</div>
                <div className="settings-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                        {ACCENT_COLORS.map((accent) => (
                            <button
                                key={accent.id}
                                onClick={() => handleAccentChange(accent.id)}
                                style={{
                                    aspectRatio: '1',
                                    borderRadius: '16px',
                                    background: accent.color,
                                    border: accentColor === accent.id ? '4px solid white' : 'none',
                                    boxShadow: accentColor === accent.id ? '0 0 0 2px ' + accent.color : 'none',
                                    transition: 'transform 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                                className="accent-btn"
                            >
                                {accentColor === accent.id && <Check size={24} color="white" />}
                            </button>
                        ))}
                    </div>
                    <div className="settings-desc" style={{ textAlign: 'center' }}>
                        Uygulama genelindeki buton ve simgelerin rengini değiştirir.
                    </div>
                </div>
            </div>

            <div className="settings-group">
                <div className="settings-group-title">Önizleme</div>
                <div className="settings-card" style={{ background: 'var(--nav-accent)', color: 'white' }}>
                    <div className="settings-card-left">
                        <div className="settings-icon-box" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                            <Palette size={20} />
                        </div>
                        <div>
                            <div className="settings-label" style={{ color: 'white' }}>Harika Değil mi?</div>
                            <div className="settings-desc" style={{ color: 'rgba(255,255,255,0.8)' }}>Bu renk size çok yakıştı.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ThemeSelector;

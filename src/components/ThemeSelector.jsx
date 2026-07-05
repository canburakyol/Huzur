import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Sun, Moon, Monitor, Palette } from 'lucide-react';
import IslamicBackButton from './shared/IslamicBackButton';
import { storageService } from '../services/storageService';
import { STORAGE_KEYS } from '../constants';
import { ACCENT_COLORS } from '../data/themes';
import { useAppStore } from '../stores/useAppStore';
import './app-shell/Navigation.css';

const LEGACY_ACCENT_MAP = {
    orange: 'amber',
    gold: 'antique-gold',
    blue: 'deep-emerald',
    purple: 'olive-gold',
};

const normalizeAccentId = (id) => {
    if (!id) return 'amber';
    const normalized = LEGACY_ACCENT_MAP[id] || id;
    return ACCENT_COLORS.some((accent) => accent.id === normalized) ? normalized : 'amber';
};

function ThemeSelector({ onClose }) {
    const { t } = useTranslation();
    const setTheme = useAppStore((s) => s.setTheme);
    const setAccentColor = useAppStore((s) => s.setAccentColor);
    
    const [themeMode, setThemeMode] = useState(() => {
        return storageService.getString(STORAGE_KEYS.THEME) || 'light';
    });

    const [accentColor, setAccentColorLocal] = useState(() => {
        const stored = storageService.getString('app_accent_color');
        return normalizeAccentId(stored);
    });

    const handleThemeModeChange = (mode) => {
        setThemeMode(mode);
        setTheme(mode);
        
        let targetTheme = mode;
        if (mode === 'system') {
            targetTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        
        document.documentElement.setAttribute('data-theme', targetTheme);
    };

    const handleAccentChange = (accentId) => {
        const accent = ACCENT_COLORS.find(a => a.id === accentId);
        if (!accent) return;

        setAccentColorLocal(accentId);
        setAccentColor(accentId);
        
        document.documentElement.style.setProperty('--nav-accent', accent.color);
        document.documentElement.style.setProperty('--primary', accent.color);
        document.documentElement.style.setProperty('--accent', accent.color);
        document.documentElement.style.setProperty('--accent-vibrant', accent.color);
        document.documentElement.style.setProperty('--accent-gold-light', accent.color);
        if (accent.dark) {
            document.documentElement.style.setProperty('--primary', accent.dark);
            document.documentElement.style.setProperty('--accent-gold', accent.dark);
        }
        if (accent.rgb) {
            document.documentElement.style.setProperty('--nav-accent-rgb', accent.rgb);
        }
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
                        <div className="settings-icon-box" style={{ background: themeMode === 'light' ? 'var(--nav-accent)' : '', color: themeMode === 'light' ? 'var(--on-primary)' : '' }}>
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
                        <div className="settings-icon-box" style={{ background: themeMode === 'dark' ? 'var(--nav-accent)' : '', color: themeMode === 'dark' ? 'var(--on-primary)' : '' }}>
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
                        <div className="settings-icon-box" style={{ background: themeMode === 'system' ? 'var(--nav-accent)' : '', color: themeMode === 'system' ? 'var(--on-primary)' : '' }}>
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
                                {accentColor === accent.id && <Check size={24} color='var(--on-primary)' />}
                            </button>
                        ))}
                    </div>
                    <div className="settings-desc" style={{ textAlign: 'center' }}>
                        {t('settings.accentColorDesc', 'Uygulama genelindeki buton ve simgelerin rengini değiştirir.')}
                    </div>
                </div>
            </div>

            <div className="settings-group">
                <div className="settings-group-title">{t('settings.preview', 'Önizleme')}</div>
                <div className="settings-card" style={{ background: 'var(--nav-accent)', color: 'var(--on-primary)' }}>
                    <div className="settings-card-left">
                        <div className="settings-icon-box" style={{ background: 'rgba(255,255,255,0.2)', color: 'var(--on-primary)' }}>
                            <Palette size={20} />
                        </div>
                        <div>
                            <div className="settings-label" style={{ color: 'var(--on-primary)' }}>{t('settings.previewTitle', 'Harika Değil mi?')}</div>
                            <div className="settings-desc" style={{ color: 'rgba(255,255,255,0.8)' }}>{t('settings.previewDesc', 'Bu renk size çok yakıştı.')}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ThemeSelector;

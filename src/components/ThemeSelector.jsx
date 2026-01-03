import { useState } from 'react';
import { ArrowLeft, Check, Palette } from 'lucide-react';
import { storageService } from '../services/storageService';
import { STORAGE_KEYS } from '../constants';

// 3 Islamic Theme Options
const THEMES = [
    {
        id: 'green-gold',
        name: 'Yeşil & Altın',
        description: 'Klasik İslami renkler',
        icon: '🕌',
        preview: {
            bg: '#0f3d2e',
            primary: '#d4af37',
            text: '#f0e68c'
        },
        colors: {
            '--bg-gradient-start': '#0f3d2e',
            '--bg-gradient-end': '#1a5c45',
            '--bg-gradient-accent': '#d4af37',
            '--text-color': '#f0e68c',
            '--text-color-light': '#d4af37',
            '--text-color-muted': '#a3b18a',
            '--primary-color': '#d4af37',
            '--primary-dark': '#b8860b',
            '--accent-color': '#f1c40f',
            '--glass-bg': 'rgba(15, 61, 46, 0.7)',
            '--glass-border': 'rgba(212, 175, 55, 0.3)',
            '--card-bg': 'rgba(20, 70, 55, 0.8)',
            '--input-border': '#d4af37'
        },
        bodyGradient: 'linear-gradient(135deg, #0f3d2e 0%, #1a5c45 100%)'
    },
    {
        id: 'midnight-blue',
        name: 'Gece Mavisi',
        description: 'Huzurlu gece teması',
        icon: '🌙',
        preview: {
            bg: '#1a1a2e',
            primary: '#e94560',
            text: '#eaeaea'
        },
        colors: {
            '--bg-gradient-start': '#1a1a2e',
            '--bg-gradient-end': '#16213e',
            '--bg-gradient-accent': '#e94560',
            '--text-color': '#eaeaea',
            '--text-color-light': '#e94560',
            '--text-color-muted': '#8b8b8b',
            '--primary-color': '#e94560',
            '--primary-dark': '#c73e54',
            '--accent-color': '#ff6b6b',
            '--glass-bg': 'rgba(26, 26, 46, 0.8)',
            '--glass-border': 'rgba(233, 69, 96, 0.3)',
            '--card-bg': 'rgba(22, 33, 62, 0.8)',
            '--input-border': '#e94560'
        },
        bodyGradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
    },
    {
        id: 'desert-sand',
        name: 'Çöl Kumu',
        description: 'Sıcak toprak tonları',
        icon: '🏜️',
        preview: {
            bg: '#d4a574',
            primary: '#8b4513',
            text: '#2c1810'
        },
        colors: {
            '--bg-gradient-start': '#d4a574',
            '--bg-gradient-end': '#c19a6b',
            '--bg-gradient-accent': '#8b4513',
            '--text-color': '#2c1810',
            '--text-color-light': '#8b4513',
            '--text-color-muted': '#5c4033',
            '--primary-color': '#8b4513',
            '--primary-dark': '#6b3410',
            '--accent-color': '#cd853f',
            '--glass-bg': 'rgba(212, 165, 116, 0.7)',
            '--glass-border': 'rgba(139, 69, 19, 0.3)',
            '--card-bg': 'rgba(193, 154, 107, 0.8)',
            '--input-border': '#8b4513'
        },
        bodyGradient: 'linear-gradient(135deg, #d4a574 0%, #c19a6b 50%, #a0826d 100%)'
    },
    {
        id: 'auto-vakit',
        name: 'Otomatik (Vakit)',
        description: 'Namaz vaktine göre değişir',
        icon: '⏳',
        preview: {
            bg: 'linear-gradient(to right, #1e3a5f, #4facfe, #0f0c29)',
            primary: '#fff',
            text: '#fff'
        },
        colors: {}, // Will be applied dynamically
        bodyGradient: '' // Will be applied dynamically
    }
];

function ThemeSelector({ onClose }) {
    const [currentTheme, setCurrentTheme] = useState(() => {
        return storageService.getString(STORAGE_KEYS.APP_THEME) || 'green-gold';
    });

    // Apply theme on change
    const applyTheme = (themeId) => {
        const theme = THEMES.find(t => t.id === themeId);
        if (!theme) return;

        const root = document.documentElement;

        // Apply CSS variables
        Object.entries(theme.colors).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });

        // Apply body background
        document.body.style.background = theme.bodyGradient;
        document.body.style.backgroundAttachment = 'fixed';

        // Save preference
        storageService.setString(STORAGE_KEYS.APP_THEME, themeId);
        setCurrentTheme(themeId);

        // Dispatch event for App.jsx to pick up
        window.dispatchEvent(new CustomEvent('appThemeChanged', { detail: { themeId } }));
    };

    return (
        <div className="app-container" style={{ minHeight: '100vh', paddingBottom: '100px' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
                paddingTop: '20px'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px',
                        color: 'var(--primary-color)'
                    }}
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{
                    margin: 0,
                    fontSize: '22px',
                    color: 'var(--primary-color)',
                    fontWeight: '700'
                }}>
                    🎨 Tema Seçimi
                </h1>
            </div>

            {/* Description */}
            <p style={{ color: 'var(--text-color-muted)', fontSize: '14px', marginBottom: '20px' }}>
                Uygulamanın renklerini değiştirin
            </p>

            {/* Theme Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {THEMES.map(theme => (
                    <div
                        key={theme.id}
                        onClick={() => applyTheme(theme.id)}
                        style={{
                            padding: '20px',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            border: currentTheme === theme.id
                                ? '3px solid var(--primary-color)'
                                : '1px solid var(--glass-border)',
                            background: 'var(--glass-bg)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            {/* Theme Preview */}
                            <div style={{
                                width: '70px',
                                height: '70px',
                                borderRadius: '12px',
                                background: theme.preview.bg,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: `2px solid ${theme.preview.primary}`,
                                flexShrink: 0
                            }}>
                                <span style={{
                                    fontSize: '28px',
                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                                }}>
                                    {theme.icon}
                                </span>
                            </div>

                            {/* Theme Info */}
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontWeight: '700',
                                    fontSize: '16px',
                                    color: 'var(--primary-color)',
                                    marginBottom: '4px'
                                }}>
                                    {theme.name}
                                </div>
                                <div style={{
                                    fontSize: '13px',
                                    color: 'var(--text-color-muted)'
                                }}>
                                    {theme.description}
                                </div>

                                {/* Color Swatches */}
                                <div style={{
                                    display: 'flex',
                                    gap: '6px',
                                    marginTop: '10px'
                                }}>
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        background: theme.preview.bg,
                                        border: '1px solid rgba(255,255,255,0.3)'
                                    }} />
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        background: theme.preview.primary,
                                        border: '1px solid rgba(255,255,255,0.3)'
                                    }} />
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        background: theme.preview.text,
                                        border: '1px solid rgba(255,255,255,0.3)'
                                    }} />
                                </div>
                            </div>

                            {/* Selected Indicator */}
                            {currentTheme === theme.id && (
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'var(--primary-color)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Check size={18} color="#fff" />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Note */}
            <div style={{
                marginTop: '24px',
                padding: '16px',
                background: 'var(--glass-bg)',
                borderRadius: '12px',
                border: '1px solid var(--glass-border)'
            }}>
                <div style={{
                    fontSize: '13px',
                    color: 'var(--text-color-muted)',
                    lineHeight: '1.6'
                }}>
                    💡 <strong>İpucu:</strong> Tema tercihiniz kaydedilir ve uygulama her açıldığında otomatik uygulanır.
                </div>
            </div>
        </div>
    );
}

export default ThemeSelector;

// Export themes for use in App.jsx initialization
export { THEMES };

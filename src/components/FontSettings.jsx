import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Type, Minus, Plus, Check, RotateCcw, AlignLeft } from 'lucide-react';
import IslamicBackButton from './shared/IslamicBackButton';
import { storageService } from '../services/storageService';

const STORAGE_KEY = 'huzur_font_settings';

// Arapça font seçenekleri
const ARABIC_FONTS = [
  { id: 'Amiri', name: 'Amiri', preview: 'بِسْمِ اللهِ', description: 'Klasik Kuran yazısı' },
  { id: 'Scheherazade New', name: 'Scheherazade', preview: 'بِسْمِ اللهِ', description: 'Osmanlı tarzı' },
  { id: 'Noto Naskh Arabic', name: 'Noto Naskh', preview: 'بِسْمِ اللهِ', description: 'Modern ve okunaklı' },
  { id: 'Kitab', name: 'Kitab', preview: 'بِسْمِ اللهِ', description: 'Geleneksel kitap yazısı' }
];

// Varsayılan ayarlar
const DEFAULT_SETTINGS = {
  arabicFontSize: 24,
  turkishFontSize: 16,
  arabicFontFamily: 'Amiri',
  lineHeight: 1.8
};

const FontSettings = ({ onClose }) => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedSettings = storageService.getString(STORAGE_KEY, '');
    if (savedSettings) {
      try {
        // eslint-disable-next-line
        setSettings(JSON.parse(savedSettings));
      } catch {
        // Hata sessizce yönetiliyor
      }
    }
  }, []);

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    storageService.setItem(STORAGE_KEY, newSettings);
    applyFontSettings(newSettings);
    
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const applyFontSettings = (s) => {
    document.documentElement.style.setProperty('--arabic-font-size', `${s.arabicFontSize}px`);
    document.documentElement.style.setProperty('--turkish-font-size', `${s.turkishFontSize}px`);
    document.documentElement.style.setProperty('--arabic-font-family', `'${s.arabicFontFamily}', 'Noto Naskh Arabic', 'Scheherazade New', 'Noto Sans Arabic', 'Droid Arabic Naskh', 'Geeza Pro', 'Tahoma', 'Arial', serif`);
    document.documentElement.style.setProperty('--quran-line-height', s.lineHeight);
  };

  useEffect(() => {
    applyFontSettings(settings);
  }, [settings]);

  const adjustSize = (key, delta) => {
    const limits = {
      arabicFontSize: { min: 16, max: 40 },
      turkishFontSize: { min: 12, max: 24 },
      lineHeight: { min: 1.4, max: 2.5, step: 0.1 }
    };
    
    const limit = limits[key];
    const step = limit.step || 2;
    const newValue = Math.min(limit.max, Math.max(limit.min, settings[key] + (delta * step)));
    updateSetting(key, Math.round(newValue * 10) / 10);
  };

  return (
    <div className="settings-container reveal-stagger" style={{ paddingBottom: '120px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <IslamicBackButton onClick={onClose} size="medium" />
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--nav-text)', fontWeight: '950', letterSpacing: '-0.5px' }}>
            {t('fontSettings.title', 'Yazı Ayarları')}
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--nav-text-muted)', fontWeight: '600' }}>
            {t('fontSettings.subtitle', 'Metin görünümünü kişiselleştir')}
          </p>
        </div>
        {saved && (
          <div className="save-indicator-badge">
            <Check size={14} />
            {t('common.saved', 'Kaydedildi')}
          </div>
        )}
      </div>

      {/* Preview Card */}
      <div className="settings-card reveal-stagger" style={{ 
          padding: '24px', marginBottom: '32px', flexDirection: 'column', alignItems: 'stretch',
          background: 'var(--nav-hover)', border: '1px solid var(--nav-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <div style={{ width: '4px', height: '16px', background: 'var(--nav-accent)', borderRadius: '2px' }}></div>
            <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '900', color: 'var(--nav-text)', textTransform: 'uppercase' }}>
                {t('fontSettings.preview', 'Önizleme')}
            </h3>
        </div>
        
        <div style={{ 
            background: 'var(--nav-bg)', padding: '24px', borderRadius: '16px',
            border: '1px solid var(--nav-border)', textAlign: 'center'
        }}>
            <div style={{ 
                fontFamily: `'${settings.arabicFontFamily}', serif`,
                fontSize: `${settings.arabicFontSize}px`,
                lineHeight: settings.lineHeight,
                color: 'var(--nav-text)',
                marginBottom: '16px',
                direction: 'rtl'
            }}>
                بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ
            </div>
            <div style={{ 
                fontSize: `${settings.turkishFontSize}px`,
                lineHeight: settings.lineHeight,
                color: 'var(--nav-text-muted)',
                fontWeight: '600'
            }}>
                Rahman ve Rahim olan Allah'ın adıyla
            </div>
        </div>
      </div>

      {/* Font Selection Section */}
      <div className="reveal-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Arabic Font Family */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px' }}>
                <AlignLeft size={18} color="var(--nav-accent)" />
                <span style={{ fontSize: '0.9rem', fontWeight: '900', color: 'var(--nav-text)' }}>
                    {t('fontSettings.arabicFamily', 'Arapça Yazı Tipi')}
                </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {ARABIC_FONTS.map((font) => (
                    <button
                        key={font.id}
                        onClick={() => updateSetting('arabicFontFamily', font.id)}
                        className="settings-card"
                        style={{
                            padding: '16px', flexDirection: 'column', gap: '8px',
                            background: settings.arabicFontFamily === font.id ? 'rgba(79, 70, 229, 0.1)' : 'var(--nav-hover)',
                            border: settings.arabicFontFamily === font.id ? '2px solid var(--nav-accent)' : '1px solid var(--nav-border)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    >
                        <div style={{ 
                            fontSize: '1.5rem', color: 'var(--nav-text)', 
                            fontFamily: `'${font.id}', serif`, direction: 'rtl',
                            marginBottom: '4px'
                        }}>بِسْمِ اللهِ</div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: '900', color: 'var(--nav-text)' }}>{font.name}</div>
                        </div>
                        {settings.arabicFontFamily === font.id && (
                            <div className="settings-selected-dot" style={{ top: '8px', right: '8px' }}>
                                <Check size={12} color="white" />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>

        {/* Size Controls */}
        <div className="settings-card" style={{ padding: '24px', flexDirection: 'column', alignItems: 'stretch', gap: '24px' }}>
            
            {/* Arabic Size */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Type size={18} color="var(--nav-accent)" />
                        <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--nav-text)' }}>
                            {t('fontSettings.arabicSize', 'Arapça Boyutu')}
                        </span>
                    </div>
                    <span style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--nav-accent)' }}>{settings.arabicFontSize}px</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button className="settings-icon-box" onClick={() => adjustSize('arabicFontSize', -1)} disabled={settings.arabicFontSize <= 16}>
                        <Minus size={16} />
                    </button>
                    <input type="range" min="16" max="40" value={settings.arabicFontSize} 
                           onChange={(e) => updateSetting('arabicFontSize', parseInt(e.target.value))}
                           style={{ flex: 1, accentColor: 'var(--nav-accent)' }} />
                    <button className="settings-icon-box" onClick={() => adjustSize('arabicFontSize', 1)} disabled={settings.arabicFontSize >= 40}>
                        <Plus size={16} />
                    </button>
                </div>
            </div>

            <div style={{ height: '1px', background: 'var(--nav-border)', opacity: 0.5 }}></div>

            {/* Turkish Size */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Type size={18} color="var(--nav-accent)" />
                        <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--nav-text)' }}>
                            {t('fontSettings.turkishSize', 'Türkçe Boyutu')}
                        </span>
                    </div>
                    <span style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--nav-accent)' }}>{settings.turkishFontSize}px</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button className="settings-icon-box" onClick={() => adjustSize('turkishFontSize', -1)} disabled={settings.turkishFontSize <= 12}>
                        <Minus size={16} />
                    </button>
                    <input type="range" min="12" max="24" value={settings.turkishFontSize} 
                           onChange={(e) => updateSetting('turkishFontSize', parseInt(e.target.value))}
                           style={{ flex: 1, accentColor: 'var(--nav-accent)' }} />
                    <button className="settings-icon-box" onClick={() => adjustSize('turkishFontSize', 1)} disabled={settings.turkishFontSize >= 24}>
                        <Plus size={16} />
                    </button>
                </div>
            </div>

            <div style={{ height: '1px', background: 'var(--nav-border)', opacity: 0.5 }}></div>

            {/* Line Height */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <AlignLeft size={18} color="var(--nav-accent)" />
                        <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--nav-text)' }}>
                            {t('fontSettings.lineHeight', 'Satır Aralığı')}
                        </span>
                    </div>
                    <span style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--nav-accent)' }}>{settings.lineHeight.toFixed(1)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button className="settings-icon-box" onClick={() => adjustSize('lineHeight', -1)} disabled={settings.lineHeight <= 1.4}>
                        <Minus size={16} />
                    </button>
                    <input type="range" min="1.4" max="2.5" step="0.1" value={settings.lineHeight} 
                           onChange={(e) => updateSetting('lineHeight', parseFloat(e.target.value))}
                           style={{ flex: 1, accentColor: 'var(--nav-accent)' }} />
                    <button className="settings-icon-box" onClick={() => adjustSize('lineHeight', 1)} disabled={settings.lineHeight >= 2.5}>
                        <Plus size={16} />
                    </button>
                </div>
            </div>
        </div>

        {/* Reset Button */}
        <button 
            className="settings-card"
            onClick={() => {
                setSettings(DEFAULT_SETTINGS);
                storageService.setItem(STORAGE_KEY, DEFAULT_SETTINGS);
                applyFontSettings(DEFAULT_SETTINGS);
                setSaved(true);
                setTimeout(() => setSaved(false), 1500);
            }}
            style={{ 
                padding: '16px', background: 'transparent', border: '1px dashed var(--nav-border)',
                justifyContent: 'center', gap: '10px', color: 'var(--nav-text-muted)'
            }}
        >
            <RotateCcw size={16} />
            <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>{t('fontSettings.reset', 'Varsayılana Sıfırla')}</span>
        </button>
      </div>

      <style>{`
        .save-indicator-badge {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            background: rgba(16, 185, 129, 0.15);
            color: #10b981;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 900;
            animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .settings-selected-dot {
            position: absolute;
            width: 20px;
            height: 20px;
            background: var(--nav-accent);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 8px rgba(79, 70, 229, 0.3);
        }

        input[type="range"] {
            -webkit-appearance: none;
            height: 6px;
            background: var(--nav-border);
            border-radius: 3px;
            outline: none;
        }

        input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 18px;
            height: 18px;
            background: var(--nav-accent);
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 0 10px rgba(79, 70, 229, 0.4);
            transition: all 0.2s;
        }

        input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default FontSettings;

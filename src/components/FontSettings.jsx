import { useState, useEffect } from 'react';
import { Type, Minus, Plus, Check } from 'lucide-react';
import IslamicBackButton from './shared/IslamicBackButton';

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
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Kayıtlı ayarları yükle
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (savedSettings) {
      try {
        // eslint-disable-next-line
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.warn('Font settings parse error:', e);
      }
    }
  }, []);

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    
    // CSS değişkenlerini güncelle
    applyFontSettings(newSettings);
    
    // Kayıt göstergesi
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const applyFontSettings = (s) => {
    document.documentElement.style.setProperty('--arabic-font-size', `${s.arabicFontSize}px`);
    document.documentElement.style.setProperty('--turkish-font-size', `${s.turkishFontSize}px`);
    document.documentElement.style.setProperty('--arabic-font-family', `'${s.arabicFontFamily}', 'Noto Naskh Arabic', 'Scheherazade New', 'Noto Sans Arabic', 'Droid Arabic Naskh', 'Geeza Pro', 'Tahoma', 'Arial', serif`);
    document.documentElement.style.setProperty('--quran-line-height', s.lineHeight);
  };

  // Sayfa yüklendiğinde ayarları uygula
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
    <div className="font-settings-container">
      {/* Header */}
      <div className="font-settings-header">
        <IslamicBackButton onClick={onClose} size="medium" />
        <div className="header-content">
          <h1>Yazı Tipi Ayarları</h1>
          <p className="subtitle">Arapça ve Türkçe metin görünümünü özelleştirin</p>
        </div>
        {saved && (
          <div className="save-indicator animate-fadeIn">
            <Check size={16} />
            Kaydedildi
          </div>
        )}
      </div>

      {/* Preview Card */}
      <div className="glass-card preview-card">
        <h3>Önizleme</h3>
        <div 
          className="preview-arabic"
          style={{ 
            fontFamily: `var(--arabic-font-family)`,
            fontSize: `${settings.arabicFontSize}px`,
            lineHeight: settings.lineHeight
          }}
        >
          بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ
        </div>
        <div 
          className="preview-turkish"
          style={{ 
            fontSize: `${settings.turkishFontSize}px`,
            lineHeight: settings.lineHeight 
          }}
        >
          Rahman ve Rahim olan Allah'ın adıyla
        </div>
      </div>

      {/* Arabic Font Size */}
      <div className="glass-card setting-card">
        <div className="setting-header">
          <Type size={20} />
          <div>
            <h4>Arapça Yazı Boyutu</h4>
            <span className="setting-value">{settings.arabicFontSize}px</span>
          </div>
        </div>
        <div className="size-controls">
          <button 
            className="size-btn" 
            onClick={() => adjustSize('arabicFontSize', -1)}
            disabled={settings.arabicFontSize <= 16}
          >
            <Minus size={20} />
          </button>
          <div className="size-slider">
            <input
              type="range"
              min="16"
              max="40"
              step="2"
              value={settings.arabicFontSize}
              onChange={(e) => updateSetting('arabicFontSize', parseInt(e.target.value))}
            />
          </div>
          <button 
            className="size-btn" 
            onClick={() => adjustSize('arabicFontSize', 1)}
            disabled={settings.arabicFontSize >= 40}
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Turkish Font Size */}
      <div className="glass-card setting-card">
        <div className="setting-header">
          <Type size={20} />
          <div>
            <h4>Türkçe Yazı Boyutu</h4>
            <span className="setting-value">{settings.turkishFontSize}px</span>
          </div>
        </div>
        <div className="size-controls">
          <button 
            className="size-btn" 
            onClick={() => adjustSize('turkishFontSize', -1)}
            disabled={settings.turkishFontSize <= 12}
          >
            <Minus size={20} />
          </button>
          <div className="size-slider">
            <input
              type="range"
              min="12"
              max="24"
              step="2"
              value={settings.turkishFontSize}
              onChange={(e) => updateSetting('turkishFontSize', parseInt(e.target.value))}
            />
          </div>
          <button 
            className="size-btn" 
            onClick={() => adjustSize('turkishFontSize', 1)}
            disabled={settings.turkishFontSize >= 24}
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Line Height */}
      <div className="glass-card setting-card">
        <div className="setting-header">
          <span style={{ fontSize: '20px' }}>↕️</span>
          <div>
            <h4>Satır Aralığı</h4>
            <span className="setting-value">{settings.lineHeight.toFixed(1)}</span>
          </div>
        </div>
        <div className="size-controls">
          <button 
            className="size-btn" 
            onClick={() => adjustSize('lineHeight', -1)}
            disabled={settings.lineHeight <= 1.4}
          >
            <Minus size={20} />
          </button>
          <div className="size-slider">
            <input
              type="range"
              min="1.4"
              max="2.5"
              step="0.1"
              value={settings.lineHeight}
              onChange={(e) => updateSetting('lineHeight', parseFloat(e.target.value))}
            />
          </div>
          <button 
            className="size-btn" 
            onClick={() => adjustSize('lineHeight', 1)}
            disabled={settings.lineHeight >= 2.5}
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Arabic Font Family */}
      <div className="glass-card font-family-card">
        <h4>Arapça Yazı Tipi</h4>
        <div className="font-options">
          {ARABIC_FONTS.map((font) => (
            <div
              key={font.id}
              className={`font-option ${settings.arabicFontFamily === font.id ? 'selected' : ''}`}
              onClick={() => updateSetting('arabicFontFamily', font.id)}
            >
              <div 
                className="font-preview"
                style={{ fontFamily: `'${font.id}', serif` }}
              >
                {font.preview}
              </div>
              <div className="font-info">
                <span className="font-name">{font.name}</span>
                <span className="font-desc">{font.description}</span>
              </div>
              {settings.arabicFontFamily === font.id && (
                <div className="selected-indicator">
                  <Check size={18} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <button 
        className="reset-btn"
        onClick={() => {
          setSettings(DEFAULT_SETTINGS);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
          applyFontSettings(DEFAULT_SETTINGS);
          setSaved(true);
          setTimeout(() => setSaved(false), 1500);
        }}
      >
        Varsayılana Sıfırla
      </button>

      <style>{`
        .font-settings-container {
          min-height: 100vh;
          padding: 0 0 100px 0;
          background: var(--bg-primary);
        }

        .font-settings-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 100%);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .header-content h1 {
          font-size: 1.5rem;
          margin: 0;
          color: var(--text-primary);
        }

        .subtitle {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin: 4px 0 0 0;
        }

        .save-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          margin-left: auto;
        }

        .preview-card {
          margin: 16px;
          text-align: center;
        }

        .preview-card h3 {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 16px;
        }

        .preview-arabic {
          color: var(--text-primary);
          margin-bottom: 12px;
          direction: rtl;
        }

        .preview-turkish {
          color: var(--text-secondary);
          font-style: italic;
        }

        .setting-card {
          margin: 0 16px 12px;
          padding: 16px;
        }

        .setting-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .setting-header svg, .setting-header span:first-child {
          color: var(--accent);
        }

        .setting-header h4 {
          margin: 0;
          font-size: 15px;
          color: var(--text-primary);
        }

        .setting-value {
          font-size: 12px;
          color: var(--accent);
          font-weight: 600;
        }

        .size-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .size-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid var(--glass-border);
          background: rgba(255,255,255,0.1);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .size-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .size-btn:not(:disabled):active {
          transform: scale(0.9);
          background: var(--accent);
        }

        .size-slider {
          flex: 1;
        }

        .size-slider input[type="range"] {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: rgba(255,255,255,0.2);
          outline: none;
          -webkit-appearance: none;
        }

        .size-slider input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--accent);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }

        .font-family-card {
          margin: 0 16px 12px;
          padding: 16px;
        }

        .font-family-card h4 {
          margin: 0 0 16px 0;
          font-size: 15px;
          color: var(--text-primary);
        }

        .font-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .font-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .font-option:active {
          transform: scale(0.98);
        }

        .font-option.selected {
          background: rgba(212, 175, 55, 0.15);
          border-color: var(--accent);
        }

        .font-preview {
          font-size: 20px;
          color: var(--text-primary);
          width: 80px;
          text-align: right;
          direction: rtl;
        }

        .font-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .font-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .font-desc {
          font-size: 11px;
          color: var(--text-secondary);
        }

        .selected-indicator {
          color: var(--accent);
        }

        .reset-btn {
          display: block;
          margin: 24px auto;
          padding: 12px 24px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.3);
          color: var(--text-secondary);
          border-radius: 20px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .reset-btn:active {
          transform: scale(0.95);
          background: rgba(255,255,255,0.1);
        }
      `}</style>
    </div>
  );
};

export default FontSettings;

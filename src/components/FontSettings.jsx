import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import PageHeader from './shared/PageHeader';
import {
  ARABIC_FONTS,
  DEFAULT_FONT_SETTINGS,
  FONT_LIMITS,
  loadFontSettings,
  saveFontSettings,
} from '../services/fontSettingsService';
import '../styles/PracticePages.css';

const SizeStepper = ({ label, value, display, limit, onChange }) => (
  <div className="font-setting">
    <div className="font-setting__head">
      <span className="practice-row__title">{label}</span>
      <span className="practice-pill">{display}</span>
    </div>
    <div className="practice-counter">
      <button
        type="button"
        className="practice-counter__button"
        onClick={() => onChange(value - limit.step)}
        disabled={value <= limit.min}
        aria-label={`${label} −`}
      >
        <Minus size={16} aria-hidden="true" />
      </button>
      <input
        type="range"
        className="font-setting__range"
        min={limit.min}
        max={limit.max}
        step={limit.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
      />
      <button
        type="button"
        className="practice-counter__button"
        onClick={() => onChange(value + limit.step)}
        disabled={value >= limit.max}
        aria-label={`${label} +`}
      >
        <Plus size={16} aria-hidden="true" />
      </button>
    </div>
  </div>
);

const FontSettings = ({ onClose }) => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(loadFontSettings);

  // Saved and applied on every change, so the Quran reader shows it right away and after a restart.
  const update = (key, value) => setSettings((current) => saveFontSettings({ ...current, [key]: value }));

  return (
    <div className="practice-page">
      <PageHeader title={t('fontSettings.title', 'Yazı Ayarları')} subtitle={t('fontSettings.subtitle', 'Metin görünümünü kişiselleştir')} onBack={onClose} />

      <section className="practice-summary font-preview" aria-label={t('fontSettings.preview', 'Önizleme')}>
        <p className="font-preview__arabic" lang="ar" dir="rtl">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ</p>
        <p className="font-preview__meaning">{t('fontSettings.previewMeaning', "Rahman ve Rahim olan Allah'ın adıyla")}</p>
      </section>
      <p className="practice-lead">{t('fontSettings.appliesTo', "Boyut ve satır aralığı Kur'an okuyucuda, Arapça yazı tipi tüm Arapça metinlerde kullanılır.")}</p>

      <section className="practice-section">
        <h2 className="practice-section-title">{t('fontSettings.arabicFamily', 'Arapça Yazı Tipi')}</h2>
        <div className="font-family-grid" role="radiogroup" aria-label={t('fontSettings.arabicFamily', 'Arapça Yazı Tipi')}>
          {ARABIC_FONTS.map((font) => {
            const active = settings.arabicFontFamily === font.id;
            return (
              <button
                key={font.id}
                type="button"
                role="radio"
                aria-checked={active}
                className={`practice-row font-family ${active ? 'practice-row--done' : ''}`}
                onClick={() => update('arabicFontFamily', font.id)}
              >
                <span className="font-family__sample" lang="ar" style={{ fontFamily: `'${font.id}', serif` }}>بِسْمِ اللهِ</span>
                <span className="practice-row__text">{font.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="practice-section practice-panel font-settings-sizes">
        <SizeStepper
          label={t('fontSettings.arabicSize', 'Arapça Boyutu')}
          value={settings.arabicFontSize}
          display={`${settings.arabicFontSize}px`}
          limit={FONT_LIMITS.arabicFontSize}
          onChange={(v) => update('arabicFontSize', v)}
        />
        <SizeStepper
          label={t('fontSettings.turkishSize', 'Meal boyutu')}
          value={settings.turkishFontSize}
          display={`${settings.turkishFontSize}px`}
          limit={FONT_LIMITS.turkishFontSize}
          onChange={(v) => update('turkishFontSize', v)}
        />
        <SizeStepper
          label={t('fontSettings.lineHeight', 'Satır Aralığı')}
          value={settings.lineHeight}
          display={settings.lineHeight.toFixed(1)}
          limit={FONT_LIMITS.lineHeight}
          onChange={(v) => update('lineHeight', v)}
        />
      </section>

      <div className="practice-actions">
        <button type="button" className="practice-secondary-button practice-wide" onClick={() => setSettings(saveFontSettings(DEFAULT_FONT_SETTINGS))}>
          <RotateCcw size={16} aria-hidden="true" />
          {t('fontSettings.reset', 'Varsayılana Sıfırla')}
        </button>
      </div>
    </div>
  );
};

export default FontSettings;

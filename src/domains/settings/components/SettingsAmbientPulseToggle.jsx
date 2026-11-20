import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';
import { isAmbientPulseEnabled, setAmbientPulseEnabled } from '../../../services/ambientPrayerPulseService';

/**
 * Settings toggle row for the Ambient Prayer Pulse feature.
 * Drop into any Settings section.
 */
const SettingsAmbientPulseToggle = () => {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState(() => isAmbientPulseEnabled());

  const handleToggle = () => {
    const next = !enabled;
    setEnabled(next);
    setAmbientPulseEnabled(next);
  };

  return (
    <div
      className="settings-card"
      style={{
        padding: '16px 20px',
        gap: '14px',
        cursor: 'pointer'
      }}
      onClick={handleToggle}
      role="switch"
      aria-checked={enabled}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleToggle();
        }
      }}
    >
      <div
        className="settings-icon-box"
        style={{
          background: enabled ? 'color-mix(in srgb, var(--danger) 15%, transparent)' : 'var(--paper-sunken)',
          color: enabled ? 'var(--danger)' : 'var(--ink-muted)'
        }}
      >
        <Heart size={20} fill={enabled ? 'var(--danger)' : 'none'} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--ink)' }}>
          {t('settings.ambientPulseTitle', 'Manevi Kalp Atışı')}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', fontWeight: '600', marginTop: '2px' }}>
          {t('settings.ambientPulseDesc', 'Namaz vaktinden önce yumuşak titreşim hisset')}
        </div>
      </div>
      <div
        style={{
          width: '44px',
          height: '24px',
          borderRadius: '12px',
          background: enabled ? 'var(--brand-ink)' : 'var(--paper-sunken)',
          border: `1px solid ${enabled ? 'var(--brand-ink)' : 'var(--line)'}`,
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          flexShrink: 0
        }}
      >
        <div
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: enabled ? 'var(--on-primary)' : 'var(--ink-muted)',
            position: 'absolute',
            top: '2px',
            left: enabled ? '22px' : '2px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: enabled ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
          }}
        />
      </div>
    </div>
  );
};

export default SettingsAmbientPulseToggle;

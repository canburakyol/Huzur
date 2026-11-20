import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function LocationConsentPrompt({ onDecision }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const decide = async (accepted) => {
    if (loading) return;
    setLoading(true);
    try {
      await onDecision(accepted);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-consent-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10002,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'max(14px, env(safe-area-inset-top, 0px)) max(14px, env(safe-area-inset-right, 0px)) max(14px, env(safe-area-inset-bottom, 0px)) max(14px, env(safe-area-inset-left, 0px))',
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--paper) 96%, var(--brand-ink) 4%), var(--paper))',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 380,
          boxSizing: 'border-box',
          padding: 18,
          borderRadius: 18,
          background: 'var(--paper-raised)',
          border: '1px solid var(--line)',
          boxShadow: 'var(--elevation-medium)',
          color: 'var(--ink)',
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 14,
            borderRadius: 14,
            background: 'var(--brand-soft)',
            color: 'var(--on-primary-container)',
          }}
        >
          <MapPin size={22} />
        </div>

        <h2 id="location-consent-title" style={{ margin: '0 0 8px', fontSize: 20, color: 'var(--brand-ink)' }}>
          {t('locationConsent.title', 'Konumunu kullanabilir miyiz?')}
        </h2>
        <p style={{ margin: '0 0 16px', lineHeight: 1.5, fontSize: 14, color: 'var(--ink-muted)' }}>
          {t(
            'locationConsent.description',
            'Bulunduğun şehre göre doğru namaz vakitlerini ve hava durumunu göstermek için konum izni gerekir. İzin vermezsen İstanbul varsayılan olarak kullanılır.'
          )}
        </p>

        <div style={{ display: 'grid', gap: 10 }}>
          <button
            type="button"
            disabled={loading}
            onClick={() => void decide(true)}
            style={{
              minHeight: 44,
              border: 'none',
              borderRadius: 12,
              background: 'var(--brand-ink)',
              color: 'var(--on-primary)',
              fontWeight: 800,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? t('common.loading', 'Yükleniyor...') : t('locationConsent.allow', 'Konumumu kullan')}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => void decide(false)}
            style={{
              minHeight: 42,
              borderRadius: 12,
              border: '1px solid var(--line)',
              background: 'var(--paper)',
              color: 'var(--ink)',
              fontWeight: 700,
            }}
          >
            {t('locationConsent.decline', 'İstanbul ile devam et')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LocationConsentPrompt;

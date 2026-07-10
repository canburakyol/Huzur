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
        padding: 'max(16px, env(safe-area-inset-top, 0px)) max(16px, env(safe-area-inset-right, 0px)) max(16px, env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px))',
        background: 'color-mix(in srgb, var(--surface-page) 88%, transparent)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          boxSizing: 'border-box',
          padding: 24,
          borderRadius: 22,
          background: 'var(--surface-container-lowest)',
          border: '1px solid var(--outline-variant)',
          boxShadow: 'var(--shadow-card)',
          color: 'var(--on-surface)',
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 18,
            borderRadius: 16,
            background: 'var(--primary-container)',
            color: 'var(--on-primary-container)',
          }}
        >
          <MapPin size={26} />
        </div>

        <h2 id="location-consent-title" style={{ margin: '0 0 10px', fontSize: 23, color: 'var(--primary)' }}>
          {t('locationConsent.title', 'Konumunu kullanabilir miyiz?')}
        </h2>
        <p style={{ margin: '0 0 20px', lineHeight: 1.6, color: 'var(--on-surface-variant)' }}>
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
              minHeight: 48,
              border: 'none',
              borderRadius: 14,
              background: 'var(--primary)',
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
              minHeight: 44,
              borderRadius: 14,
              border: '1px solid var(--outline-variant)',
              background: 'transparent',
              color: 'var(--on-surface-variant)',
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

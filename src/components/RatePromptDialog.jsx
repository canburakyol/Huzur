import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMobileFeatures } from '../hooks/useMobileFeatures';
import { rateService } from '../services/rateService';
import { ANALYTICS_EVENTS, logEvent } from '../services/analyticsService';

function RatePromptDialog() {
  const { t } = useTranslation();
  const { triggerRatePrompt } = useMobileFeatures();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const shouldShow = await triggerRatePrompt(false);
      if (!cancelled && shouldShow) {
        setVisible(true);
        logEvent(ANALYTICS_EVENTS.RATE_PROMPT_SHOWN, { surface: 'auto' });
      }
    }, 4000);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [triggerRatePrompt]);

  if (!visible) return null;

  const handleRate = async () => {
    logEvent(ANALYTICS_EVENTS.RATE_PROMPT_ACCEPTED, { surface: 'auto' });
    setVisible(false);
    await rateService.openStore();
  };

  const handleLater = async () => {
    logEvent(ANALYTICS_EVENTS.RATE_PROMPT_DEFERRED, { surface: 'auto' });
    setVisible(false);
    await rateService.deferPrompt();
  };

  const handleNever = async () => {
    logEvent(ANALYTICS_EVENTS.RATE_PROMPT_DECLINED, { surface: 'auto' });
    setVisible(false);
    await rateService.declinePrompt();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('rate.title', 'Huzur’u seviyor musunuz?')}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.45)',
        padding: '16px',
      }}
      onClick={handleLater}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'var(--surface-container-lowest, #fff)',
          borderRadius: '20px',
          padding: '22px',
          border: '1px solid var(--outline-variant, #e5e7eb)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
        }}
      >
        <h2 style={{ margin: '0 0 8px', fontSize: '18px', color: 'var(--text-primary)' }}>
          {t('rate.title', 'Huzur’u seviyor musunuz?')}
        </h2>
        <p style={{ margin: '0 0 18px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {t('rate.subtitle', 'Bir dakikanızı ayırıp Play Store’da puan verirseniz çok seviniriz. Desteğinizle daha da gelişeceğiz.')}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={handleRate}
            style={{
              padding: '13px',
              borderRadius: '14px',
              border: 'none',
              background: 'var(--primary)',
              color: 'var(--on-primary, #fff)',
              fontWeight: 800,
              fontSize: '15px',
              cursor: 'pointer',
            }}
          >
            {t('rate.cta', 'Puan Ver')}
          </button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleLater}
              style={{
                flex: 1,
                padding: '11px',
                borderRadius: '12px',
                border: '1px solid var(--outline-variant, #e5e7eb)',
                background: 'transparent',
                color: 'var(--text-primary)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {t('rate.later', 'Sonra')}
            </button>
            <button
              onClick={handleNever}
              style={{
                flex: 1,
                padding: '11px',
                borderRadius: '12px',
                border: '1px solid transparent',
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {t('rate.never', 'Gösterme')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RatePromptDialog;

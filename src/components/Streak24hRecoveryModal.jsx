import React, { useMemo, useState } from 'react';
import { AlertTriangle, RotateCcw, X, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Streak24hRecoveryModal = ({
  isOpen,
  categoryName,
  deadline,
  onConfirm,
  onClose,
  onWatchRewardedRecovery,
  requiresRewardedAd = false
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rewardError, setRewardError] = useState('');

  if (!isOpen) return null;

  const resolvedCategory = categoryName || t('streak24h.defaultCategory', 'Namaz');
  const primaryLabel = useMemo(() => (
    requiresRewardedAd
      ? t('streak24h.rewardedAction', 'Reklam Izle ve Telafi Et')
      : t('streak24h.recoverAction', 'Telafi Et')
  ), [requiresRewardedAd, t]);

  const handlePrimaryAction = async () => {
    if (isSubmitting) {
      return;
    }

    setRewardError('');
    setIsSubmitting(true);

    try {
      if (requiresRewardedAd && typeof onWatchRewardedRecovery === 'function') {
        const result = await onWatchRewardedRecovery();
        if (!result?.success) {
          setRewardError(
            result?.error || t('streak24h.rewardedError', 'Odullu reklam su an acilamadi. Lutfen tekrar dene.')
          );
        }
        return;
      }

      await Promise.resolve(onConfirm?.());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="streak-recovery-overlay">
      <div className="settings-card reveal-stagger" style={{
        flexDirection: 'column',
        padding: '32px',
        maxWidth: '420px',
        width: '90%',
        position: 'relative',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(212, 175, 55, 0.1)'
      }}>
        <button
          onClick={onClose}
          disabled={isSubmitting}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'var(--nav-hover)',
            border: 'none',
            color: 'var(--nav-text-muted)',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}
        >
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <div className="settings-icon-box" style={{
            width: '70px',
            height: '70px',
            background: 'rgba(212, 175, 55, 0.15)',
            color: '#d4af37',
            borderRadius: '20px',
            margin: '0 auto 24px'
          }}>
            <AlertTriangle size={32} />
          </div>

          <h2 style={{
            margin: '0 0 12px 0',
            fontSize: '1.5rem',
            fontWeight: '950',
            color: 'var(--nav-text)',
            letterSpacing: '-0.5px'
          }}>
            {t('streak24h.title', '24 Saat Telafi')}
          </h2>

          <p style={{
            margin: '0 0 20px 0',
            fontSize: '0.9rem',
            color: 'var(--nav-text-muted)',
            fontWeight: '600',
            lineHeight: '1.6'
          }}>
            {t('streak24h.description', {
              category: resolvedCategory,
              defaultValue: '{{category}} serin bir gun kacirilmis gorunuyor. 24 saatlik pencerede telafi ederek serini koruyabilirsin.'
            })}
          </p>

          {requiresRewardedAd && (
            <p style={{
              margin: '0 0 20px 0',
              fontSize: '0.82rem',
              color: 'var(--nav-accent)',
              fontWeight: '700',
              lineHeight: '1.5'
            }}>
              {t(
                'streak24h.rewardedHint',
                'Bu telafi hakki reklam tamamlandiginda aktif olur.'
              )}
            </p>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            background: 'var(--nav-hover)',
            borderRadius: '12px',
            marginBottom: '32px',
            border: '1px solid var(--nav-border)'
          }}>
            <Clock size={16} color="var(--nav-accent)" />
            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--nav-text)' }}>
              {t('streak24h.deadline', {
                value: deadline ? new Date(deadline).toLocaleTimeString() : '-',
                defaultValue: 'Son telafi zamani: {{value}}'
              })}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handlePrimaryAction}
              className="velocity-btn-primary"
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: '16px',
                background: '#d4af37',
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'wait' : 'pointer'
              }}
            >
              <RotateCcw size={18} style={{ marginRight: '8px' }} />
              {isSubmitting
                ? t('streak24h.loadingAction', 'Hazirlaniyor...')
                : primaryLabel}
            </button>

            <button
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                flex: 1,
                border: '1px solid var(--nav-border)',
                background: 'transparent',
                color: 'var(--nav-text-muted)',
                borderRadius: '16px',
                padding: '16px',
                fontWeight: '800',
                fontSize: '0.9rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {t('streak24h.laterAction', 'Daha Sonra')}
            </button>
          </div>

          {!!rewardError && (
            <div style={{
              marginTop: '14px',
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'rgba(185, 28, 28, 0.14)',
              border: '1px solid rgba(248, 113, 113, 0.24)',
              color: '#fecaca',
              fontSize: '0.82rem',
              fontWeight: '700'
            }}>
              {rewardError}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .streak-recovery-overlay {
            position: fixed;
            inset: 0;
            z-index: 10002;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .velocity-btn-primary {
            background: var(--nav-accent);
            color: white;
            border: none;
            border-radius: 16px;
            font-size: 0.95rem;
            font-weight: 950;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        .velocity-btn-primary:active { transform: scale(0.97); }
      `}</style>
    </div>
  );
};

export default Streak24hRecoveryModal;

import React from 'react';
import { AlertTriangle, RotateCcw, X, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Streak24hRecoveryModal = ({
  isOpen,
  categoryName,
  deadline,
  onConfirm,
  onClose
}) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const resolvedCategory = categoryName || t('streak24h.defaultCategory', 'Namaz');

  return (
    <div className="streak-recovery-overlay">
      <div className="settings-card reveal-stagger" style={{ 
          flexDirection: 'column', padding: '32px', maxWidth: '420px', width: '90%',
          position: 'relative', border: '1px solid rgba(212, 175, 55, 0.3)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(212, 175, 55, 0.1)'
      }}>
        <button 
            onClick={onClose}
            style={{ 
                position: 'absolute', top: '16px', right: '16px', 
                background: 'var(--nav-hover)', border: 'none', color: 'var(--nav-text-muted)',
                width: '32px', height: '32px', borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}
        >
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <div className="settings-icon-box" style={{ 
              width: '70px', height: '70px', background: 'rgba(212, 175, 55, 0.15)', 
              color: '#d4af37', borderRadius: '20px', margin: '0 auto 24px' 
          }}>
            <AlertTriangle size={32} />
          </div>

          <h2 style={{ 
              margin: '0 0 12px 0', fontSize: '1.5rem', fontWeight: '950', 
              color: 'var(--nav-text)', letterSpacing: '-0.5px' 
          }}>
            {t('streak24h.title', '24 Saat Telafi')}
          </h2>
          
          <p style={{ 
              margin: '0 0 20px 0', fontSize: '0.9rem', color: 'var(--nav-text-muted)', 
              fontWeight: '600', lineHeight: '1.6' 
          }}>
            {t('streak24h.description', {
              category: resolvedCategory,
              defaultValue: '{{category}} serin bir gün kaçırılmış görünüyor. 24 saatlik pencerede telafi ederek serini koruyabilirsin.'
            })}
          </p>

          <div style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '12px', background: 'var(--nav-hover)', borderRadius: '12px',
              marginBottom: '32px', border: '1px solid var(--nav-border)'
          }}>
            <Clock size={16} color="var(--nav-accent)" />
            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--nav-text)' }}>
              {t('streak24h.deadline', {
                value: deadline ? new Date(deadline).toLocaleTimeString() : '-',
                defaultValue: 'Son telafi zamanı: {{value}}'
              })}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onConfirm}
              className="velocity-btn-primary"
              style={{ flex: 1, padding: '16px', background: '#d4af37' }}
            >
              <RotateCcw size={18} style={{ marginRight: '8px' }} />
              {t('streak24h.recoverAction', 'Telafi Et')}
            </button>

            <button
              onClick={onClose}
              style={{
                flex: 1,
                border: '1px solid var(--nav-border)',
                background: 'transparent',
                color: 'var(--nav-text-muted)',
                borderRadius: '16px',
                padding: '16px',
                fontWeight: '800',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              {t('streak24h.laterAction', 'Daha Sonra')}
            </button>
          </div>
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
            cursor: pointer;
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

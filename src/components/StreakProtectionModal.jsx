import React from 'react';
import { Flame, Snowflake, ShieldCheck, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const StreakProtectionModal = ({ isOpen, onClose, onUseToken, categoryData, categoryName }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const { count, freezeTokens } = categoryData || { count: 0, freezeTokens: 0 };
  const resolvedCategory = categoryName || t('streakProtection.defaultCategory', 'Genel');

  return (
    <div className="streak-protection-overlay">
      <div className="settings-card reveal-stagger" style={{ 
          flexDirection: 'column', padding: '32px', maxWidth: '400px', width: '90%',
          position: 'relative', border: '1px solid rgba(245, 158, 11, 0.3)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(245, 158, 11, 0.1)'
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
          <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 24px' }}>
            <div className="pulse-aura" style={{ background: 'rgba(245, 158, 11, 0.2)' }}></div>
            <div className="settings-icon-box" style={{ 
                width: '80px', height: '80px', background: 'rgba(245, 158, 11, 0.15)', 
                color: '#f59e0b', borderRadius: '24px' 
            }}>
              <Flame size={40} />
            </div>
            <div style={{ 
                position: 'absolute', bottom: '-4px', right: '-4px',
                width: '32px', height: '32px', background: 'var(--nav-bg)',
                borderRadius: '10px', border: '2px solid var(--nav-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#3b82f6'
            }}>
              <Snowflake size={18} />
            </div>
          </div>

          <h2 style={{ 
              margin: '0 0 12px 0', fontSize: '1.5rem', fontWeight: '950', 
              color: 'var(--nav-text)', letterSpacing: '-0.5px' 
          }}>
            {t('streakProtection.title', 'Seriniz Tehlikede!')}
          </h2>
          
          <p style={{ 
              margin: '0 0 24px 0', fontSize: '0.9rem', color: 'var(--nav-text-muted)', 
              fontWeight: '600', lineHeight: '1.5' 
          }}>
            {t('streakProtection.description', {
              count,
              category: resolvedCategory,
              defaultValue: 'Dün uygulamayı kullanamadığınız için {{count}} günlük {{category}} seriniz sıfırlanmak üzere.'
            })}
          </p>

          <div className="settings-card" style={{ 
              padding: '16px', background: 'rgba(16, 185, 129, 0.05)', 
              border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '32px',
              gap: '16px'
          }}>
            <div className="settings-icon-box" style={{ 
                width: '40px', height: '40px', background: 'rgba(16, 185, 129, 0.1)', 
                color: '#10b981' 
            }}>
              <ShieldCheck size={20} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '800', color: 'var(--nav-text)' }}>
                {t('streakProtection.useTokenLabel', 'Dondurma Hakkı Kullan')}
              </p>
              <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '600', color: '#10b981' }}>
                {t('streakProtection.tokensAvailable', { count: freezeTokens, defaultValue: '{{count}} adet mevcut' })}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              onClick={onUseToken}
              disabled={freezeTokens === 0}
              className="velocity-btn-primary"
              style={{ padding: '16px' }}
            >
              <ShieldCheck size={18} style={{ marginRight: '8px' }} />
              {t('streakProtection.applyAndProtect', 'Uygula ve Seriyi Koru')}
            </button>
            
            <button 
              onClick={onClose}
              style={{ 
                  background: 'transparent', border: '1px solid var(--nav-border)', 
                  color: 'var(--nav-text-muted)', padding: '14px', borderRadius: '16px',
                  fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer'
              }}
            >
              {t('streakProtection.cancelAndReset', 'Vazgeç (Seri Sıfırlanır)')}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .streak-protection-overlay {
            position: fixed;
            inset: 0;
            z-index: 10000;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            animation: fadeIn 0.3s ease;
        }

        .pulse-aura {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
            height: 100%;
            border-radius: 24px;
            animation: pulse-aura 2s infinite;
            z-index: -1;
        }

        @keyframes pulse-aura {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
            100% { transform: translate(-50%, -50%) scale(1.4); opacity: 0; }
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
            font-weight: 900;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 16px rgba(79, 70, 229, 0.2);
        }

        .velocity-btn-primary:active { transform: scale(0.97); }
        .velocity-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
};

export default StreakProtectionModal;

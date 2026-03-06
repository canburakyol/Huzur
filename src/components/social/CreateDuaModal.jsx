import { useMemo, useState } from 'react';
import { Send, Heart, X, Sparkles, AlertCircle, ShieldOff, ShieldCheck } from 'lucide-react';
import { checkRateLimit } from '../../utils/rateLimiter';
import { useDua } from '../../hooks/useDua';
import { useTranslation } from 'react-i18next';

const CreateDuaModal = ({ onClose }) => {
  const { t } = useTranslation();
  const { createDua, error } = useDua();
  const [text, setText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const isAuthBlocked = useMemo(() => Boolean(error), [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (!checkRateLimit('dua_submit', 5, 3600000)) {
      alert(t('dua.create.rateLimit', 'Çok fazla dua isteği gönderdiniz. Lütfen daha sonra tekrar deneyin.'));
      return;
    }

    if (isAuthBlocked) {
      alert(t('dua.create.authError', 'Firebase kimlik doğrulaması hazır değil. Lütfen internetinizi kontrol edip tekrar deneyin.'));
      return;
    }

    setLoading(true);
    try {
      await createDua(text, isAnonymous, null); 
      onClose();
    } catch (err) {
      console.error(err);
      alert(t('dua.create.error', 'Dua isteği oluşturulamadı'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="velocity-modal-overlay">
      <div className="settings-card reveal-stagger" style={{ 
          flexDirection: 'column', padding: '32px', maxWidth: '420px', width: '90%',
          position: 'relative', border: '1px solid var(--nav-accent)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(79, 70, 229, 0.1)'
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

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="settings-icon-box" style={{ 
              width: '64px', height: '64px', background: 'rgba(79, 70, 229, 0.15)', 
              color: 'var(--nav-accent)', borderRadius: '20px', margin: '0 auto 16px' 
          }}>
            <Heart size={28} />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '950', color: 'var(--nav-text)', letterSpacing: '-0.5px' }}>
             {t('dua.create.title', 'Dua İsteği Paylaş')}
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--nav-text-muted)', fontWeight: '600' }}>
            {t('dua.create.subtitle', 'Halkadan dua isteğinde bulun')}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--nav-text)', marginBottom: '8px', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t('dua.create.intentLabel', 'Niyetiniz')}
            </label>
            <textarea 
              placeholder={t('dua.create.intentPlaceholder', 'Allah rızası için...')} 
              value={text}
              onChange={e => setText(e.target.value)}
              required
              rows={4}
              className="velocity-input"
              style={{ resize: 'none' }}
            />
          </div>

          <div 
            onClick={() => setIsAnonymous(!isAnonymous)}
            style={{ 
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', 
                background: isAnonymous ? 'rgba(79, 70, 229, 0.1)' : 'var(--nav-hover)', 
                borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s',
                border: isAnonymous ? '1px solid var(--nav-accent)' : '1px solid var(--nav-border)'
            }}
          >
            <div style={{ color: isAnonymous ? 'var(--nav-accent)' : 'var(--nav-text-muted)' }}>
                {isAnonymous ? <ShieldCheck size={20} /> : <ShieldOff size={20} />}
            </div>
            <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '800', color: 'var(--nav-text)' }}>
                    {t('dua.create.anonymousLabel', 'İsimsiz Paylaş')}
                </p>
                <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: '600', color: 'var(--nav-text-muted)' }}>
                    {isAnonymous ? t('dua.create.anonymousActive', 'Kimliğiniz gizlenecektir') : t('dua.create.anonymousInactive', 'Adınız görünecektir')}
                </p>
            </div>
            <input 
              type="checkbox" 
              checked={isAnonymous}
              onChange={() => {}} // Controlled via parent div click
              style={{ width: '18px', height: '18px', accentColor: 'var(--nav-accent)', opacity: 0 }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{ 
                  flex: 1, background: 'transparent', border: '1px solid var(--nav-border)', 
                  color: 'var(--nav-text-muted)', padding: '14px', borderRadius: '14px',
                  fontSize: '0.9rem', fontWeight: '800', cursor: 'pointer' 
              }}
            >
              {t('common.cancel', 'İptal')}
            </button>
            <button 
              type="submit" 
              className="velocity-btn-primary"
              disabled={loading || isAuthBlocked}
              style={{ flex: 1.5, padding: '14px' }}
            >
              {loading ? (
                <div className="loading-spinner-small" />
              ) : (
                <>
                  <Send size={18} style={{ marginRight: '8px' }} />
                  {t('dua.create.submit', 'Paylaş')}
                </>
              )}
            </button>
          </div>

          {isAuthBlocked && (
            <div style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', 
                padding: '10px', background: 'rgba(239, 68, 68, 0.1)', 
                borderRadius: '10px', color: '#ef4444' 
            }}>
              <AlertCircle size={14} />
              <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>{error}</span>
            </div>
          )}
        </form>
      </div>

      <style>{`
        /* Reuse styles from CreateHatimModal if possible, but keep self-contained for now */
        .velocity-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(8px);
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            animation: fadeIn 0.3s ease;
        }

        .velocity-input {
            width: 100%;
            padding: 14px 16px;
            background: var(--nav-hover);
            border: 1px solid var(--nav-border);
            border-radius: 12px;
            color: var(--nav-text);
            font-size: 0.9rem;
            font-weight: 600;
            outline: none;
            transition: all 0.3s;
        }

        .velocity-input:focus {
            border-color: var(--nav-accent);
            background: var(--nav-bg);
            box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
        }

        .velocity-btn-primary {
            background: var(--nav-accent);
            color: white;
            border: none;
            border-radius: 14px;
            font-size: 0.95rem;
            font-weight: 900;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 8px 16px rgba(79, 70, 229, 0.2);
        }

        .velocity-btn-primary:active { transform: scale(0.97); }
        .velocity-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .loading-spinner-small {
            width: 18px;
            height: 18px;
            border: 2px solid rgba(255,255,255,0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default CreateDuaModal;

import { useMemo, useState } from 'react';
import { Sparkles, BookOpen, X, Send, AlertCircle, Info } from 'lucide-react';
import { checkRateLimit } from '../../../utils/rateLimiter';
import { useGroupHatim } from '../../../hooks/useGroupHatim';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../../hooks/useToast';
import { logger } from '../../../utils/logger';

const CreateHatimModal = ({ onClose, onSuccess }) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { createHatim, error } = useGroupHatim();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const isAuthBlocked = useMemo(() => Boolean(error), [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (!checkRateLimit('hatim_create', 3, 3600000)) {
      showToast(t('hatim.createForm.rateLimit', 'Çok fazla hatim oluşturdunuz. Lütfen daha sonra tekrar deneyin.'), 'error');
      return;
    }

    if (isAuthBlocked) {
      showToast(t('hatim.createForm.authError', 'Firebase kimlik doğrulaması hazır değil. Lütfen internetinizi kontrol edip tekrar deneyin.'), 'error');
      return;
    }

    setLoading(true);
    try {
      const createdHatim = await createHatim(name, desc, 30);
      onSuccess(createdHatim);
    } catch (err) {
      logger.error(err);
      showToast(t('hatim.createForm.error', 'Hatim oluşturulamadı'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="velocity-modal-overlay">
      <div className="settings-card reveal-stagger" style={{ 
          flexDirection: 'column', padding: '32px', maxWidth: '420px', width: '90%',
          position: 'relative', border: '1px solid var(--brand-ink)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 20px color-mix(in srgb, var(--brand-ink) 10%, transparent)'
      }}>
        <button 
            onClick={onClose}
            style={{ 
                position: 'absolute', top: '16px', right: '16px', 
                background: 'var(--paper-sunken)', border: 'none', color: 'var(--ink-muted)',
                width: '32px', height: '32px', borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}
        >
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="settings-icon-box" style={{ 
              width: '64px', height: '64px', background: 'color-mix(in srgb, var(--brand-ink) 15%, transparent)', 
              color: 'var(--brand-ink)', borderRadius: '20px', margin: '0 auto 16px' 
          }}>
            <BookOpen size={28} />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '950', color: 'var(--ink)', letterSpacing: '-0.5px' }}>
             {t('hatim.createForm.title', 'Yeni Hatim Başlat')}
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--ink-muted)', fontWeight: '600' }}>
            {t('hatim.createForm.subtitle', 'Hatim grubuna liderlik et')}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--ink)', marginBottom: '8px', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t('hatim.createForm.nameLabel', 'Hatim Adı')}
            </label>
            <input 
              type="text"
              placeholder={t('hatim.createForm.namePlaceholder', 'Örn: Ailemiz için Hatim')} 
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="velocity-input"
            />
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--ink)', marginBottom: '8px', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t('hatim.createForm.descLabel', 'Açıklama (İsteğe Bağlı)')}
            </label>
            <textarea 
              placeholder={t('hatim.createForm.descPlaceholder', 'Niyetiniz nedir...')} 
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={3}
              className="velocity-input"
              style={{ resize: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', padding: '12px', background: 'color-mix(in srgb, var(--brand-ink) 5%, transparent)', borderRadius: '12px', border: '1px dashed var(--brand-ink)' }}>
            <Info size={16} color="var(--brand-ink)" style={{ flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--ink-muted)', fontWeight: '600', lineHeight: '1.4' }}>
              {t('hatim.createForm.info', 'Hatim 30 cüzden oluşur ve tamamlandığında üyeler ödül kazanır.')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{ 
                  flex: 1, background: 'transparent', border: '1px solid var(--line)', 
                  color: 'var(--ink-muted)', padding: '14px', borderRadius: '14px',
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
                  <Sparkles size={18} style={{ marginRight: '8px' }} />
                  {t('hatim.createForm.submit', 'Oluştur')}
                </>
              )}
            </button>
          </div>

          {isAuthBlocked && (
            <div style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', 
                padding: '10px', background: 'color-mix(in srgb, var(--danger) 10%, transparent)', 
                borderRadius: '10px', color: 'var(--danger)' 
            }}>
              <AlertCircle size={14} />
              <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>{error}</span>
            </div>
          )}
        </form>
      </div>

      <style>{`
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
            background: var(--paper-sunken);
            border: 1px solid var(--line);
            border-radius: 12px;
            color: var(--ink);
            font-size: 0.9rem;
            font-weight: 600;
            outline: none;
            transition: all 0.3s;
        }

        .velocity-input:focus {
            border-color: var(--brand-ink);
            background: var(--paper);
            box-shadow: 0 0 0 4px color-mix(in srgb, var(--brand-ink) 10%, transparent);
        }

        .velocity-btn-primary {
            background: var(--brand-ink);
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
            box-shadow: 0 8px 16px color-mix(in srgb, var(--brand-ink) 20%, transparent);
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

export default CreateHatimModal;

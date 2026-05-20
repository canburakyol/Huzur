import { Crown, X, Calendar, Zap, Sparkles, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Günlük limit aşımı modalı
 * Ücretsiz kullanıcılar limite ulaştığında gösterilir
 */
const LimitReachedModal = ({ 
  isOpen, 
  onClose, 
  feature = 'nuzul_ai',
  maxCount = 2,
  onUpgrade 
}) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const featureNames = {
    nuzul_ai: t('limitModal.features.nuzul_ai', 'Esbab-ı Nüzul Sorgusu'),
    tajweed_ai: t('limitModal.features.tajweed_ai', 'Tecvid Kontrolü'),
    word_by_word: t('limitModal.features.word_by_word', 'Kelime Meali'),
    memorize: t('limitModal.features.memorize', 'Ezber Asistanı')
  };

  const featureIcons = {
    nuzul_ai: '📖',
    tajweed_ai: '🎤',
    word_by_word: '📝',
    memorize: '🧠'
  };

  return (
    <div className="limit-modal-overlay" onClick={onClose}>
      <div 
        className="settings-card limit-modal-content reveal-stagger" 
        onClick={e => e.stopPropagation()}
        style={{ flexDirection: 'column', padding: '32px', maxWidth: '400px', width: '90%', position: 'relative' }}
      >
        {/* Close Button */}
        <button 
          className="limit-modal-close" 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'var(--nav-hover)',
            border: '1px solid var(--nav-border)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--nav-text-muted)',
            zIndex: 10
          }}
        >
          <X size={18} />
        </button>

        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="crown-glow">
            <Crown size={48} color="#fbbf24" fill="#fbbf24" />
          </div>
          <h2 style={{ margin: '16px 0 8px 0', fontSize: '1.5rem', color: 'var(--nav-text)', fontWeight: '950', letterSpacing: '-0.5px' }}>
            {t('limitModal.title', 'Günlük Limit Doldu')}
          </h2>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--nav-text-muted)', fontWeight: '600' }}>
            {t('limitModal.usagePrefix', 'Bugünkü')} <strong>{maxCount}</strong> {t('limitModal.usageSuffix', 'ücretsiz kullanım hakkınızı bitirdiniz.')}
          </p>
        </div>

        {/* Feature Tag */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: 'var(--nav-hover)',
          borderRadius: '12px',
          marginBottom: '24px',
          alignSelf: 'center'
        }}>
          <span style={{ fontSize: '1.2rem' }}>{featureIcons[feature]}</span>
          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--nav-text)' }}>{featureNames[feature]}</span>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          <div className="limit-option-card">
            <div className="option-icon-box" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--nav-accent)' }}>
              <Calendar size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--nav-text)', fontWeight: '700' }}>
                {t('limitModal.tomorrowOption', 'Yarın 2 yeni kullanım hakkınız olacak')}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--nav-border-muted)' }}></div>
            <span style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--nav-text-muted)', textTransform: 'uppercase' }}>{t('limitModal.or', 'veya')}</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--nav-border-muted)' }}></div>
          </div>

          <div className="limit-option-card pro-card">
            <div className="option-icon-box" style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24' }}>
              <Zap size={18} fill="#fbbf24" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--nav-text)', fontWeight: '700' }}>
                {t('limitModal.proOptionPrefix', 'Pro\'ya geçin ve')} <span style={{ color: '#fbbf24' }}>{t('limitModal.unlimited', 'sınırsız')}</span> {t('limitModal.proOptionSuffix', 'kullanın!')}
              </p>
            </div>
          </div>
        </div>

        {/* Benefits List */}
        <div style={{ 
          background: 'var(--nav-hover)', 
          borderRadius: '20px', 
          padding: '20px', 
          marginBottom: '32px',
          border: '1px solid var(--nav-border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Sparkles size={16} color="#fbbf24" />
            <span style={{ fontSize: '0.75rem', fontWeight: '950', color: 'var(--nav-text)', textTransform: 'uppercase' }}>{t('limitModal.proBenefits', 'PRO AVANTAJLARI')}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="benefit-item">
              <CheckCircle2 size={14} color="#10b981" />
              <span>{t('limitModal.benefits.unlimitedAi', 'Sınırsız AI')}</span>
            </div>
            <div className="benefit-item">
              <CheckCircle2 size={14} color="#10b981" />
              <span>{t('limitModal.benefits.allSurahs', 'Tüm Sureler')}</span>
            </div>
            <div className="benefit-item">
              <CheckCircle2 size={14} color="#10b981" />
              <span>{t('limitModal.benefits.noAds', 'Reklamsız')}</span>
            </div>
            <div className="benefit-item">
              <CheckCircle2 size={14} color="#10b981" />
              <span>{t('limitModal.benefits.offline', 'Çevrimdışı')}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button className="primary-btn upgrade-btn" onClick={onUpgrade}>
            <Crown size={18} />
            {t('limitModal.upgradeButton', 'Pro\'ya Yükselt')}
          </button>
          <button className="secondary-btn" onClick={onClose} style={{ padding: '14px', borderRadius: '16px', fontWeight: '800' }}>
            {t('limitModal.laterButton', 'Tamam, Anladım')}
          </button>
        </div>
      </div>

      <style>{`
        .limit-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
        }

        .crown-glow {
          width: 80px; height: 80px;
          margin: 0 auto;
          display: flex; align-items: center; justify-content: center;
          background: rgba(251, 191, 36, 0.1);
          border-radius: 24px;
          position: relative;
        }

        .crown-glow::after {
          content: '';
          position: absolute;
          inset: -10px;
          background: radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, transparent 70%);
          border-radius: inherit;
          animation: pulseCrown 2s infinite;
        }

        @keyframes pulseCrown {
          0% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(1); opacity: 0.5; }
        }

        .limit-option-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: var(--nav-hover);
          border: 1px solid var(--nav-border);
          border-radius: 16px;
          transition: all 0.3s ease;
        }

        .pro-card {
          border-color: rgba(251, 191, 36, 0.3);
          background: rgba(251, 191, 36, 0.02);
        }

        .option-icon-box {
          width: 40px; height: 40px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 12px;
          flex-shrink: 0;
        }

        .benefit-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .benefit-item span {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--nav-text-muted);
        }

        .upgrade-btn {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          color: #000;
          border: none;
          padding: 16px;
          border-radius: 16px;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .upgrade-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(251, 191, 36, 0.4);
        }

        .secondary-btn {
          background: var(--nav-hover);
          border: 1px solid var(--nav-border);
          color: var(--nav-text);
          cursor: pointer;
        }

        .secondary-btn:hover {
          background: var(--nav-border-muted);
        }
      `}</style>
    </div>
  );
};

export default LimitReachedModal;

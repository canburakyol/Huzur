import { Crown, X } from 'lucide-react';

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
  if (!isOpen) return null;

  const featureNames = {
    nuzul_ai: 'Nüzul Sebebi Sorgusu',
    tajweed_ai: 'Tecvid Kontrolü',
    word_by_word: 'Kelime Kelime Anlam',
    memorize: 'Hafızlık Yardımcısı'
  };

  const featureIcons = {
    nuzul_ai: '📖',
    tajweed_ai: '🎤',
    word_by_word: '📝',
    memorize: '🧠'
  };

  return (
    <div className="limit-modal-overlay" onClick={onClose}>
      <div className="limit-modal glass-card" onClick={e => e.stopPropagation()}>
        {/* Close Button */}
        <button className="limit-modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Icon */}
        <div className="limit-modal-icon">
          👑
        </div>

        {/* Title */}
        <h2>Günlük Limit Doldu</h2>

        {/* Feature Info */}
        <div className="limit-feature-info">
          <span className="limit-feature-icon">{featureIcons[feature]}</span>
          <span>{featureNames[feature]}</span>
        </div>

        {/* Usage Info */}
        <p className="limit-usage-text">
          Bugünkü <strong>{maxCount}</strong> ücretsiz hakkını kullandın!
        </p>

        {/* Options */}
        <div className="limit-options">
          <div className="limit-option">
            <span className="option-icon">⏰</span>
            <span>Yarın 2 yeni hakkın olacak</span>
          </div>
          <div className="limit-option-divider">veya</div>
          <div className="limit-option pro">
            <span className="option-icon">⭐</span>
            <span>Pro'ya geç, <strong>sınırsız</strong> kullan!</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="limit-modal-buttons">
          <button className="limit-upgrade-btn" onClick={onUpgrade}>
            <Crown size={18} />
            Pro'ya Geç
          </button>
          <button className="limit-later-btn" onClick={onClose}>
            Tamam, Anladım
          </button>
        </div>

        {/* Pro Benefits Preview */}
        <div className="pro-benefits-mini">
          <span>Pro ile:</span>
          <ul>
            <li>🤖 Sınırsız AI sorgu</li>
            <li>📖 Tüm sureler</li>
            <li>🚫 Reklamsız</li>
          </ul>
        </div>
      </div>

      <style>{`
        .limit-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
          animation: fadeIn 0.3s ease-out;
        }

        .limit-modal {
          position: relative;
          max-width: 360px;
          width: 100%;
          padding: 32px 24px;
          text-align: center;
          animation: slideUp 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .limit-modal-close {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(255,255,255,0.1);
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-secondary);
          transition: all 0.2s ease;
        }

        .limit-modal-close:hover {
          background: rgba(255,255,255,0.2);
        }

        .limit-modal-icon {
          font-size: 56px;
          margin-bottom: 16px;
          animation: bounce 0.6s ease-out;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .limit-modal h2 {
          font-size: 22px;
          color: var(--primary-color);
          margin: 0 0 16px 0;
        }

        .limit-feature-info {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(255,255,255,0.1);
          border-radius: 20px;
          margin-bottom: 16px;
          font-size: 14px;
          color: var(--text-primary);
        }

        .limit-feature-icon {
          font-size: 18px;
        }

        .limit-usage-text {
          color: var(--text-secondary);
          font-size: 15px;
          margin: 0 0 20px 0;
        }

        .limit-options {
          background: rgba(0,0,0,0.2);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
        }

        .limit-option {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: var(--text-secondary);
          padding: 8px 0;
        }

        .limit-option.pro {
          color: var(--primary-color);
        }

        .option-icon {
          font-size: 16px;
        }

        .limit-option-divider {
          color: var(--text-secondary);
          font-size: 12px;
          opacity: 0.7;
          padding: 8px 0;
        }

        .limit-modal-buttons {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
        }

        .limit-upgrade-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .limit-upgrade-btn:active {
          transform: scale(0.98);
        }

        .limit-later-btn {
          width: 100%;
          padding: 12px;
          background: transparent;
          color: var(--text-secondary);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 12px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .limit-later-btn:hover {
          background: rgba(255,255,255,0.05);
        }

        .pro-benefits-mini {
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 12px;
          padding: 12px 16px;
          text-align: left;
        }

        .pro-benefits-mini span {
          font-size: 12px;
          color: var(--primary-color);
          font-weight: 600;
        }

        .pro-benefits-mini ul {
          list-style: none;
          padding: 0;
          margin: 8px 0 0 0;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .pro-benefits-mini li {
          font-size: 11px;
          color: var(--text-secondary);
          background: rgba(255,255,255,0.05);
          padding: 4px 8px;
          border-radius: 12px;
        }
      `}</style>
    </div>
  );
};

export default LimitReachedModal;

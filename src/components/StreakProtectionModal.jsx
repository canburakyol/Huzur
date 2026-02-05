import React from 'react';
import { Flame, Snowflake, ShieldCheck, X } from 'lucide-react';
import './StreakProtectionModal.css';

const StreakProtectionModal = ({ isOpen, onClose, onUseToken, categoryData, categoryName = 'Genel' }) => {
  if (!isOpen) return null;

  const { count, freezeTokens } = categoryData || { count: 0, freezeTokens: 0 };

  return (
    <div className="streak-protection-overlay">
      <div className="streak-protection-modal glass-card">
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-content">
          <div className="icon-container">
            <div className="flame-bg">
              <Flame size={64} className="main-icon text-orange-500" />
            </div>
            <div className="snowflake-tag">
              <Snowflake size={24} className="text-blue-400" />
            </div>
          </div>

          <h2 className="modal-title">Seriniz Tehlikede!</h2>
          <p className="modal-description">
            Dün uygulamayı kullanamadığınız için <strong>{count} günlük</strong> {categoryName} seriniz sıfırlanmak üzere.
          </p>

          <div className="protection-card">
            <div className="protection-info">
              <ShieldCheck className="text-green-500" size={32} />
              <div>
                <p className="protection-label">Dondurma Hakkı Kullan</p>
                <p className="protection-stats">{freezeTokens} adet mevcut</p>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button 
              className={`btn btn-primary use-token-btn ${freezeTokens === 0 ? 'disabled' : ''}`}
              onClick={onUseToken}
              disabled={freezeTokens === 0}
            >
              Uygula ve Seriyi Koru
            </button>
            <button className="btn btn-secondary mt-2" onClick={onClose}>
              Vazgeç (Seri Sıfırlanır)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreakProtectionModal;

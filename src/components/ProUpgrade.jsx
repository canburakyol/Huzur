import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Check, Crown } from 'lucide-react';
import { getOfferings, purchasePackage, restorePurchases } from '../services/revenueCatService';
import { setProStatus } from '../services/proService';
import { logger } from '../utils/logger';

const ProUpgrade = ({ onClose }) => {
  const { t } = useTranslation();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [restoreResult, setRestoreResult] = useState(null); // 'success' | 'not_found' | null

  const loadOfferings = useCallback(async () => {
    // Platform kontrolü
    const isNativePlatform = window.Capacitor?.isNativePlatform?.() ?? window.Capacitor?.isNative ?? false;
    
    if (!isNativePlatform) {
      // Browser Mock Data
      logger.log('[ProUpgrade] Browser detected, loading mock packages...');
      setPackages([
        {
          identifier: 'monthly',
          product: {
            title: 'Huzur Pro (Aylık)',
            priceString: '₺29.99',
            description: 'Aylık abonelik'
          }
        },
        {
          identifier: 'yearly',
          product: {
            title: 'Huzur Pro (Yıllık)',
            priceString: '₺299.99',
            description: 'Yıllık abonelik'
          }
        }
      ]);
      setLoading(false);
      return;
    }

    try {
      logger.log('[ProUpgrade] Loading offerings from RevenueCat...');
      const availablePackages = await getOfferings();
      if (availablePackages.length === 0) {
        setError(t('pro.noPackages'));
      } else {
        setPackages(availablePackages);
      }
    } catch (err) {
      logger.error('[ProUpgrade] Error loading offerings:', err);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadOfferings();
  }, [loadOfferings]);

  const handlePurchase = async (pkg) => {
    setProcessing(true);
    setError(null);

    // Platform kontrolü
    const isNativePlatform = window.Capacitor?.isNativePlatform?.() ?? window.Capacitor?.isNative ?? false;
    if (!isNativePlatform) {
      // Browser Mock Purchase
      logger.log('[ProUpgrade] Browser mock purchase...');
      setTimeout(() => {
         logger.log('[ProUpgrade] Mock purchase successful');
         setProStatus(true); // Activate Pro
         onClose();
         setProcessing(false);
      }, 1500);
      return;
    }

    try {
      logger.log('[ProUpgrade] Starting purchase for package:', pkg.identifier);
      const success = await purchasePackage(pkg);
      if (success) {
        logger.log('[ProUpgrade] Purchase successful');
        onClose();
      } else {
        // Kullanıcı iptal etti veya hata - UI zaten error state'i gösterecek
        logger.log('[ProUpgrade] Purchase not completed');
      }
    } catch (err) {
      logger.error('[ProUpgrade] Purchase error:', err);
      setError(t('pro.purchaseFailed'));
    } finally {
      setProcessing(false);
    }
  };

  const handleRestore = async () => {
    setProcessing(true);
    setRestoreResult(null);
    try {
      const success = await restorePurchases();
      if (success) {
        setRestoreResult('success');
        setTimeout(() => onClose(), 1500);
      } else {
        setRestoreResult('not_found');
      }
    } catch {
      setError(t('pro.restoreError'));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="pro-modal-overlay">
      <div className="pro-modal animate-scaleIn">
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="pro-header">
          <div className="crown-icon">
            <Crown size={48} color="#FFD700" fill="#FFD700" />
          </div>
          <h2>{t('pro.title')}</h2>
          <p>{t('pro.subtitle')}</p>
        </div>

        <div className="features-list">
          <div className="feature-item">
            <div className="feature-icon"><Check size={20} /></div>
            <div className="feature-text">
              <strong>{t('pro.features.unlimitedAI')}</strong>
              <p>{t('pro.features.unlimitedAIDesc')}</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><Check size={20} /></div>
            <div className="feature-text">
              <strong>{t('pro.features.wordByWord')}</strong>
              <p>{t('pro.features.wordByWordDesc')}</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><Check size={20} /></div>
            <div className="feature-text">
              <strong>{t('pro.features.memorization')}</strong>
              <p>{t('pro.features.memorizationDesc')}</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><Check size={20} /></div>
            <div className="feature-text">
              <strong>{t('pro.features.adFree')}</strong>
              <p>{t('pro.features.adFreeDesc')}</p>
            </div>
          </div>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <div className="packages-container">
          {loading ? (
            <div className="loading">{t('common.loading')}</div>
          ) : (
            packages.map((pkg, index) => (
              <div 
                key={index} 
                className={`package-card ${index === 1 ? 'popular' : ''}`}
                onClick={() => handlePurchase(pkg)}
              >
                {index === 1 && <div className="popular-tag">{t('pro.popular')}</div>}
                <div className="package-title">{pkg?.product?.title || t('pro.package')}</div>
                <div className="package-price">{pkg?.product?.priceString || '-'}</div>
                <div className="package-desc">
                    {pkg?.identifier === 'yearly' 
                      ? `3 gün ücretsiz deneyin. Deneme bitiminde ${pkg?.product?.priceString || ''}/yıl otomatik yenilenir.`
                      : `${pkg?.product?.priceString || ''}/ay, her ay otomatik yenilenir.`}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Subscription Terms - Google Play Policy Requirement */}
        <div className="subscription-terms">
          <p>• {t('pro.terms.autoRenew')}</p>
          <p>• {t('pro.terms.cancelAnytime')}</p>
          <p>• {t('pro.terms.cancel24h')}</p>
          <p className="legal-links">
            <a href="https://canburakyol.github.io/privacy-policy/" target="_blank" rel="noopener noreferrer">{t('pro.privacyPolicy')}</a>
            {' | '}
            <a href="https://canburakyol.github.io/terms.html/" target="_blank" rel="noopener noreferrer">{t('pro.termsOfService')}</a>
          </p>
        </div>

        <button className="restore-btn" onClick={handleRestore} disabled={processing}>
          {t('pro.restore')}
        </button>

        {/* Restore Result Feedback */}
        {restoreResult === 'success' && (
          <div className="restore-success">
            ✅ {t('pro.restoreSuccess')}
          </div>
        )}
        {restoreResult === 'not_found' && (
          <div className="restore-not-found">
            ℹ️ {t('pro.restoreNotFound')}
          </div>
        )}

        {processing && (
            <div className="processing-overlay">
                <div className="spinner"></div>
            </div>
        )}
      </div>

      <style>{`
        .pro-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 61, 46, 0.95);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .pro-modal {
          background: linear-gradient(135deg, #0f3d2e 0%, #1a5c45 100%);
          width: 100%;
          max-width: 400px;
          border-radius: 24px;
          padding: 24px;
          position: relative;
          border: 1px solid rgba(212, 175, 55, 0.3);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(212, 175, 55, 0.1);
          max-height: 90vh;
          overflow-y: auto;
        }

        .close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(212, 175, 55, 0.2);
          border: 1px solid rgba(212, 175, 55, 0.3);
          color: #d4af37;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 10;
        }

        .close-btn:hover {
          background: rgba(212, 175, 55, 0.3);
          transform: scale(1.1);
        }

        .close-btn:active {
          transform: scale(0.95);
        }

        .pro-header {
          text-align: center;
          margin-bottom: 24px;
          padding-top: 10px;
        }

        .crown-icon {
          margin-bottom: 16px;
          filter: drop-shadow(0 0 15px rgba(212, 175, 55, 0.6));
        }

        .pro-header h2 {
          color: #d4af37;
          margin: 0 0 8px 0;
          font-size: 24px;
          text-shadow: 0 2px 10px rgba(212, 175, 55, 0.3);
        }

        .pro-header p {
          color: #a3b18a;
          margin: 0;
          font-size: 14px;
          line-height: 1.5;
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 32px;
        }

        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .feature-icon {
          background: rgba(212, 175, 55, 0.2);
          color: #d4af37;
          padding: 6px;
          border-radius: 10px;
          display: flex;
          border: 1px solid rgba(212, 175, 55, 0.3);
        }

        .feature-text strong {
          display: block;
          color: #f0e68c;
          font-size: 14px;
          margin-bottom: 2px;
        }

        .feature-text p {
          margin: 0;
          color: #a3b18a;
          font-size: 12px;
        }

        .packages-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .package-card {
          background: rgba(20, 70, 55, 0.8);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 16px;
          padding: 16px;
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
        }

        .package-card:active {
          transform: scale(0.98);
        }

        .package-card.popular {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.25), rgba(212, 175, 55, 0.1));
          border-color: #d4af37;
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.2);
        }

        .popular-tag {
          position: absolute;
          top: -10px;
          right: 16px;
          background: linear-gradient(135deg, #d4af37, #b8860b);
          color: #0f3d2e;
          font-size: 10px;
          font-weight: bold;
          padding: 4px 10px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(212, 175, 55, 0.4);
        }

        .package-title {
          color: #f0e68c;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .package-price {
          color: #d4af37;
          font-size: 22px;
          font-weight: 700;
          text-shadow: 0 2px 10px rgba(212, 175, 55, 0.3);
        }

        .package-desc {
            color: #a3b18a;
            font-size: 12px;
            margin-top: 4px;
        }

        .subscription-terms {
          background: rgba(20, 70, 55, 0.6);
          border: 1px solid rgba(212, 175, 55, 0.15);
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 16px;
          text-align: left;
        }

        .subscription-terms p {
          margin: 0 0 6px 0;
          font-size: 11px;
          color: #a3b18a;
          line-height: 1.4;
        }

        .subscription-terms p:last-child {
          margin-bottom: 0;
        }

        .legal-links {
          margin-top: 10px !important;
          text-align: center;
        }

        .legal-links a {
          color: #d4af37;
          text-decoration: none;
          font-size: 11px;
        }

        .legal-links a:hover {
          text-decoration: underline;
        }

        .restore-btn {
          width: 100%;
          background: none;
          border: none;
          color: #a3b18a;
          font-size: 12px;
          cursor: pointer;
          text-decoration: underline;
          margin-bottom: 12px;
          padding: 8px;
        }

        .restore-btn:active {
          opacity: 0.7;
        }

        .restore-success {
          background: rgba(46, 204, 113, 0.2);
          border: 1px solid rgba(46, 204, 113, 0.4);
          color: #2ecc71;
          padding: 12px;
          border-radius: 10px;
          font-size: 13px;
          text-align: center;
          margin-bottom: 12px;
          animation: fadeIn 0.3s ease-out;
        }

        .restore-not-found {
          background: rgba(52, 152, 219, 0.2);
          border: 1px solid rgba(52, 152, 219, 0.4);
          color: #3498db;
          padding: 12px;
          border-radius: 10px;
          font-size: 13px;
          text-align: center;
          margin-bottom: 12px;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .error-msg {
            color: #e74c3c;
            text-align: center;
            margin-bottom: 16px;
            font-size: 14px;
            background: rgba(231, 76, 60, 0.1);
            padding: 10px;
            border-radius: 8px;
            border: 1px solid rgba(231, 76, 60, 0.3);
        }

        .processing-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(15, 61, 46, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 24px;
            z-index: 10;
        }

        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(212, 175, 55, 0.3);
            border-top-color: #d4af37;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }

        .loading {
          text-align: center;
          color: #a3b18a;
          padding: 20px;
        }
      `}</style>
    </div>
  );
};

export default ProUpgrade;

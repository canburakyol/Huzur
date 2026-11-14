import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Crown, Sparkles, X } from 'lucide-react';
import { getExperimentVariant } from '../../../services/experimentService';
import { getOfferings, purchasePackage, restorePurchases } from '../../../services/revenueCatService';
import { getProDetails } from '../../../services/proService';
import { getReferralProgress } from '../../../services/referralService';
import {
  ANALYTICS_EVENTS,
  logEvent,
} from '../../../services/analyticsService';
import {
  clearPendingPremiumMoment,
  resolvePremiumMomentFromProps,
} from '../../../services/premiumMomentService';
import { getRecoveryLoopPlan } from '../../../services/recoveryLoopService';
import { logger } from '../../../utils/logger';
import PrivacyPolicy from '../../system/components/PrivacyPolicy';
import TermsOfService from '../../system/components/TermsOfService';
import { getStoredPrimaryGoal } from '../../../utils/primaryGoal';

const isNativePlatform = () => (
  window.Capacitor?.isNativePlatform?.() ?? window.Capacitor?.isNative ?? false
);

const normalizePackageRecommendation = (value = '') => {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized.includes('year')) return 'yearly';
  if (normalized.includes('month')) return 'monthly';
  return normalized || 'yearly';
};

// Only list benefits that work today without the backend; every claim here must be true.
const buildPaywallCopy = (t) => ({
  title: t('pro.paywall.title', 'Huzur Pro'),
  subtitle: t('pro.paywall.subtitle', "Reklamsız ibadet ve Kur'an araçlarının tamamı."),
  accent: t('pro.paywall.accent', 'Pro'),
  cta: t('pro.paywall.cta', "Pro'ya geç"),
  features: [
    {
      title: t('pro.paywall.noAdsTitle', 'Reklamsız kullanım'),
      description: t('pro.paywall.noAdsDesc', 'Ana sayfada, Kur\'an\'da ve tüm ekranlarda reklam görmezsin.'),
    },
    {
      title: t('pro.paywall.allSurahsTitle', '114 surenin tamamı'),
      description: t('pro.paywall.allSurahsDesc', 'Kelime kelime meal ve ezber araçları bütün surelerde açılır.'),
    },
    {
      title: t('pro.paywall.libraryTitle', 'Kütüphanenin Pro bölümleri'),
      description: t('pro.paywall.libraryDesc', 'Hafızlardan hatim setleri ve Pro video dersler.'),
    },
  ],
  socialProof: t('pro.paywall.reassurance', "İstediğin zaman Google Play'den iptal edebilirsin."),
});

const matchesPackage = (pkg, recommendedPackage) => {
  const normalizedRecommendation = normalizePackageRecommendation(recommendedPackage);
  const identifier = String(pkg?.identifier || '').toLowerCase();
  const title = String(pkg?.product?.title || '').toLowerCase();

  if (normalizedRecommendation === 'yearly') {
    return identifier.includes('year') || title.includes('yil') || title.includes('year');
  }
  if (normalizedRecommendation === 'monthly') {
    return identifier.includes('month') || title.includes('ay') || title.includes('month');
  }
  return false;
};

const sortPackages = (packages = [], recommendedPackage = 'yearly') => {
  return [...packages].sort((left, right) => {
    const leftScore = matchesPackage(left, recommendedPackage) ? 1 : 0;
    const rightScore = matchesPackage(right, recommendedPackage) ? 1 : 0;
    return rightScore - leftScore;
  });
};

const buildReferralCopy = (proDetails, referralProgress) => {
  if (proDetails?.active && proDetails.source === 'referral_reward') {
    const { hours, minutes, isExpiringSoon } = proDetails.remaining;
    return {
      isReferralPro: true,
      badge: 'Arkadaş Hediyesi',
      title: '24 saatlik Pro hediyen aktif',
      subtitle: isExpiringSoon
        ? `Hediyen ${hours > 0 ? `${hours} saat` : `${minutes} dakika`} sonra sona erecek. Dilersen süre bitmeden abonelikle devam edebilirsin.`
        : `Hediyen ${hours} saat ${minutes} dakika daha aktif. Pro özelliklerini rahatça dene.`,
      cta: null
    };
  }

  if (referralProgress?.invitedByCode && !referralProgress.inviteeEligible) {
    const steps = [
      referralProgress.inviteAcceptedAt && 'Kayıt tamamlandı',
      referralProgress.onboardingCompletedAt && 'Kurulum tamamlandı',
      referralProgress.firstIbadahCompletedAt && 'İlk ibadet tamamlandı'
    ].filter(Boolean);

    const completedSteps = steps.length;
    const totalSteps = 3;

    return {
      isReferralPending: true,
      badge: `${completedSteps}/${totalSteps} tamamlandı`,
      title: `${totalSteps - completedSteps} adım kaldı`,
      subtitle: `Davet ödülü için ${totalSteps - completedSteps} adım daha var. İstersen Pro'yu abonelikle hemen acabilirsin.`,
      cta: null
    };
  }

  return {
    isReferralPro: false,
    isReferralPending: false,
    badge: null,
    title: null,
    subtitle: null,
    cta: null
  };
};

const ProUpgrade = ({
  source = 'direct',
  momentType = 'assistant_success',
  recommendedPackage = 'yearly',
  copyVariant = null,
  onClose,
}) => {
  const { t } = useTranslation();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [restoreResult, setRestoreResult] = useState(null);
  const [proDetails, setProDetails] = useState(null);
  const [referralProgress, setReferralProgress] = useState(null);

  const moment = useMemo(() => {
    const resolved = resolvePremiumMomentFromProps({
      source,
      momentType,
      recommendedPackage,
      copyVariant,
    });

    return {
      source: resolved.source || source,
      momentType: resolved.momentType || momentType,
      recommendedPackage: normalizePackageRecommendation(resolved.recommendedPackage || recommendedPackage),
      copyVariant: resolved.copyVariant || copyVariant || 'ai_guidance',
      recoveryBand: resolved.recoveryBand || getRecoveryLoopPlan().riskBand,
      primaryGoal: resolved.primaryGoal || getStoredPrimaryGoal(),
    };
  }, [copyVariant, momentType, recommendedPackage, source]);

  const valueVariant = useMemo(() => getExperimentVariant('paywall_value_stack_v1'), []);
  const ctaVariant = useMemo(() => getExperimentVariant('paywall_cta_v1'), []);
  const uiCopy = useMemo(() => buildPaywallCopy(t), [t]);
  const [legalDoc, setLegalDoc] = useState(null);
  const referralCopy = useMemo(
    () => buildReferralCopy(proDetails, referralProgress),
    [proDetails, referralProgress]
  );

  const closeModal = useCallback(() => {
    clearPendingPremiumMoment();
    onClose?.();
  }, [onClose]);

  const loadOfferings = useCallback(async () => {
    if (!isNativePlatform()) {
      logger.log('[ProUpgrade] Browser detected, purchases disabled.');
      setPackages([]);
      setError(t('pro.nativeOnly', 'Satın alma yalnızca mobil uygulamada destekleniyor.'));
      setLoading(false);
      return;
    }

    try {
      const availablePackages = await getOfferings();
      if (availablePackages.length === 0) {
        setError(t('pro.noPackages'));
      } else {
        setPackages(sortPackages(availablePackages, moment.recommendedPackage));
      }
    } catch (err) {
      logger.error('[ProUpgrade] Error loading offerings:', err);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [moment.recommendedPackage, t]);

  useEffect(() => {
    void loadOfferings();
    setProDetails(getProDetails());
    setReferralProgress(getReferralProgress());
  }, [loadOfferings]);

  useEffect(() => {
    logEvent(ANALYTICS_EVENTS.PAYWALL_VIEWED, {
      source: moment.source,
      moment_type: moment.momentType,
      experiment_variant: `${valueVariant}|${ctaVariant}`,
      recommended_package: moment.recommendedPackage,
      recovery_band: moment.recoveryBand,
      primary_goal: moment.primaryGoal,
    });
  }, [ctaVariant, moment, valueVariant]);

  const handlePurchase = async (pkg) => {
    const selectedPackage = normalizePackageRecommendation(pkg?.identifier || moment.recommendedPackage);
    setProcessing(true);
    setError(null);

    logEvent(ANALYTICS_EVENTS.PAYWALL_PACKAGE_SELECTED, {
      source: moment.source,
      moment_type: moment.momentType,
      experiment_variant: `${valueVariant}|${ctaVariant}`,
      recommended_package: selectedPackage,
      recovery_band: moment.recoveryBand,
      primary_goal: moment.primaryGoal,
      package_id: pkg?.identifier || 'unknown',
    });

    if (!isNativePlatform()) {
      setError(t('pro.nativeOnly', 'Satın alma yalnızca mobil uygulamada destekleniyor.'));
      setProcessing(false);
      return;
    }

    logEvent(ANALYTICS_EVENTS.PAYWALL_PURCHASE_STARTED, {
      source: moment.source,
      moment_type: moment.momentType,
      experiment_variant: `${valueVariant}|${ctaVariant}`,
      recommended_package: selectedPackage,
      recovery_band: moment.recoveryBand,
      primary_goal: moment.primaryGoal,
      package_id: pkg?.identifier || 'unknown',
    });

    try {
      const success = await purchasePackage(pkg);
      if (success) {
        logEvent(ANALYTICS_EVENTS.PAYWALL_PURCHASE_SUCCEEDED, {
          source: moment.source,
          moment_type: moment.momentType,
          experiment_variant: `${valueVariant}|${ctaVariant}`,
          recommended_package: selectedPackage,
          recovery_band: moment.recoveryBand,
          primary_goal: moment.primaryGoal,
          package_id: pkg?.identifier || 'unknown',
        });
        closeModal();
      } else {
        logEvent(ANALYTICS_EVENTS.PAYWALL_PURCHASE_FAILED, {
          source: moment.source,
          moment_type: moment.momentType,
          experiment_variant: `${valueVariant}|${ctaVariant}`,
          recommended_package: selectedPackage,
          recovery_band: moment.recoveryBand,
          primary_goal: moment.primaryGoal,
          package_id: pkg?.identifier || 'unknown',
          reason: 'not_completed',
        });
      }
    } catch (err) {
      logger.error('[ProUpgrade] Purchase error:', err);
      logEvent(ANALYTICS_EVENTS.PAYWALL_PURCHASE_FAILED, {
        source: moment.source,
        moment_type: moment.momentType,
        experiment_variant: `${valueVariant}|${ctaVariant}`,
        recommended_package: selectedPackage,
        recovery_band: moment.recoveryBand,
        primary_goal: moment.primaryGoal,
        package_id: pkg?.identifier || 'unknown',
        reason: err?.code || 'exception',
      });
      setError(t('pro.purchaseFailed'));
    } finally {
      setProcessing(false);
    }
  };

  const handleRestore = async () => {
    setProcessing(true);
    setRestoreResult(null);

    logEvent(ANALYTICS_EVENTS.PAYWALL_RESTORE_STARTED, {
      source: moment.source,
      moment_type: moment.momentType,
      experiment_variant: `${valueVariant}|${ctaVariant}`,
      recommended_package: moment.recommendedPackage,
      recovery_band: moment.recoveryBand,
      primary_goal: moment.primaryGoal,
    });

    if (!isNativePlatform()) {
      setError(t('pro.nativeOnly', 'Satın alma yalnızca mobil uygulamada destekleniyor.'));
      setProcessing(false);
      return;
    }

    try {
      const success = await restorePurchases();
      if (success) {
        setRestoreResult('success');
        logEvent(ANALYTICS_EVENTS.PAYWALL_RESTORE_SUCCEEDED, {
          source: moment.source,
          moment_type: moment.momentType,
          experiment_variant: `${valueVariant}|${ctaVariant}`,
          recommended_package: moment.recommendedPackage,
          recovery_band: moment.recoveryBand,
          primary_goal: moment.primaryGoal,
        });
        setTimeout(() => closeModal(), 1200);
      } else {
        setRestoreResult('not_found');
        logEvent(ANALYTICS_EVENTS.PAYWALL_RESTORE_NOT_FOUND, {
          source: moment.source,
          moment_type: moment.momentType,
          experiment_variant: `${valueVariant}|${ctaVariant}`,
          recommended_package: moment.recommendedPackage,
          recovery_band: moment.recoveryBand,
          primary_goal: moment.primaryGoal,
        });
      }
    } catch (err) {
      logger.error('[ProUpgrade] Restore error:', err);
      setError(t('pro.restoreError'));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="pro-modal-overlay">
      <div className="pro-modal animate-scaleIn">
        <button className="close-btn" onClick={closeModal}>
          <X size={24} />
        </button>

        <div className="pro-header">
          <div className="crown-icon">
            <Crown size={44} color="var(--tertiary)" fill="var(--tertiary)" />
          </div>
          <div className="moment-chip">
            <Sparkles size={14} />
            {referralCopy.badge || uiCopy.accent}
          </div>
          <h2>{referralCopy.title || uiCopy.title}</h2>
          <p>{referralCopy.subtitle || uiCopy.subtitle}</p>
        </div>

        <div className="social-proof">
          <p>{uiCopy.socialProof}</p>
        </div>

        {proDetails?.active && proDetails.source === 'referral_reward' && (
          <div className="referral-active-banner">
            <p>
              Arkadaşının hediyesi ile Pro aktifsin.
              {proDetails.remaining.isExpiringSoon && (
                <span className="expiring-soon">
                  {' '}Süre dolmak üzere: {proDetails.remaining.hours > 0
                    ? `${proDetails.remaining.hours} saat`
                    : `${proDetails.remaining.minutes} dakika`} kaldı
                </span>
              )}
            </p>
          </div>
        )}

        <div className="features-list">
          {uiCopy.features.map((feature) => (
            <div key={feature.title} className="feature-item">
              <div className="feature-icon"><Check size={18} /></div>
              <div className="feature-text">
                <strong>{feature.title}</strong>
                <p>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {error && <div className="error-msg">{error}</div>}

        <div className="packages-container">
          {loading ? (
            <div className="loading">{t('common.loading')}</div>
          ) : (
            packages.map((pkg) => {
              const highlighted = matchesPackage(pkg, moment.recommendedPackage);
              return (
                <button
                  key={pkg?.identifier || pkg?.product?.title}
                  type="button"
                  className={`package-card ${highlighted ? 'popular' : ''}`}
                  onClick={() => handlePurchase(pkg)}
                >
                  {highlighted && <div className="popular-tag">{t('pro.popular', 'EN POPÜLER')}</div>}
                  <div className="package-title">{pkg?.product?.title || t('pro.package')}</div>
                  <div className="package-price">{pkg?.product?.priceString || '-'}</div>
                  <div className="package-desc">
                    {matchesPackage(pkg, 'yearly')
                      ? t('pro.yearlyFocus', 'Yıllık ödersen aylığa göre daha uygun.')
                      : t('pro.monthlyFocus', 'Her ay yenilenir, istediğin zaman iptal edebilirsin.')}
                  </div>
                  <div className="package-cta">
                    {referralCopy.cta || uiCopy.cta}
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="subscription-terms">
          <p>• {t('pro.terms.autoRenew')}</p>
          <p>• {t('pro.terms.cancelAnytime')}</p>
          <p>• {t('pro.terms.cancel24h')}</p>
          <p className="legal-links">
            <button type="button" className="legal-link-btn" onClick={() => setLegalDoc('privacy')}>{t('settings.privacyPolicy')}</button>
            {' | '}
            <button type="button" className="legal-link-btn" onClick={() => setLegalDoc('terms')}>{t('settings.termsOfService')}</button>
          </p>
        </div>

        <button className="restore-btn" onClick={handleRestore} disabled={processing}>
          {t('pro.restore')}
        </button>

        {restoreResult === 'success' && (
          <div className="restore-success">
            {t('pro.restoreSuccess')}
          </div>
        )}
        {restoreResult === 'not_found' && (
          <div className="restore-not-found">
            {t('pro.restoreNotFound')}
          </div>
        )}

        {processing && (
          <div className="processing-overlay">
            <div className="spinner"></div>
          </div>
        )}
      </div>

      {legalDoc === 'privacy' && <PrivacyPolicy onClose={() => setLegalDoc(null)} />}
      {legalDoc === 'terms' && <TermsOfService onClose={() => setLegalDoc(null)} />}

      <style>{`
        .legal-links .legal-link-btn {
          background: none;
          border: 0;
          padding: 0;
          font: inherit;
          color: inherit;
          text-decoration: underline;
          cursor: pointer;
        }

        .pro-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 61, 46, 0.95);
          backdrop-filter: blur(10px);
          /* above .feature-route-shell > .bottom-nav (1500): a purchase modal must cover navigation */
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .pro-modal {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
          width: 100%;
          max-width: 420px;
          border-radius: 24px;
          padding: 24px;
          position: relative;
          border: 1px solid rgba(212, 175, 55, 0.28);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          max-height: 90vh;
          overflow-y: auto;
        }

        .close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(212, 175, 55, 0.16);
          border: 1px solid rgba(212, 175, 55, 0.25);
          color: var(--tertiary);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .pro-header {
          text-align: center;
          margin-bottom: 22px;
          padding-top: 8px;
        }

        .crown-icon {
          margin-bottom: 12px;
          filter: drop-shadow(0 0 12px rgba(212, 175, 55, 0.5));
        }

        .moment-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 999px;
          background: rgba(212, 175, 55, 0.14);
          border: 1px solid rgba(212, 175, 55, 0.22);
          color: var(--on-tertiary-container);
          font-size: 12px;
          font-weight: 800;
          padding: 6px 10px;
          margin-bottom: 12px;
        }

        .pro-header h2 {
          color: var(--tertiary);
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 800;
        }

        .pro-header p {
          margin: 0;
          color: var(--on-surface);
          font-size: 14px;
          line-height: 1.6;
          font-weight: 600;
        }

        .social-proof {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 10px 12px;
          text-align: center;
          margin-bottom: 20px;
          border: 1px dashed rgba(212, 175, 55, 0.3);
        }

        .social-proof p {
          margin: 0;
          color: var(--tertiary);
          font-size: 13px;
          font-weight: 600;
          line-height: 1.45;
        }

        .referral-active-banner {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.08));
          border-radius: 12px;
          padding: 12px 14px;
          margin-bottom: 20px;
          border: 1px solid rgba(16, 185, 129, 0.3);
          text-align: center;
        }

        .referral-active-banner p {
          margin: 0;
          color: var(--on-secondary-container);
          font-size: 13px;
          font-weight: 600;
          line-height: 1.5;
        }

        .referral-active-banner .expiring-soon {
          color: var(--tertiary);
          font-weight: 700;
        }

        .features-list {
          display: grid;
          gap: 12px;
          margin-bottom: 22px;
        }

        .feature-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 14px;
        }

        .feature-icon {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: rgba(212, 175, 55, 0.14);
          color: var(--tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .feature-text strong {
          display: block;
          color: var(--on-surface);
          margin-bottom: 4px;
          font-size: 14px;
        }

        .feature-text p {
          margin: 0;
          color: var(--on-surface-variant);
          font-size: 12px;
          line-height: 1.55;
        }

        .packages-container {
          display: grid;
          gap: 14px;
          margin-bottom: 18px;
        }

        .package-card {
          position: relative;
          text-align: left;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.05);
          border-radius: 18px;
          padding: 18px 16px;
          cursor: pointer;
          color: inherit;
        }

        .package-card.popular {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.26), rgba(212, 175, 55, 0.08));
          border-color: var(--tertiary);
          box-shadow: 0 0 24px rgba(212, 175, 55, 0.18);
        }

        .popular-tag {
          position: absolute;
          top: -10px;
          left: 16px;
          background: linear-gradient(135deg, var(--tertiary), var(--on-tertiary-fixed-variant));
          color: var(--on-tertiary);
          font-size: 11px;
          font-weight: 900;
          padding: 5px 10px;
          border-radius: 999px;
        }

        .package-title {
          color: var(--on-tertiary-container);
          font-weight: 700;
          margin-bottom: 6px;
        }

        .package-price {
          color: var(--tertiary);
          font-size: 24px;
          font-weight: 800;
        }

        .package-desc {
          color: var(--on-surface);
          font-size: 12px;
          line-height: 1.5;
          margin-top: 8px;
        }

        .package-cta {
          margin-top: 12px;
          color: var(--on-primary);
          font-size: 13px;
          font-weight: 800;
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
          color: var(--secondary);
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
          color: var(--tertiary);
          text-decoration: none;
          font-size: 11px;
        }

        .restore-btn {
          width: 100%;
          background: none;
          border: none;
          color: var(--secondary);
          font-size: 12px;
          cursor: pointer;
          text-decoration: underline;
          margin-bottom: 12px;
          padding: 8px;
        }

        .restore-success,
        .restore-not-found,
        .error-msg {
          border-radius: 12px;
          padding: 10px 12px;
          margin-bottom: 12px;
          font-size: 12px;
          font-weight: 700;
        }

        .restore-success {
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: var(--on-secondary-container);
        }

        .restore-not-found,
        .error-msg {
          background: rgba(249, 115, 22, 0.10);
          border: 1px solid rgba(249, 115, 22, 0.18);
          color: var(--on-tertiary-container);
        }

        .processing-overlay {
          position: absolute;
          inset: 0;
          background: rgba(4, 20, 16, 0.68);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 24px;
        }

        .spinner {
          width: 34px;
          height: 34px;
          border-radius: 999px;
          border: 3px solid rgba(255,255,255,0.2);
          border-top-color: var(--tertiary);
          animation: spin 0.9s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProUpgrade;

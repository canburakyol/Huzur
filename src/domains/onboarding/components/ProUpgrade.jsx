import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
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
    // RevenueCat names the yearly package "$rc_annual"; Turkish titles say "Yıllık" with a dotless ı.
    return /year|annual/.test(identifier) || /yıl|yil|year|annual/.test(title);
  }
  if (normalizedRecommendation === 'monthly') {
    return /month/.test(identifier) || /aylık|aylik|month/.test(title);
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
      badge: i18n.t('proReferral.badge'),
      title: i18n.t('proReferral.activeTitle'),
      subtitle: isExpiringSoon
        ? i18n.t('proReferral.expiringSoon', { time: hours > 0 ? i18n.t('proReferral.hours', { count: hours }) : i18n.t('proReferral.minutes', { count: minutes }) })
        : i18n.t('proReferral.remaining', { time: `${i18n.t('proReferral.hours', { count: hours })} ${i18n.t('proReferral.minutes', { count: minutes })}` }),
      cta: null
    };
  }

  if (referralProgress?.invitedByCode && !referralProgress.inviteeEligible) {
    const steps = [
      referralProgress.inviteAcceptedAt && i18n.t('proReferral.steps.signup'),
      referralProgress.onboardingCompletedAt && i18n.t('proReferral.steps.onboarding'),
      referralProgress.firstIbadahCompletedAt && i18n.t('proReferral.steps.firstIbadah')
    ].filter(Boolean);

    const completedSteps = steps.length;
    const totalSteps = 3;

    return {
      isReferralPending: true,
      badge: i18n.t('proReferral.pendingBadge', { done: completedSteps, total: totalSteps }),
      title: i18n.t('proReferral.pendingTitle', { count: totalSteps - completedSteps }),
      subtitle: i18n.t('proReferral.pendingSubtitle', { count: totalSteps - completedSteps }),
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
        <button type="button" className="close-btn" onClick={closeModal} aria-label={t('common.close', 'Kapat')}>
          <X size={22} strokeWidth={1.75} />
        </button>

        <div className="pro-header">
          <div className="crown-icon">
            <Crown size={40} strokeWidth={1.5} color="var(--gold-on-brand)" fill="var(--gold-on-brand)" aria-hidden="true" />
          </div>
          <div className="moment-chip">
            <Sparkles size={14} />
            {referralCopy.badge || uiCopy.accent}
          </div>
          <h2>{referralCopy.title || uiCopy.title}</h2>
          <p>{referralCopy.subtitle || uiCopy.subtitle}</p>
        </div>

        <div className="pro-body">
        <div className="social-proof">
          <p>{uiCopy.socialProof}</p>
        </div>

        {proDetails?.active && proDetails.source === 'referral_reward' && (
          <div className="referral-active-banner">
            <p>
              {t('proReferral.activeBanner', 'Arkadaşının hediyesi ile Pro aktifsin.')}
              {proDetails.remaining.isExpiringSoon && (
                <span className="expiring-soon">
                  {' '}{t('proReferral.endingSoon', { time: proDetails.remaining.hours > 0
                    ? t('proReferral.hours', { count: proDetails.remaining.hours })
                    : t('proReferral.minutes', { count: proDetails.remaining.minutes }), defaultValue: 'Süre dolmak üzere: {{time}} kaldı' })}
                </span>
              )}
            </p>
          </div>
        )}

        <div className="features-list">
          {uiCopy.features.map((feature) => (
            <div key={feature.title} className="feature-item">
              <div className="feature-icon"><Check size={16} strokeWidth={2.25} aria-hidden="true" /></div>
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

        <button type="button" className="restore-btn hz-btn hz-btn--secondary" onClick={handleRestore} disabled={processing}>
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
        </div>

        {processing && (
          <div className="processing-overlay">
            <div className="spinner"></div>
          </div>
        )}
      </div>

      {legalDoc === 'privacy' && <PrivacyPolicy onClose={() => setLegalDoc(null)} />}
      {legalDoc === 'terms' && <TermsOfService onClose={() => setLegalDoc(null)} />}

      <style>{`
        .pro-modal-overlay {
          position: fixed;
          inset: 0;
          background: color-mix(in srgb, var(--ink) 55%, transparent);
          backdrop-filter: blur(6px);
          /* above .feature-route-shell > .bottom-nav (1500): a purchase modal must cover navigation */
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-4);
          font-family: var(--font-sans);
        }

        .pro-modal {
          background: var(--paper);
          color: var(--ink);
          width: 100%;
          max-width: 420px;
          border-radius: var(--radius-xl);
          position: relative;
          border: 1px solid var(--line);
          box-shadow: var(--elevation-2);
          max-height: 90vh;
          overflow-y: auto;
        }

        .close-btn {
          position: absolute;
          top: var(--space-3);
          right: var(--space-3);
          background: color-mix(in srgb, var(--on-brand) 14%, transparent);
          border: 0;
          color: var(--on-brand);
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          display: grid;
          place-items: center;
          cursor: pointer;
          z-index: 1;
        }

        .pro-header {
          background: var(--brand);
          color: var(--on-brand);
          text-align: center;
          padding: var(--space-6) var(--space-5) var(--space-5);
        }

        .crown-icon { display: flex; justify-content: center; margin-bottom: var(--space-2); }

        .moment-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--gold-on-brand);
          font: 700 11px/14px var(--font-sans);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: var(--space-2);
        }

        .pro-header h2 {
          color: var(--on-brand);
          margin: 0 0 var(--space-2);
          font: 600 28px/34px var(--font-display);
          letter-spacing: -0.01em;
        }

        .pro-header p {
          margin: 0;
          color: var(--on-brand);
          opacity: 0.88;
          font: 400 15px/22px var(--font-sans);
        }

        .pro-body {
          display: grid;
          gap: var(--space-4);
          padding: var(--space-5);
        }

        .social-proof p {
          margin: 0;
          text-align: center;
          color: var(--ink-muted);
          font: 500 13px/18px var(--font-sans);
        }

        .referral-active-banner {
          background: var(--brand-soft);
          border-radius: var(--radius-md);
          padding: var(--space-3) var(--space-4);
          text-align: center;
        }

        .referral-active-banner p {
          margin: 0;
          color: var(--brand-ink);
          font: 600 13px/18px var(--font-sans);
        }

        .referral-active-banner .expiring-soon { color: var(--gold-ink); font-weight: 700; }

        .features-list {
          display: grid;
          background: var(--paper-raised);
          border: 1px solid var(--line);
          border-radius: var(--radius-lg);
        }

        .feature-item {
          display: flex;
          gap: var(--space-3);
          align-items: flex-start;
          padding: var(--space-3) var(--space-4);
        }

        .feature-item + .feature-item { border-top: 1px solid var(--line); }

        .feature-icon {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-full);
          background: var(--brand-soft);
          color: var(--brand-ink);
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }

        .feature-text strong {
          display: block;
          color: var(--ink);
          margin-bottom: 2px;
          font: 600 15px/20px var(--font-sans);
        }

        .feature-text p {
          margin: 0;
          color: var(--ink-muted);
          font: 400 13px/18px var(--font-sans);
        }

        .packages-container { display: grid; gap: var(--space-3); }

        .packages-container .loading { color: var(--ink-muted); text-align: center; }

        .package-card {
          position: relative;
          text-align: left;
          border: 1px solid var(--line);
          background: var(--paper-raised);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          cursor: pointer;
          color: var(--ink);
          font-family: var(--font-sans);
          box-shadow: var(--elevation-1);
        }

        .package-card.popular {
          border: 2px solid var(--brand);
          padding: calc(var(--space-4) - 1px);
        }

        .package-card:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }

        .popular-tag {
          position: absolute;
          top: -11px;
          left: var(--space-4);
          background: var(--brand);
          color: var(--gold-on-brand);
          font: 700 11px/14px var(--font-sans);
          letter-spacing: 0.1em;
          padding: 4px 10px;
          border-radius: var(--radius-full);
        }

        .package-title { color: var(--ink-muted); font: 600 13px/18px var(--font-sans); }

        .package-price {
          color: var(--ink);
          font: 600 26px/32px var(--font-display);
          margin-top: 2px;
        }

        .package-desc {
          color: var(--ink-muted);
          font: 400 13px/18px var(--font-sans);
          margin-top: var(--space-1);
        }

        .package-cta {
          margin-top: var(--space-3);
          color: var(--brand-ink);
          font: 600 14px/20px var(--font-sans);
        }

        .package-card.popular .package-cta {
          background: var(--brand);
          color: var(--on-brand);
          border-radius: var(--radius-md);
          min-height: 44px;
          display: grid;
          place-items: center;
        }

        .subscription-terms {
          background: var(--paper-sunken);
          border-radius: var(--radius-md);
          padding: var(--space-3) var(--space-4);
        }

        .subscription-terms p {
          margin: 0 0 4px;
          font: 400 12px/17px var(--font-sans);
          color: var(--ink-muted);
        }

        .subscription-terms p:last-child { margin-bottom: 0; }

        .legal-links { margin-top: var(--space-2) !important; text-align: center; }

        .legal-links .legal-link-btn {
          background: none;
          border: 0;
          padding: 0;
          font: inherit;
          color: var(--brand-ink);
          text-decoration: underline;
          cursor: pointer;
        }

        .restore-btn { width: 100%; }

        .restore-success,
        .restore-not-found,
        .error-msg {
          border-radius: var(--radius-md);
          padding: var(--space-2) var(--space-3);
          font: 600 13px/18px var(--font-sans);
          background: var(--paper-sunken);
        }

        .restore-success { color: var(--success); }
        .restore-not-found, .error-msg { color: var(--danger); }

        .processing-overlay {
          position: absolute;
          inset: 0;
          background: color-mix(in srgb, var(--paper) 70%, transparent);
          display: grid;
          place-items: center;
          border-radius: var(--radius-xl);
        }

        .spinner {
          width: 34px;
          height: 34px;
          border-radius: var(--radius-full);
          border: 3px solid var(--line);
          border-top-color: var(--brand);
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

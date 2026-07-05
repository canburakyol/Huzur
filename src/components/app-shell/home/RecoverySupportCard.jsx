import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ANALYTICS_EVENTS, logEvent, logPremiumRecoveryMomentOpened } from '../../../services/analyticsService';
import {
  buildPremiumMomentAnalyticsPayload,
  getPremiumMoment,
  openPremiumMoment
} from '../../../services/domains/home';
import { getStoredPrimaryGoal } from '../../../utils/primaryGoal';

const RecoverySupportCard = memo(function RecoverySupportCard({ recoveryPlan, isProUser, onSelectFeature }) {
  const { t } = useTranslation();
  if (isProUser || !['at_risk', 'comeback'].includes(recoveryPlan?.riskBand)) {
    return null;
  }

  const premiumMoment = getPremiumMoment({
    isPro: isProUser,
    source: 'home',
    momentType: 'home_recovery_support',
    recoveryBand: recoveryPlan?.riskBand,
    primaryGoal: getStoredPrimaryGoal(),
  });

  const handleOpenAssistant = () => {
    logPremiumRecoveryMomentOpened('home_recovery_support', recoveryPlan.riskBand, recoveryPlan.feature);
    onSelectFeature('assistant', 'home_recovery_support');
  };

  const handleOpenPremium = () => {
    logPremiumRecoveryMomentOpened('home_recovery_support', recoveryPlan.riskBand, 'premium_upgrade');
    logEvent(ANALYTICS_EVENTS.PREMIUM_MOMENT_OPENED, buildPremiumMomentAnalyticsPayload(premiumMoment));
    openPremiumMoment(premiumMoment);
  };

  return (
    <div
      className="settings-card reveal-stagger bg-white rounded-3xl border-huzur-sage-100 shadow-huzur-soft"
      style={{
        margin: '0 5px 16px',
        padding: '22px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch'
      }}
    >
      <div style={{ fontSize: '0.72rem', fontWeight: '900', color: 'var(--text-secondary)', fontFamily: 'var(--font-main)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
        {t('homeFeed.recovery.eyebrow')}
      </div>
      <div style={{ fontSize: '1.1rem', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: '6px' }}>
        {t('homeFeed.recovery.title')}
      </div>
      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-main)', lineHeight: '1.55', fontWeight: '600', marginBottom: '14px' }}>
        {t('homeFeed.recovery.description')}
      </div>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={handleOpenAssistant}
          className="hover-lift"
          style={{
            border: '1px solid color-mix(in srgb, var(--secondary) 20%, transparent)',
            borderRadius: '16px',
            background: 'color-mix(in srgb, var(--secondary) 12%, transparent)',
            color: 'var(--primary)',
            padding: '12px 14px',
            fontFamily: 'var(--font-main)',
            fontWeight: '700',
            cursor: 'pointer',
            flex: '1 1 190px'
          }}
        >
          {t('homeFeed.recovery.assistantBtn')}
        </button>
        {premiumMoment.showUpgrade ? (
          <button
            onClick={handleOpenPremium}
            className="hover-lift"
            style={{
              border: '1px solid color-mix(in srgb, var(--tertiary) 20%, transparent)',
              borderRadius: '16px',
              background: 'color-mix(in srgb, var(--tertiary) 12%, transparent)',
              color: 'var(--text-primary)',
              padding: '12px 14px',
              fontFamily: 'var(--font-main)',
              fontWeight: '700',
              cursor: 'pointer',
              flex: '1 1 190px'
            }}
          >
            {t('homeFeed.recovery.proBtn')}
          </button>
        ) : null}
      </div>
    </div>
  );
});

export default RecoverySupportCard;

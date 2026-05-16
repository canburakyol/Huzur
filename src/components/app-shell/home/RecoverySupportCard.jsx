import { memo } from 'react';
import { ANALYTICS_EVENTS, logEvent, logPremiumRecoveryMomentOpened } from '../../../services/analyticsService';
import {
  buildPremiumMomentAnalyticsPayload,
  getPremiumMoment,
  openPremiumMoment
} from '../../../services/domains/home';
import { getStoredPrimaryGoal } from '../../../utils/primaryGoal';

const RecoverySupportCard = memo(function RecoverySupportCard({ recoveryPlan, isProUser, onSelectFeature }) {
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
      className="settings-card reveal-stagger"
      style={{
        margin: '0 5px 16px',
        padding: '18px 18px',
        flexDirection: 'column',
        alignItems: 'stretch',
        borderRadius: '22px',
        background: 'linear-gradient(145deg, rgba(212, 175, 55, 0.14), rgba(15, 118, 110, 0.12))',
        border: '1px solid rgba(212, 175, 55, 0.22)'
      }}
    >
      <div style={{ fontSize: '0.72rem', fontWeight: '900', color: 'var(--nav-accent)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
        Derin rehberlik momenti
      </div>
      <div style={{ fontSize: '0.98rem', fontWeight: '900', color: 'var(--nav-text)', marginBottom: '6px' }}>
        Bugun kendine daha sakin bir destek acabilirsin
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--nav-text-muted)', lineHeight: '1.55', fontWeight: '600', marginBottom: '14px' }}>
        Huzur Rehberi ile bugunluk tek bir adim belirle, haftalik ritmini tekrar yumusak bicimde kur.
      </div>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={handleOpenAssistant}
          className="hover-lift"
          style={{
            border: 'none',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--nav-accent), var(--bg-emerald-light))',
            color: '#fff',
            padding: '12px 14px',
            fontWeight: '900',
            cursor: 'pointer',
            flex: '1 1 190px'
          }}
        >
          Huzur Rehberi'ni ac
        </button>
        {premiumMoment.showUpgrade ? (
          <button
            onClick={handleOpenPremium}
            className="hover-lift"
            style={{
              border: '1px solid rgba(212, 175, 55, 0.28)',
              borderRadius: '14px',
              background: 'rgba(212, 175, 55, 0.12)',
              color: 'var(--nav-text)',
              padding: '12px 14px',
              fontWeight: '900',
              cursor: 'pointer',
              flex: '1 1 190px'
            }}
          >
            Pro destegi gor
          </button>
        ) : null}
      </div>
    </div>
  );
});

export default RecoverySupportCard;

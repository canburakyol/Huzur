import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Gift, X, Zap } from 'lucide-react';
import { storageService } from '../services/storageService';
import { useGamification } from '../hooks/useGamification';
import { toLocalDateKey } from '../services/engagementSummaryService';
import { logEvent } from '../services/analyticsService';
import { getRecoveryLoopPlan, persistRecoverySessionReference } from '../services/recoveryLoopService';

const COMEBACK_KEY = 'huzur_comeback_bonus';
const LAST_VISIT_KEY = 'huzur_last_visit_date';
const INACTIVE_THRESHOLD_DAYS = 3;
const BONUS_DURATION_HOURS = 24;
const BONUS_XP_AMOUNT = 100;

const parseDateValue = (value) => {
  if (!value) return null;

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const diffInDays = (fromValue, toValue) => {
  const fromDate = parseDateValue(fromValue);
  const toDate = parseDateValue(toValue);

  if (!fromDate || !toDate) return 0;

  const fromStart = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const toStart = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
  return Math.max(0, Math.round((toStart - fromStart) / (1000 * 60 * 60 * 24)));
};

const getInitialBonusState = () => {
  const today = new Date();
  const todayKey = toLocalDateKey(today);
  const legacyToday = today.toDateString();
  const lastVisitKey = storageService.getString(LAST_VISIT_KEY, '');
  const storedBonus = storageService.getItem(COMEBACK_KEY, {});

  const hasExpiredMultiplier = storedBonus.multiplierActive
    && storedBonus.multiplierExpiry
    && new Date(storedBonus.multiplierExpiry) <= new Date();

  const normalizedBonus = {
    pendingDateKey: storedBonus.pendingDateKey || '',
    claimedDateKey: storedBonus.claimedDateKey || '',
    inactiveDays: Number(storedBonus.inactiveDays) || 0,
    multiplierActive: hasExpiredMultiplier ? false : storedBonus.multiplierActive === true,
    multiplierExpiry: hasExpiredMultiplier ? '' : (storedBonus.multiplierExpiry || '')
  };

  const alreadyClaimedToday = normalizedBonus.claimedDateKey === todayKey || storedBonus.claimedDate === legacyToday;
  let shouldShow = false;
  let inactiveDays = normalizedBonus.inactiveDays;

  if (!alreadyClaimedToday && normalizedBonus.pendingDateKey) {
    shouldShow = true;
  } else if (lastVisitKey) {
    inactiveDays = diffInDays(lastVisitKey, todayKey);
    if (inactiveDays >= INACTIVE_THRESHOLD_DAYS) {
      normalizedBonus.pendingDateKey = todayKey;
      normalizedBonus.claimedDateKey = '';
      normalizedBonus.inactiveDays = inactiveDays;
      shouldShow = true;
    }
  }

  persistRecoverySessionReference(todayKey, lastVisitKey);
  storageService.setString(LAST_VISIT_KEY, todayKey);
  storageService.setItem(COMEBACK_KEY, normalizedBonus);

  return {
    todayKey,
    inactiveDays,
    shouldShow,
    bonusState: normalizedBonus
  };
};

const WelcomeBackBonus = () => {
  const { t } = useTranslation();
  const { addPoints } = useGamification();
  const [initialState] = useState(() => getInitialBonusState());
  const recoveryPlan = getRecoveryLoopPlan();
  const [isOpen, setIsOpen] = useState(initialState.shouldShow);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    if (!initialState.shouldShow) return;

    logEvent('comeback_bonus_shown', {
      inactive_days: initialState.inactiveDays,
      pending_date: initialState.bonusState.pendingDateKey || initialState.todayKey,
      risk_band: recoveryPlan.riskBand,
      primary_goal: recoveryPlan.primaryGoal
    });
  }, [initialState, recoveryPlan.primaryGoal, recoveryPlan.riskBand]);

  const handleClaim = useCallback(() => {
    const claimedAt = new Date();
    const claimedDateKey = toLocalDateKey(claimedAt);
    const bonusExpiry = new Date(claimedAt.getTime() + BONUS_DURATION_HOURS * 60 * 60 * 1000).toISOString();

    storageService.setItem(COMEBACK_KEY, {
      pendingDateKey: '',
      claimedDateKey,
      inactiveDays: 0,
      multiplierActive: true,
      multiplierExpiry: bonusExpiry
    });

    addPoints(BONUS_XP_AMOUNT, {
      applyMultiplier: false,
      source: 'comeback_bonus'
    });

    logEvent('comeback_bonus_claimed', {
      inactive_days: initialState.inactiveDays,
      bonus_xp: BONUS_XP_AMOUNT,
      multiplier_hours: BONUS_DURATION_HOURS,
      recovery_feature: recoveryPlan.feature,
      risk_band: recoveryPlan.riskBand
    });

    setClaimed(true);
    setTimeout(() => setIsOpen(false), 2500);
  }, [addPoints, initialState.inactiveDays, recoveryPlan.feature, recoveryPlan.riskBand]);

  const handleClose = useCallback(() => {
    logEvent('comeback_bonus_dismissed', {
      inactive_days: initialState.inactiveDays,
      pending_date: initialState.bonusState.pendingDateKey || initialState.todayKey,
      risk_band: recoveryPlan.riskBand
    });
    setIsOpen(false);
  }, [initialState, recoveryPlan.riskBand]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10003,
      background: 'rgba(0, 0, 0, 0.88)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      animation: 'comebackFadeIn 0.4s ease'
    }}>
      <div className="settings-card" style={{
        flexDirection: 'column',
        padding: '36px 28px',
        maxWidth: '380px',
        width: '90%',
        position: 'relative',
        border: claimed
          ? '2px solid rgba(34, 197, 94, 0.5)'
          : '1px solid rgba(212, 175, 55, 0.3)',
        boxShadow: claimed
          ? '0 0 40px rgba(34, 197, 94, 0.15)'
          : '0 20px 40px rgba(0,0,0,0.4), 0 0 30px rgba(212, 175, 55, 0.1)',
        textAlign: 'center',
        transition: 'all 0.5s ease'
      }}>
        {!claimed && (
          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              background: 'var(--nav-hover)',
              border: 'none',
              color: 'var(--nav-text-muted)',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        )}

        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 20px',
          background: claimed ? 'rgba(34, 197, 94, 0.15)' : 'rgba(212, 175, 55, 0.12)',
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: claimed ? 'comebackPop 0.5s ease' : 'comebackFloat 2s ease-in-out infinite',
          transition: 'all 0.5s ease'
        }}>
          {claimed
            ? <span style={{ fontSize: '2rem' }}>+</span>
            : <Gift size={36} color="#d4af37" />
          }
        </div>

        <h2 style={{
          margin: '0 0 10px 0',
          fontSize: '1.4rem',
          fontWeight: '950',
          color: 'var(--nav-text)',
          letterSpacing: '-0.5px'
        }}>
          {claimed
            ? t('comeback.claimedTitle', 'Bonus aktif')
            : recoveryPlan.headline
          }
        </h2>

        <p style={{
          margin: '0 0 8px 0',
          fontSize: '0.88rem',
          color: 'var(--nav-text-muted)',
          fontWeight: '600',
          lineHeight: '1.6'
        }}>
          {claimed
            ? t('comeback.claimedDesc', '24 saat boyunca 2x XP bonusun aktif. Kaldigin yerden devam edebilirsin.')
            : `${recoveryPlan.description} ${initialState.inactiveDays || INACTIVE_THRESHOLD_DAYS} gunluk araya ozel bonusun hazir.`
          }
        </p>

        {!claimed && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            margin: '16px 0 24px',
            padding: '16px',
            background: 'var(--nav-hover)',
            borderRadius: '14px',
            border: '1px solid var(--nav-border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
              <Zap size={16} color="#d4af37" />
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#d4af37' }}>
                +{BONUS_XP_AMOUNT} XP {t('comeback.instant', 'aninda')}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
              <span style={{ fontSize: '1rem' }}>x2</span>
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--nav-text)' }}>
                2x XP - {BONUS_DURATION_HOURS} {t('comeback.hours', 'saat')}
              </span>
            </div>
          </div>
        )}

        {!claimed && (
          <button
            onClick={handleClaim}
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, #d4af37, #f59e0b)',
              color: '#fff',
              border: 'none',
              borderRadius: '16px',
              fontSize: '0.95rem',
              fontWeight: '950',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 8px 20px rgba(212, 175, 55, 0.3)',
              transition: 'transform 0.2s ease'
            }}
          >
            <Gift size={18} />
            {`${recoveryPlan.cta} ve bonusu al`}
            <ArrowRight size={16} />
          </button>
        )}
      </div>

      <style>{`
        @keyframes comebackFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes comebackFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes comebackPop {
          0% { transform: scale(0.5); }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default WelcomeBackBonus;

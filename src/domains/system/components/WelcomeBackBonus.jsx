import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Gift, X, Zap } from 'lucide-react';
import { storageService } from '../../../services/storageService';
import { useGamification } from '../../../hooks/useGamification';
import { toLocalDateKey } from '../../../services/engagementSummaryService';
import { logEvent } from '../../../services/analyticsService';
import { getRecoveryLoopPlan, persistRecoverySessionReference } from '../../../services/recoveryLoopService';

const COMEBACK_KEY = 'huzur_comeback_bonus';
const LAST_VISIT_KEY = 'huzur_last_visit_date';
const INACTIVE_THRESHOLD_DAYS = 7;
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
      bottom: '100px', // Just above bottom nav
      left: '16px',
      right: '16px',
      zIndex: 999, // Lower than blocking modals but above content
      display: 'flex',
      justifyContent: 'center',
      pointerEvents: 'none', // Let clicks pass through the container
      animation: 'comebackFadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <div className="settings-card" style={{
        pointerEvents: 'auto', // Re-enable clicks for the card
        flexDirection: 'row',
        alignItems: 'center',
        padding: '16px',
        width: '100%',
        maxWidth: '400px',
        position: 'relative',
        background: 'rgba(20, 20, 20, 0.95)',
        backdropFilter: 'blur(12px)',
        border: claimed
          ? '2px solid rgba(34, 197, 94, 0.5)'
          : '1px solid rgba(212, 175, 55, 0.3)',
        boxShadow: claimed
          ? '0 8px 32px rgba(34, 197, 94, 0.2)'
          : '0 12px 40px rgba(0,0,0,0.5), 0 0 20px rgba(212, 175, 55, 0.15)',
        textAlign: 'left',
        gap: '16px',
        transition: 'all 0.4s ease',
        borderRadius: '24px'
      }}>
        <div style={{
          flexShrink: 0,
          width: '56px',
          height: '56px',
          background: claimed ? 'rgba(34, 197, 94, 0.15)' : 'rgba(212, 175, 55, 0.12)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: claimed ? 'comebackPop 0.5s ease' : 'comebackFloat 2s ease-in-out infinite'
        }}>
          {claimed ? <span style={{ fontSize: '1.5rem', color: '#22c55e', fontWeight: 'bold' }}>✓</span> : <Gift size={28} color="#d4af37" />}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h2 style={{
            margin: 0,
            fontSize: '1rem',
            fontWeight: '800',
            color: 'white',
            letterSpacing: '-0.3px'
          }}>
            {claimed ? t('comeback.claimedTitle', 'Bonus Aktif!') : recoveryPlan.headline}
          </h2>
          <p style={{
            margin: 0,
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.7)',
            fontWeight: '600',
            lineHeight: '1.4'
          }}>
            {claimed
              ? t('comeback.claimedDesc', '24 saat boyunca 2x XP kazanacaksın.')
              : `${initialState.inactiveDays || INACTIVE_THRESHOLD_DAYS} günlük araya özel +${BONUS_XP_AMOUNT} XP hazır.`
            }
          </p>
        </div>

        {!claimed && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
            <button
              onClick={handleClaim}
              style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #d4af37, #f59e0b)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
              }}
            >
              {t('comeback.claimButton', 'Kazan')}
            </button>
            <button
              onClick={handleClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                padding: 0
              }}
            >
              {t('comeback.maybeLater', 'Belki Sonra')}
            </button>
          </div>
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

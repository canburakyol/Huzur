import { useEffect, useState } from 'react';
import streakService, { recoverCategoryStreak, getCategoryRecoveryStatus } from '../../services/streakService';
import { checkAndNotifyStreakRisk } from '../../services/streakProtectionService';
import { isPro } from '../../services/proService';
import { logger } from '../../utils/logger';
import crashlyticsReporter from '../../utils/crashlyticsReporter';

export function useStreakGuards() {
  const [protectionTarget, setProtectionTarget] = useState(null);
  const [streak24hRecovery, setStreak24hRecovery] = useState(null);

  useEffect(() => {
    const checkProtection = async () => {
      setTimeout(async () => {
        await checkAndNotifyStreakRisk();
        const data = streakService.getStreakData();
        const today = new Date().toISOString().split('T')[0];

        const prayerStreak = data.streaks?.prayer;
        if (
          prayerStreak &&
          prayerStreak.count > 0 &&
          prayerStreak.lastDate &&
          prayerStreak.lastDate !== today &&
          prayerStreak.freezeTokens > 0
        ) {
          const lastDate = new Date(prayerStreak.lastDate);
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);

          if (lastDate < yesterday.setHours(0, 0, 0, 0)) {
            setProtectionTarget({ category: 'prayer', data: prayerStreak });
          }
        }

        const recoveryStatus = getCategoryRecoveryStatus('prayer');
        if (recoveryStatus.canRecover) {
          setStreak24hRecovery(recoveryStatus);
        }
      }, 3000);
    };

    checkProtection();
  }, []);

  const handleConfirm24hRecovery = () => {
    const result = recoverCategoryStreak('prayer');
    if (result.success) {
      setStreak24hRecovery(null);
      window.dispatchEvent(
        new CustomEvent('streak:activity', {
          detail: { category: 'prayer', count: result.count }
        })
      );
    }
  };

  const handleRewarded24hRecovery = async () => {
    if (isPro()) {
      handleConfirm24hRecovery();
      return { success: true, source: 'pro_bypass' };
    }

    try {
      const { showRewardedAd } = await import('../../services/admobService');
      const rewardedResult = await showRewardedAd();

      if (!rewardedResult?.success) {
        void crashlyticsReporter.logCrash(
          `[StreakRecovery] rewarded_not_granted reason=${rewardedResult?.error || 'unknown'}`
        );
        return rewardedResult || { success: false, error: 'Rewarded ad failed' };
      }

      handleConfirm24hRecovery();
      void crashlyticsReporter.logCrash('[StreakRecovery] rewarded_recovery_applied');
      return rewardedResult;
    } catch (error) {
      logger.warn('[useStreakGuards] Rewarded recovery failed', error);
      void crashlyticsReporter.logExceptionWithContext(error, {
        surface: 'streak_rewarded_recovery'
      });
      return { success: false, error: error?.message || 'Rewarded recovery failed' };
    }
  };

  const handleUseProtectionToken = () => {
    if (!protectionTarget?.category) return;
    streakService.useFreezeToken(protectionTarget.category);
    setProtectionTarget(null);
  };

  return {
    protectionTarget,
    setProtectionTarget,
    streak24hRecovery,
    setStreak24hRecovery,
    handleConfirm24hRecovery,
    handleRewarded24hRecovery,
    handleUseProtectionToken
  };
}

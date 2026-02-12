import { useEffect, useState } from 'react';
import streakService, { recoverCategoryStreak, getCategoryRecoveryStatus } from '../../services/streakService';
import { checkAndNotifyStreakRisk } from '../../services/streakProtectionService';

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
    handleUseProtectionToken
  };
}

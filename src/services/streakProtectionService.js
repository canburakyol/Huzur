import streakService from './streakService';
import smartNotificationService from './smartNotificationService';

/**
 * Check if the user is at risk of losing their streak and send notifications if needed.
 */
export const checkAndNotifyStreakRisk = async () => {
  const data = streakService.getStreakData();
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const currentHour = now.getHours();
  
  // Overall app streak check
  if (data.lastVisitDate && data.lastVisitDate !== today && data.currentStreak > 0) {
    if (currentHour >= 20) {
      await smartNotificationService.showInstantNotification(
        '🔥 Uygulama Seriniz Tehlikede!',
        `Bugün henüz uygulamaya girmediniz. ${data.currentStreak} günlük serinizi korumak için son saatler!`,
        { type: 'streak_risk', category: 'app', level: 'urgent' }
      );
    }
  }

  // Categorized streaks check
  if (data.streaks) {
    for (const [category, categoryData] of Object.entries(data.streaks)) {
      if (categoryData.count > 0 && categoryData.lastDate !== today) {
        if (currentHour >= 19) {
          await smartNotificationService.showInstantNotification(
            '🕌 Seri Hatırlatması',
            `Bugün ${category === 'prayer' ? 'namazlarınızı' : category} kaydetmeyi unuttunuz mu?`,
            { type: 'streak_risk', category, level: 'warning' }
          );
        }
      }
    }
  }
};

/**
 * Initialize protection checks
 */
export const initializeStreakProtection = () => {
  // In a real app, this might set up a background task or a periodic interval.
  // For now, we'll just check once on init.
  checkAndNotifyStreakRisk();
};

export default {
  checkAndNotifyStreakRisk,
  initializeStreakProtection
};

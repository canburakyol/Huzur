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

  if (data.lastVisitDate && data.lastVisitDate !== today && data.currentStreak > 0 && currentHour >= 20) {
    await smartNotificationService.showInstantNotification(
      'Uygulama seriniz tehlikede',
      `Bugun henuz uygulamaya girmediniz. ${data.currentStreak} gunluk serinizi korumak icin son saatler.`,
      { type: 'streak_risk', category: 'app', level: 'urgent' }
    );
  }

  if (!data.streaks) {
    return;
  }

  for (const [category, categoryData] of Object.entries(data.streaks)) {
    if (categoryData.count > 0 && categoryData.lastDate !== today && currentHour >= 19) {
      await smartNotificationService.showInstantNotification(
        'Seri hatirlatmasi',
        `Bugun ${category === 'prayer' ? 'namazlarinizi' : category} kaydetmeyi unuttunuz mu?`,
        { type: 'streak_risk', category, level: 'warning' }
      );
    }
  }
};

/**
 * Initialize protection checks.
 */
export const initializeStreakProtection = () => {
  checkAndNotifyStreakRisk();
};

export default {
  checkAndNotifyStreakRisk,
  initializeStreakProtection
};

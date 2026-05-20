import streakService from './streakService';
import smartNotificationService from './smartNotificationService';
import i18n from '../i18n';

interface StreakData {
  lastVisitDate: string | null;
  currentStreak: number;
  streaks?: Record<string, { count: number; lastDate: string | null }>;
}

interface NotificationMetadata {
  type: string;
  category: string;
  level: string;
}

export const checkAndNotifyStreakRisk = async (): Promise<void> => {
  const data = streakService.getStreakData() as StreakData;
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const currentHour = now.getHours();

  if (data.lastVisitDate && data.lastVisitDate !== today && data.currentStreak > 0 && currentHour >= 20) {
    await smartNotificationService.showInstantNotification(
      i18n.t('streakProtection.appRiskTitle', 'Uygulama seriniz tehlikede'),
      i18n.t('streakProtection.appRiskBody', 'Bugün henüz uygulamaya girmediniz. {{count}} günlük serinizi korumak için son saatler.', { count: data.currentStreak }),
      { type: 'streak_risk', category: 'app', level: 'urgent' } as NotificationMetadata
    );
  }

  if (!data.streaks) {
    return;
  }

  for (const [category, categoryData] of Object.entries(data.streaks)) {
    if (categoryData.count > 0 && categoryData.lastDate !== today && currentHour >= 19) {
      await smartNotificationService.showInstantNotification(
        i18n.t('streakProtection.categoryRiskTitle', 'Seri hatırlatması'),
        i18n.t('streakProtection.categoryRiskBody', 'Bugün {{category}} kaydetmeyi unuttunuz mu?', {
          category: category === 'prayer' ? i18n.t('streakProtection.categories.prayer', 'namazlarınızı') : category
        }),
        { type: 'streak_risk', category, level: 'warning' } as NotificationMetadata
      );
    }
  }
};

export const initializeStreakProtection = (): void => {
  checkAndNotifyStreakRisk();
};

export default {
  checkAndNotifyStreakRisk,
  initializeStreakProtection
};

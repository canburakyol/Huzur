import { storageService } from './storageService';
import { buildWeeklyEngagementSnapshot, toLocalDateKey } from './engagementSummaryService';
import { getStreakData } from './streakService';
import { getStoredPrimaryGoal } from '../utils/primaryGoal';
import i18n from '../i18n';

const rt = (key: string, fallback: string, options: Record<string, unknown> = {}): string =>
  i18n.t(`recovery.${key}`, { ...options, defaultValue: fallback });

const LAST_VISIT_KEY = 'huzur_last_visit_date';
const RECOVERY_SESSION_DAY_KEY = 'huzur_recovery_session_day';
const RECOVERY_SESSION_LAST_VISIT_KEY = 'huzur_recovery_session_last_visit';

type RiskBand = 'steady' | 'cooling' | 'at_risk' | 'comeback';

type RecoveryLoopState = {
  todayKey: string;
  lastVisitKey: string;
  inactiveDays: number;
  weeklySnapshot: { activeDays: number; [key: string]: unknown };
  primaryGoal: string;
  strongestStreak: number;
  riskBand: RiskBand;
};

type RecoveryLoopPlan = RecoveryLoopState & {
  headline: string;
  description: string;
  cta: string;
  feature: string;
  notificationTitle: string;
  notificationBody: string;
  rewardTone: string;
};

const parseDateValue = (value: string | undefined | null): Date | null => {
  if (!value) return null;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const diffInDays = (fromValue: string | undefined | null, toValue: string | undefined | null): number => {
  const fromDate = parseDateValue(fromValue);
  const toDate = parseDateValue(toValue);
  if (!fromDate || !toDate) return 0;

  const fromStart = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const toStart = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
  return Math.max(0, Math.round((toStart - fromStart) / (1000 * 60 * 60 * 24)));
};

export const persistRecoverySessionReference = (todayKey: string, lastVisitKey = ''): void => {
  if (!todayKey) return;

  const sessionDayKey = storageService.getString(RECOVERY_SESSION_DAY_KEY, '');
  const storedSessionLastVisit = storageService.getString(RECOVERY_SESSION_LAST_VISIT_KEY, '');

  if (sessionDayKey !== todayKey) {
    storageService.setString(RECOVERY_SESSION_DAY_KEY, todayKey);
    storageService.setString(RECOVERY_SESSION_LAST_VISIT_KEY, lastVisitKey || '');
    return;
  }

  if (!storedSessionLastVisit && lastVisitKey) {
    storageService.setString(RECOVERY_SESSION_LAST_VISIT_KEY, lastVisitKey);
  }
};

const getEffectiveLastVisitKey = (todayKey: string): string => {
  const currentLastVisitKey = storageService.getString(LAST_VISIT_KEY, '');
  persistRecoverySessionReference(todayKey, currentLastVisitKey);
  return storageService.getString(RECOVERY_SESSION_LAST_VISIT_KEY, currentLastVisitKey);
};

export const getRecoveryLoopState = (today = new Date()): RecoveryLoopState => {
  const todayKey = toLocalDateKey(today);
  const lastVisitKey = getEffectiveLastVisitKey(todayKey);
  const inactiveDays = diffInDays(lastVisitKey, todayKey);
  const weeklySnapshot = buildWeeklyEngagementSnapshot(7, today);
  const streakData = getStreakData();
  const primaryGoal = getStoredPrimaryGoal();
  const prayerStreak = Number((streakData as { streaks?: { prayer?: { count?: number }; quran?: { count?: number }; zikir?: { count?: number } } })?.streaks?.prayer?.count) || 0;
  const quranStreak = Number((streakData as { streaks?: { prayer?: { count?: number }; quran?: { count?: number }; zikir?: { count?: number } } })?.streaks?.quran?.count) || 0;
  const zikirStreak = Number((streakData as { streaks?: { prayer?: { count?: number }; quran?: { count?: number }; zikir?: { count?: number } } })?.streaks?.zikir?.count) || 0;
  const strongestStreak = Math.max(prayerStreak, quranStreak, zikirStreak, 0);

  let riskBand: RiskBand = 'steady';
  if (inactiveDays >= 5) riskBand = 'comeback';
  else if (inactiveDays >= 2 || weeklySnapshot.activeDays <= 1) riskBand = 'at_risk';
  else if (inactiveDays === 1 || weeklySnapshot.activeDays <= 3) riskBand = 'cooling';

  return {
    todayKey,
    lastVisitKey,
    inactiveDays,
    weeklySnapshot,
    primaryGoal,
    strongestStreak,
    riskBand,
  };
};

export const getRecoveryLoopPlan = (today = new Date()): RecoveryLoopPlan => {
  const state = getRecoveryLoopState(today);
  const { inactiveDays, primaryGoal, riskBand, weeklySnapshot } = state;

  const plan: RecoveryLoopPlan = {
    ...state,
    headline: rt('default.headline', 'Ritmini sakin biçimde sürdür'),
    description: rt('default.description', 'Bugün tek bir küçük adım seçmek ritmi korumak için yeterli olabilir.'),
    cta: rt('cta.default', 'Bugünün adımını aç'),
    feature: 'dailyTasks',
    notificationTitle: rt('default.notificationTitle', 'Bugün tek bir adım yeterli'),
    notificationBody: rt('default.notificationBody', 'Küçük bir dokunuşla günün ritmini sakin biçimde kurabilirsin.'),
    rewardTone: 'gentle_return',
  };

  if (primaryGoal === 'quran_learning') {
    plan.feature = 'dailyQuiz';
    plan.cta = rt('cta.quran', 'Kur\'an yolculuğunu aç');
  } else if (primaryGoal === 'family_consistency') {
    plan.feature = 'family';
    plan.cta = rt('cta.family', 'Aile ritmini aç');
  }

  if (riskBand === 'comeback') {
    plan.headline = rt('comeback.headline', 'Yeniden başlamak için iyi bir an');
    plan.description = rt('comeback.description', '{{days}} günlük aradan sonra yavaş ve yargısız bir dönüş en sağlıklı adım olur.', { days: inactiveDays || 3 });
    plan.notificationTitle = rt('comeback.notificationTitle', 'Yavaşça geri dön');
    plan.notificationBody = rt('comeback.notificationBody', 'Bugün sadece küçük bir başlangıç yapman yeterli.');
    plan.rewardTone = 'comeback';
  } else if (riskBand === 'at_risk') {
    plan.headline = rt('atRisk.headline', 'Ritmi kaybetmeden toparla');
    plan.description = rt('atRisk.description', 'Ritim biraz soğumuş olabilir. Tek bir kolay aksiyonla yeniden tutunabilirsin.');
    plan.notificationTitle = rt('atRisk.notificationTitle', 'Ritmi korumak için kısa bir adım');
    plan.notificationBody = rt('atRisk.notificationBody', 'Büyük hedef değil, sadece bugünü sakin biçimde toparlamak yeterli.');
    plan.rewardTone = 'recovery';
  } else if (riskBand === 'cooling') {
    plan.headline = rt('cooling.headline', 'Bugün ritmi tazele');
    plan.description = rt('cooling.description', 'Kısa bir temas, haftanın akışını yeniden canlandırabilir.');
    plan.notificationTitle = rt('cooling.notificationTitle', 'Bugün niyetini tazele');
    plan.notificationBody = rt('cooling.notificationBody', 'Kısa bir mola ile günün akışına tekrar bağlanabilirsin.');
  } else if (weeklySnapshot.activeDays >= 5) {
    plan.headline = rt('steady.headline', 'Ritmin güzel bir akışta');
    plan.description = rt('steady.description', 'İyi giden ritmi zorlamadan sürdürmek için bugün yine tek bir net adım seç.');
    plan.notificationTitle = rt('steady.notificationTitle', 'Ritmini koruyan küçük adım');
    plan.notificationBody = rt('steady.notificationBody', 'Bugün sakin bir adımla bu istikrarı sürdürebilirsin.');
  }

  return plan;
};

export default {
  getRecoveryLoopState,
  getRecoveryLoopPlan,
  persistRecoverySessionReference,
};

import { storageService } from './storageService';
import { buildWeeklyEngagementSnapshot, toLocalDateKey } from './engagementSummaryService';
import { getStreakData } from './streakService';
import { getStoredPrimaryGoal } from '../utils/primaryGoal';

const LAST_VISIT_KEY = 'huzur_last_visit_date';
const RECOVERY_SESSION_DAY_KEY = 'huzur_recovery_session_day';
const RECOVERY_SESSION_LAST_VISIT_KEY = 'huzur_recovery_session_last_visit';

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

export const persistRecoverySessionReference = (todayKey, lastVisitKey = '') => {
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

const getEffectiveLastVisitKey = (todayKey) => {
  const currentLastVisitKey = storageService.getString(LAST_VISIT_KEY, '');
  persistRecoverySessionReference(todayKey, currentLastVisitKey);
  return storageService.getString(RECOVERY_SESSION_LAST_VISIT_KEY, currentLastVisitKey);
};

export const getRecoveryLoopState = (today = new Date()) => {
  const todayKey = toLocalDateKey(today);
  const lastVisitKey = getEffectiveLastVisitKey(todayKey);
  const inactiveDays = diffInDays(lastVisitKey, todayKey);
  const weeklySnapshot = buildWeeklyEngagementSnapshot(7, today);
  const streakData = getStreakData();
  const primaryGoal = getStoredPrimaryGoal();
  const prayerStreak = Number(streakData?.streaks?.prayer?.count) || 0;
  const quranStreak = Number(streakData?.streaks?.quran?.count) || 0;
  const zikirStreak = Number(streakData?.streaks?.zikir?.count) || 0;
  const strongestStreak = Math.max(prayerStreak, quranStreak, zikirStreak, 0);

  let riskBand = 'steady';
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

export const getRecoveryLoopPlan = (today = new Date()) => {
  const state = getRecoveryLoopState(today);
  const { inactiveDays, primaryGoal, riskBand, weeklySnapshot } = state;

  const plan = {
    ...state,
    headline: 'Ritmini sakin bicimde surdur',
    description: 'Bugun tek bir kucuk adim secmek ritmi korumak icin yeterli olabilir.',
    cta: 'Bugunun adimini ac',
    feature: 'dailyTasks',
    notificationTitle: 'Bugun tek bir adim yeterli',
    notificationBody: 'Kucuk bir dokunusla gunun ritmini sakin bicimde kurabilirsin.',
    rewardTone: 'gentle_return',
  };

  if (primaryGoal === 'quran_learning') {
    plan.feature = 'dailyQuiz';
    plan.cta = 'Kuran yolculugunu ac';
  } else if (primaryGoal === 'family_consistency') {
    plan.feature = 'family';
    plan.cta = 'Aile ritmini ac';
  }

  if (riskBand === 'comeback') {
    plan.headline = 'Yeniden baslamak icin iyi bir an';
    plan.description = `${inactiveDays || 3} gunluk aradan sonra yavas ve yargisiz bir donus en saglikli adim olur.`;
    plan.notificationTitle = 'Yavasca geri don';
    plan.notificationBody = 'Bugun sadece kucuk bir baslangic yapman yeterli.';
    plan.rewardTone = 'comeback';
  } else if (riskBand === 'at_risk') {
    plan.headline = 'Ritmi kaybetmeden toparla';
    plan.description = 'Ritim biraz sogumus olabilir. Tek bir kolay aksiyonla yeniden tutunabilirsin.';
    plan.notificationTitle = 'Ritmi korumak icin kisa bir adim';
    plan.notificationBody = 'Buyuk hedef degil, sadece bugunu sakin bicimde toparlamak yeterli.';
    plan.rewardTone = 'recovery';
  } else if (riskBand === 'cooling') {
    plan.headline = 'Bugun ritmi tazele';
    plan.description = 'Kisa bir temas, haftanin akisini yeniden canlandirabilir.';
    plan.notificationTitle = 'Bugun niyetini tazele';
    plan.notificationBody = 'Kisa bir mola ile gunun akisina tekrar baglanabilirsin.';
  } else if (weeklySnapshot.activeDays >= 5) {
    plan.headline = 'Ritmin guzel bir akista';
    plan.description = 'Iyi giden ritmi zorlamadan surdurmek icin bugun yine tek bir net adim sec.';
    plan.notificationTitle = 'Ritmini koruyan kucuk adim';
    plan.notificationBody = 'Bugun sakin bir adimla bu istikrari surdurebilirsin.';
  }

  return plan;
};

export default {
  getRecoveryLoopState,
  getRecoveryLoopPlan,
  persistRecoverySessionReference,
};

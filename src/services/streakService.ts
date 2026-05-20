import { storageService } from "./storageService";
import { analyticsService } from "./analyticsService";
import { STORAGE_KEYS } from "../constants";

interface Badge {
  id: string;
  days: number;
  emoji: string;
  title: string;
  message: string;
}

interface CategoryStreak {
  count: number;
  lastDate: string | null;
  freezeTokens: number;
  history: Array<{ date: string; type: string }>;
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastVisitDate: string | null;
  totalDays: number;
  earnedBadges: string[];
  recoveryUsed: boolean;
  streaks: {
    prayer: CategoryStreak;
    quran: CategoryStreak;
    zikir: CategoryStreak;
    [key: string]: CategoryStreak;
  };
}

interface StreakResult {
  streakData: StreakData;
  newBadge: Badge | null;
}

interface ActivityResult {
  success: boolean;
  message?: string;
  count?: number;
}

interface FreezeTokenResult {
  success: boolean;
  message?: string;
  tokensRemaining?: number;
}

interface StreakDisplay {
  current: number;
  longest: number;
  total: number;
  isMilestone: boolean;
  emoji: string;
}

interface RecoveryStatus {
  canRecover: boolean;
  daysMissed: number;
  recoveryDeadline: string | null;
}

interface CategoryRecoveryStatus {
  canRecover: boolean;
  category: string;
  deadline: string | null;
  reason: string;
  currentCount?: number;
}

interface CategoryRecoveryResult {
  success: boolean;
  category: string;
  message: string;
  count?: number;
}

const BADGES: Record<string, Badge> = {
  DAY_7: { id: "7_days", days: 7, emoji: "🌟", title: "7 Gün Serisi", message: "Tebrikler! 7 gün boyunca her gün uygulamamızı açtınız!" },
  DAY_15: { id: "15_days", days: 15, emoji: "🔥", title: "15 Gün Serisi", message: "Harika! 2 haftayı aştınız, devam edin!" },
  DAY_30: { id: "30_days", days: 30, emoji: "🏆", title: "30 Gün Serisi", message: "Muhteşem! 1 aylık seri başarısı!" },
  DAY_100: { id: "100_days", days: 100, emoji: "👑", title: "100 Gün Serisi", message: "Efsanevi! 100 gün kesintisiz kullanım!" },
};

const STREAK_DATA_KEY = "huzur_streak_data";

const DEFAULT_STREAK_DATA: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastVisitDate: null,
  totalDays: 0,
  earnedBadges: [],
  recoveryUsed: false,
  streaks: {
    prayer: { count: 0, lastDate: null, freezeTokens: 1, history: [] },
    quran: { count: 0, lastDate: null, freezeTokens: 0, history: [] },
    zikir: { count: 0, lastDate: null, freezeTokens: 0, history: [] },
  },
};

const getTodayString = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

const getDaysDifference = (date1Str: string | null, date2Str: string): number => {
  if (!date1Str || !date2Str) return 0;
  const date1 = new Date(date1Str);
  const date2 = new Date(date2Str);
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export const getStreakData = (): StreakData => {
  return storageService.getItem<StreakData>(STREAK_DATA_KEY, DEFAULT_STREAK_DATA) as StreakData;
};

const saveStreakData = (data: StreakData): void => {
  storageService.setItem(STREAK_DATA_KEY, data);
};

export const checkAndUpdateStreak = (): StreakResult => {
  const today = getTodayString();
  const data = getStreakData();
  let newBadge: Badge | null = null;

  if (data.lastVisitDate === today) {
    return { streakData: data, newBadge: null };
  }

  if (!data.lastVisitDate) {
    data.currentStreak = 1;
    data.totalDays = 1;
    data.lastVisitDate = today;
    data.longestStreak = 1;
    saveStreakData(data);
    return { streakData: data, newBadge: null };
  }

  const daysDiff = getDaysDifference(data.lastVisitDate, today);

  if (daysDiff === 1) {
    data.currentStreak += 1;
    data.totalDays += 1;
    if (data.currentStreak > data.longestStreak) data.longestStreak = data.currentStreak;

    newBadge = checkForNewBadge(data.currentStreak, data.earnedBadges);
    if (newBadge) data.earnedBadges.push(newBadge.id);
  } else {
    // Soft decay: decrease streak by missed days (daysDiff - 1) instead of hard reset to 1
    const missedDays = daysDiff - 1;
    data.currentStreak = Math.max(1, data.currentStreak - missedDays);
    data.totalDays += 1;
  }

  data.lastVisitDate = today;
  saveStreakData(data);
  return { streakData: data, newBadge };
};

const checkForNewBadge = (currentStreak: number, earnedBadges: string[]): Badge | null => {
  const badgesList = Object.values(BADGES);
  for (const badge of badgesList) {
    if (currentStreak === badge.days && !earnedBadges.includes(badge.id)) {
      return badge;
    }
  }
  return null;
};

export const recordActivity = (category: string): ActivityResult => {
  const data = getStreakData();
  if (!data.streaks[category]) {
    data.streaks[category] = { count: 0, lastDate: null, freezeTokens: 0, history: [] };
  }

  const categoryData = data.streaks[category];
  const today = getTodayString();

  if (categoryData.lastDate === today) {
    return { success: true, message: "Already recorded today" };
  }

  const daysDiff = getDaysDifference(categoryData.lastDate, today);

  if (daysDiff === 1) {
    categoryData.count += 1;
  } else if (!categoryData.lastDate) {
    categoryData.count = 1;
  } else {
    // Soft decay: decrease category count by missed days (daysDiff - 1) instead of hard reset to 1
    const missedDays = daysDiff - 1;
    categoryData.count = Math.max(1, categoryData.count - missedDays);
  }

  categoryData.lastDate = today;
  if (!categoryData.history) categoryData.history = [];
  categoryData.history.push({ date: today, type: "activity" });

  const weeklyGoal = storageService.getNumber(STORAGE_KEYS.WEEKLY_GOAL, 3);

  if (categoryData.count > 0 && categoryData.count % 7 === 0) {
    categoryData.freezeTokens += 1;
    analyticsService.logEvent("streak_reward_token", { category, count: categoryData.count });
  }

  saveStreakData(data);
  analyticsService.logStreakIncremented(category, categoryData.count, weeklyGoal);

  window.dispatchEvent(
    new CustomEvent("streak:activity", {
      detail: {
        category,
        count: categoryData.count,
      },
    })
  );

  return { success: true, count: categoryData.count };
};

export const useFreezeToken = (category: string): FreezeTokenResult => {
  const data = getStreakData();
  const categoryData = data.streaks[category];

  if (categoryData && categoryData.freezeTokens > 0) {
    categoryData.freezeTokens -= 1;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    categoryData.lastDate = yesterdayStr;
    categoryData.history.push({ date: yesterdayStr, type: "frozen" });

    saveStreakData(data);
    analyticsService.logStreakRecoveryStarted(category, "freeze_token");
    analyticsService.logStreakRecoveryCompleted(category, categoryData.count);
    return { success: true, tokensRemaining: categoryData.freezeTokens };
  }

  return { success: false, message: "No tokens available" };
};

export const getStreakDisplay = (): StreakDisplay => {
  const data = getStreakData();
  return {
    current: data.currentStreak,
    longest: data.longestStreak,
    total: data.totalDays,
    isMilestone: data.currentStreak >= 15,
    emoji:
      data.currentStreak >= 100
        ? "👑"
        : data.currentStreak >= 30
        ? "🏆"
        : data.currentStreak >= 15
        ? "🔥"
        : data.currentStreak >= 7
        ? "🌟"
        : "✨",
  };
};

export const getEarnedBadges = (): Badge[] => {
  const data = getStreakData();
  return Object.values(BADGES).filter((badge) => data.earnedBadges.includes(badge.id));
};

export const getRecoveryStatus = (): RecoveryStatus => {
  const data = getStreakData();
  const today = getTodayString();

  if (!data.lastVisitDate || data.lastVisitDate === today) {
    return { canRecover: false, daysMissed: 0, recoveryDeadline: null };
  }

  const daysDiff = getDaysDifference(data.lastVisitDate, today);

  if (daysDiff === 2) {
    const lastVisit = new Date(data.lastVisitDate);
    const recoveryDeadline = new Date(lastVisit);
    recoveryDeadline.setDate(recoveryDeadline.getDate() + 2);

    const now = new Date();
    const canRecover = now < recoveryDeadline;

    return {
      canRecover,
      daysMissed: 1,
      recoveryDeadline: recoveryDeadline.toISOString(),
    };
  }

  return { canRecover: false, daysMissed: daysDiff - 1, recoveryDeadline: null };
};

export const recoverStreak = (): { success: boolean; newStreak: number; message: string } => {
  const status = getRecoveryStatus();
  if (!status.canRecover) return { success: false, newStreak: 0, message: "Recovery not possible" };

  const data = getStreakData();
  const today = getTodayString();
  data.lastVisitDate = today;
  data.totalDays += 1;
  saveStreakData(data);
  return { success: true, newStreak: data.currentStreak, message: "Streak recovered!" };
};

export const hasUsedRecovery = (): boolean => getStreakData().recoveryUsed || false;

export const markRecoveryUsed = (): void => {
  const data = getStreakData();
  data.recoveryUsed = true;
  data.recoveryUsedDate = getTodayString();
  saveStreakData(data);
};

export const getCategoryRecoveryStatus = (category = "prayer"): CategoryRecoveryStatus => {
  const data = getStreakData();
  const categoryData = data?.streaks?.[category];

  if (!categoryData?.lastDate || !categoryData?.count) {
    return {
      canRecover: false,
      category,
      deadline: null,
      reason: "no_streak",
    };
  }

  const now = new Date();
  const today = getTodayString();
  if (categoryData.lastDate === today) {
    return {
      canRecover: false,
      category,
      deadline: null,
      reason: "already_active_today",
    };
  }

  const lastDate = new Date(categoryData.lastDate);
  const daysDiff = getDaysDifference(categoryData.lastDate, today);

  if (daysDiff !== 1) {
    return {
      canRecover: false,
      category,
      deadline: null,
      reason: "outside_single_day_gap",
    };
  }

  const recoveryDeadline = new Date(lastDate);
  recoveryDeadline.setHours(23, 59, 59, 999);
  recoveryDeadline.setDate(recoveryDeadline.getDate() + 1);

  const canRecover = now <= recoveryDeadline;

  return {
    canRecover,
    category,
    deadline: recoveryDeadline.toISOString(),
    reason: canRecover ? "within_24h_window" : "window_expired",
    currentCount: categoryData.count,
  };
};

export const recoverCategoryStreak = (category = "prayer"): CategoryRecoveryResult => {
  const status = getCategoryRecoveryStatus(category);
  if (!status.canRecover) {
    return { success: false, category, message: status.reason };
  }

  const data = getStreakData();
  const categoryData = data.streaks?.[category];
  if (!categoryData) {
    return { success: false, category, message: "category_not_found" };
  }

  const today = getTodayString();
  categoryData.lastDate = today;
  categoryData.history = categoryData.history || [];
  categoryData.history.push({ date: today, type: "recovered_24h" });

  saveStreakData(data);
  analyticsService.logStreakRecoveryStarted(category, "24h_window");
  analyticsService.logStreakRecoveryCompleted(category, categoryData.count);

  return {
    success: true,
    category,
    count: categoryData.count,
    message: "recovered",
  };
};

export const getWeeklyGoalPreference = (): number => {
  return storageService.getNumber(STORAGE_KEYS.WEEKLY_GOAL, 3);
};

export const setWeeklyGoalPreference = (goalCount: number, source = "settings"): number => {
  const normalized = [3, 5, 7].includes(goalCount) ? goalCount : 3;
  storageService.setNumber(STORAGE_KEYS.WEEKLY_GOAL, normalized);
  analyticsService.logWeeklyGoalSelected(normalized, source);
  return normalized;
};

export default {
  getStreakData,
  checkAndUpdateStreak,
  getEarnedBadges,
  getStreakDisplay,
  recordActivity,
  useFreezeToken,
  getRecoveryStatus,
  recoverStreak,
  hasUsedRecovery,
  markRecoveryUsed,
  getCategoryRecoveryStatus,
  recoverCategoryStreak,
  getWeeklyGoalPreference,
  setWeeklyGoalPreference,
};

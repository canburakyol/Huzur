import { storageService } from './storageService';
import { getStreakData } from './streakService';

const XP_HISTORY_KEY = 'huzur_xp_history';
const QUIZ_HISTORY_KEY = 'huzur_daily_quiz_history';
const DISCOVERY_HISTORY_KEY = 'huzur_daily_discovery_history';
const DAILY_TASK_HISTORY_KEY = 'huzur_daily_tasks_history';
const ROUTINE_HISTORY_KEY = 'huzur_routine_history';
const MAX_XP_HISTORY_ITEMS = 500;

type XpEntry = {
  at: string;
  dateKey: string;
  baseAmount: number;
  appliedAmount: number;
  source: string;
};

type QuizResult = {
  score: number;
  totalQuestions: number;
  completedAt: string;
};

type DiscoveryEntry = {
  count: number;
  updatedAt: string;
};

type DailyTaskSnapshot = {
  total: number;
  completed: number;
  points: number;
  updatedAt: string;
};

type WeeklyEngagementSnapshot = {
  activeDays: number;
  prayerDays: number;
  quranDays: number;
  dhikrDays: number;
  routinesCompleted: number;
  routineTasksCompleted: number;
  tasksCompleted: number;
  quizzesCompleted: number;
  quizCorrect: number;
  quizQuestions: number;
  discoveryViews: number;
  xpEarned: number;
  hasActivity: boolean;
};

const buildDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const toLocalDateKey = (value: Date | string | number = new Date()): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return buildDateKey(new Date());
  }
  return buildDateKey(date);
};

const parseDateLike = (value: Date | string | number | null | undefined): Date | null => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const startOfDay = (value: Date | string | number | null | undefined): Date | null => {
  const date = parseDateLike(value);
  if (!date) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const getRecentDateKeys = (days = 7, anchor = new Date()): string[] => {
  const base = startOfDay(anchor) || new Date();
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(base);
    date.setDate(base.getDate() - (days - index - 1));
    return toLocalDateKey(date);
  });
};

export const getXpHistory = (): XpEntry[] => storageService.getItem(XP_HISTORY_KEY, []);

export const recordXpEvent = ({ baseAmount = 0, appliedAmount = 0, source = 'general', at = new Date().toISOString() }: { baseAmount?: number; appliedAmount?: number; source?: string; at?: string }): XpEntry | null => {
  if (!Number.isFinite(appliedAmount) || appliedAmount === 0) {
    return null;
  }

  const history = getXpHistory();
  history.push({
    at,
    dateKey: toLocalDateKey(at),
    baseAmount,
    appliedAmount,
    source
  });

  const trimmed = history.slice(-MAX_XP_HISTORY_ITEMS);
  storageService.setItem(XP_HISTORY_KEY, trimmed);
  return trimmed[trimmed.length - 1];
};

export const getDailyQuizHistory = (): Record<string, QuizResult> => storageService.getItem(QUIZ_HISTORY_KEY, {});

export const getDailyQuizResult = (dateKey = toLocalDateKey()): QuizResult | null => {
  const history = getDailyQuizHistory();
  return history[dateKey] || null;
};

export const saveDailyQuizResult = ({ score = 0, totalQuestions = 0, completedAt = new Date().toISOString() }: { score?: number; totalQuestions?: number; completedAt?: string }): QuizResult => {
  const history = getDailyQuizHistory();
  const dateKey = toLocalDateKey(completedAt);

  history[dateKey] = {
    score,
    totalQuestions,
    completedAt
  };

  storageService.setItem(QUIZ_HISTORY_KEY, history);
  return history[dateKey];
};

export const getDiscoveryHistory = (): Record<string, DiscoveryEntry> => storageService.getItem(DISCOVERY_HISTORY_KEY, {});

export const recordDiscoveryView = (count = 1, viewedAt = new Date().toISOString()): DiscoveryEntry | null => {
  if (!Number.isFinite(count) || count <= 0) return null;

  const history = getDiscoveryHistory();
  const dateKey = toLocalDateKey(viewedAt);
  const current = history[dateKey] || { count: 0, updatedAt: null };

  history[dateKey] = {
    count: current.count + count,
    updatedAt: viewedAt
  };

  storageService.setItem(DISCOVERY_HISTORY_KEY, history);
  return history[dateKey];
};

export const getDailyTaskHistory = (): Record<string, DailyTaskSnapshot> => storageService.getItem(DAILY_TASK_HISTORY_KEY, {});

export const saveDailyTasksSnapshot = ({ dateKey = toLocalDateKey(), tasks = [] }: { dateKey?: string; tasks?: Array<{ completed: boolean; points?: number }> }): DailyTaskSnapshot => {
  const history = getDailyTaskHistory();
  const completedTasks = tasks.filter((task) => task.completed);

  history[dateKey] = {
    total: tasks.length,
    completed: completedTasks.length,
    points: completedTasks.reduce((sum, task) => sum + (Number(task.points) || 0), 0),
    updatedAt: new Date().toISOString()
  };

  storageService.setItem(DAILY_TASK_HISTORY_KEY, history);
  return history[dateKey];
};

type StreakHistoryEntry = {
  type: string;
  date: string;
};

const countUniqueActivityDays = (entries: StreakHistoryEntry[], recentKeys: Set<string>): number => {
  const days = new Set<string>();
  entries.forEach((entry) => {
    if (entry?.type !== 'activity') return;
    const dateKey = toLocalDateKey(entry.date);
    if (recentKeys.has(dateKey)) {
      days.add(dateKey);
    }
  });
  return days.size;
};

export const buildWeeklyEngagementSnapshot = (days = 7, anchor = new Date()): WeeklyEngagementSnapshot => {
  const recentKeys = new Set(getRecentDateKeys(days, anchor));
  const streakData = getStreakData() as { streaks?: { prayer?: { history?: StreakHistoryEntry[] }; quran?: { history?: StreakHistoryEntry[] }; zikir?: { history?: StreakHistoryEntry[] } } };
  const quizHistory = getDailyQuizHistory();
  const discoveryHistory = getDiscoveryHistory();
  const dailyTaskHistory = getDailyTaskHistory();
  const routineHistory = storageService.getItem(ROUTINE_HISTORY_KEY, {}) as Record<string, Record<string, { completedTasks?: unknown[]; isFullyCompleted?: boolean }>>;
  const xpHistory = getXpHistory();

  const prayerDays = countUniqueActivityDays(streakData?.streaks?.prayer?.history || [], recentKeys);
  const quranDays = countUniqueActivityDays(streakData?.streaks?.quran?.history || [], recentKeys);
  const dhikrDays = countUniqueActivityDays(streakData?.streaks?.zikir?.history || [], recentKeys);

  let routinesCompleted = 0;
  let routineTasksCompleted = 0;
  Object.entries(routineHistory).forEach(([dateKey, routines]) => {
    if (!recentKeys.has(toLocalDateKey(dateKey))) return;
    Object.values(routines || {}).forEach((routine) => {
      const completedTasks = Array.isArray(routine?.completedTasks) ? routine.completedTasks.length : 0;
      routineTasksCompleted += completedTasks;
      if (routine?.isFullyCompleted) {
        routinesCompleted += 1;
      }
    });
  });

  let tasksCompleted = 0;
  Object.entries(dailyTaskHistory).forEach(([dateKey, snapshot]) => {
    if (!recentKeys.has(toLocalDateKey(dateKey))) return;
    tasksCompleted += Number(snapshot?.completed) || 0;
  });

  let quizzesCompleted = 0;
  let quizCorrect = 0;
  let quizQuestions = 0;
  Object.entries(quizHistory).forEach(([dateKey, result]) => {
    if (!recentKeys.has(toLocalDateKey(dateKey))) return;
    quizzesCompleted += 1;
    quizCorrect += Number(result?.score) || 0;
    quizQuestions += Number(result?.totalQuestions) || 0;
  });

  let discoveryViews = 0;
  Object.entries(discoveryHistory).forEach(([dateKey, result]) => {
    if (!recentKeys.has(toLocalDateKey(dateKey))) return;
    discoveryViews += Number(result?.count) || 0;
  });

  let xpEarned = 0;
  const activeDays = new Set<string>();
  xpHistory.forEach((entry) => {
    const dateKey = entry?.dateKey || toLocalDateKey(entry?.at);
    if (!recentKeys.has(dateKey)) return;
    xpEarned += Number(entry?.appliedAmount) || 0;
    activeDays.add(dateKey);
  });

  Object.entries(dailyTaskHistory).forEach(([dateKey, snapshot]) => {
    if (recentKeys.has(toLocalDateKey(dateKey)) && (Number(snapshot?.completed) || 0) > 0) {
      activeDays.add(toLocalDateKey(dateKey));
    }
  });

  Object.entries(quizHistory).forEach(([dateKey]) => {
    if (recentKeys.has(toLocalDateKey(dateKey))) {
      activeDays.add(toLocalDateKey(dateKey));
    }
  });

  Object.entries(discoveryHistory).forEach(([dateKey, result]) => {
    if (recentKeys.has(toLocalDateKey(dateKey)) && (Number(result?.count) || 0) > 0) {
      activeDays.add(toLocalDateKey(dateKey));
    }
  });

  const hasActivity = [
    prayerDays,
    quranDays,
    dhikrDays,
    routinesCompleted,
    routineTasksCompleted,
    tasksCompleted,
    quizzesCompleted,
    discoveryViews,
    xpEarned
  ].some((value) => value > 0);

  return {
    activeDays: activeDays.size,
    prayerDays,
    quranDays,
    dhikrDays,
    routinesCompleted,
    routineTasksCompleted,
    tasksCompleted,
    quizzesCompleted,
    quizCorrect,
    quizQuestions,
    discoveryViews,
    xpEarned: Math.max(0, xpEarned),
    hasActivity
  };
};

export const getWeekStartDate = (anchor = new Date()): Date => {
  const base = startOfDay(anchor) || new Date();
  const day = base.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(base);
  monday.setDate(base.getDate() + diff);
  return monday;
};

export const getCurrentWeekKey = (anchor = new Date()): string => {
  const weekStart = getWeekStartDate(anchor);
  return toLocalDateKey(weekStart);
};

export const isDateInCurrentWeek = (value: Date | string | number | null | undefined, anchor = new Date()): boolean => {
  const date = startOfDay(value);
  if (!date) return false;

  const weekStart = getWeekStartDate(anchor);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return date >= weekStart && date <= weekEnd;
};

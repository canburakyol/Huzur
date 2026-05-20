import { storageService } from './storageService';

interface AppOpenEntry {
  date: string;
  hour: number;
  ts: number;
}

type ReminderSlot = 'morning' | 'afternoon' | 'evening';

type LifecycleStage = 'first_open' | 'same_day' | 'returning_1d' | 'cooling_2_4d' | 'comeback_5_13d' | 'dormant_14d_plus';

interface RecordAppOpenResult {
  recorded: boolean;
  days_since_last_open: number | null;
  lifecycle_stage: LifecycleStage;
  active_days_14d: number;
  dominant_activity_slot: string;
  previous_open_date: string;
}

interface ActivityPattern {
  morning: number;
  afternoon: number;
  evening: number;
}

const STORAGE_KEY = 'huzur_app_open_history';
const MAX_HISTORY_DAYS = 14;

const FALLBACK_REMINDER_HOURS: Record<ReminderSlot, number> = {
  morning:   10,
  afternoon: 14,
  evening:   18,
};

const getHistory = (): AppOpenEntry[] => {
  return storageService.getItem<AppOpenEntry[]>(STORAGE_KEY) || [];
};

const saveHistory = (history: AppOpenEntry[]): void => {
  storageService.setItem(STORAGE_KEY, history);
};

const getTodayStr = (): string => new Date().toISOString().split('T')[0];

const diffInDays = (fromTs: number, toTs: number): number | null => {
  if (!fromTs || !toTs) return null;
  const fromDate = new Date(fromTs);
  const toDate = new Date(toTs);
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) return null;

  const fromStart = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const toStart = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
  return Math.max(0, Math.round((toStart.getTime() - fromStart.getTime()) / (1000 * 60 * 60 * 24)));
};

export const getLifecycleStage = (daysSinceLastOpen: number | null | undefined): LifecycleStage => {
  if (daysSinceLastOpen === null || daysSinceLastOpen === undefined) return 'first_open';
  if (daysSinceLastOpen <= 0) return 'same_day';
  if (daysSinceLastOpen === 1) return 'returning_1d';
  if (daysSinceLastOpen <= 4) return 'cooling_2_4d';
  if (daysSinceLastOpen <= 13) return 'comeback_5_13d';
  return 'dormant_14d_plus';
};

const getDominantActivitySlot = (history: AppOpenEntry[]): string => {
  const pattern: Record<string, number> = { morning: 0, afternoon: 0, evening: 0, night: 0 };

  history.forEach(({ hour }) => {
    if (hour >= 5 && hour < 12) pattern.morning++;
    else if (hour >= 12 && hour < 17) pattern.afternoon++;
    else if (hour >= 17 && hour < 22) pattern.evening++;
    else pattern.night++;
  });

  return Object.entries(pattern).reduce(
    (best, [slot, count]) => (count > best.count ? { slot, count } : best),
    { slot: 'unknown', count: 0 }
  ).slot;
};

export const recordAppOpen = (): RecordAppOpenResult => {
  const history = getHistory();
  const now = new Date();
  const previousOpen = history.find((item) => Number(item?.ts) > 0) || null;
  const daysSinceLastOpen = previousOpen ? diffInDays(previousOpen.ts, now.getTime()) : null;
  const entry: AppOpenEntry = {
    date: getTodayStr(),
    hour: now.getHours(),
    ts: now.getTime(),
  };

  const recentSameHour = history.find(
    (h) => h.date === entry.date && Math.abs(h.hour - entry.hour) < 1
  );
  if (recentSameHour) {
    return {
      recorded: false,
      days_since_last_open: daysSinceLastOpen,
      lifecycle_stage: getLifecycleStage(daysSinceLastOpen),
      active_days_14d: new Set(history.map((item) => item.date).filter(Boolean)).size,
      dominant_activity_slot: getDominantActivitySlot(history),
      previous_open_date: previousOpen?.date || ''
    };
  }

  history.unshift(entry);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - MAX_HISTORY_DAYS);
  const cutoffTs = cutoff.getTime();
  const trimmed = history.filter((h) => h.ts > cutoffTs);

  saveHistory(trimmed);

  return {
    recorded: true,
    days_since_last_open: daysSinceLastOpen,
    lifecycle_stage: getLifecycleStage(daysSinceLastOpen),
    active_days_14d: new Set(trimmed.map((item) => item.date).filter(Boolean)).size,
    dominant_activity_slot: getDominantActivitySlot(trimmed),
    previous_open_date: previousOpen?.date || ''
  };
};

export const getOptimalReminderHour = (slot: ReminderSlot = 'morning'): number => {
  const history = getHistory();
  if (history.length < 3) {
    return FALLBACK_REMINDER_HOURS[slot] ?? 10;
  }

  const ranges: Record<ReminderSlot, [number, number]> = {
    morning:   [5, 12],
    afternoon: [12, 17],
    evening:   [17, 22],
  };
  const [rangeStart, rangeEnd] = ranges[slot] ?? [5, 12];

  const hourCounts: Record<number, number> = {};
  history.forEach(({ hour }) => {
    if (hour >= rangeStart && hour < rangeEnd) {
      hourCounts[hour] = (hourCounts[hour] ?? 0) + 1;
    }
  });

  if (Object.keys(hourCounts).length === 0) {
    return FALLBACK_REMINDER_HOURS[slot] ?? 10;
  }

  const optimalHour = Object.entries(hourCounts).reduce(
    (best, [hour, count]) => (count > best.count ? { hour: Number(hour), count } : best),
    { hour: FALLBACK_REMINDER_HOURS[slot], count: 0 }
  ).hour;

  return optimalHour;
};

export const getActivityPattern = (): ActivityPattern => {
  const history = getHistory();
  const pattern: ActivityPattern = { morning: 0, afternoon: 0, evening: 0 };

  history.forEach(({ hour }) => {
    if (hour >= 5 && hour < 12)  pattern.morning++;
    else if (hour >= 12 && hour < 17) pattern.afternoon++;
    else if (hour >= 17 && hour < 22) pattern.evening++;
  });

  return pattern;
};

export const clearActivityHistory = (): void => {
  storageService.removeItem(STORAGE_KEY);
};

export default {
  recordAppOpen,
  getOptimalReminderHour,
  getActivityPattern,
  clearActivityHistory,
  getLifecycleStage
};

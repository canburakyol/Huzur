import { STORAGE_KEYS } from '../constants';
import { storageService } from './storageService';
import { getActivityPattern } from './userActivityTracker';
import { getCurrentWeekKey, buildWeeklyEngagementSnapshot } from './engagementSummaryService';
import { getCurrentUserId } from './authService';
import { getStreakData, getWeeklyGoalPreference } from './streakService';
import { getStoredPrimaryGoal } from '../utils/primaryGoal';

type StreakData = {
  // Callers pass the gamification shape (current/longest); storage uses currentStreak/longestStreak.
  current?: number;
  longest?: number;
  currentStreak?: number;
  longestStreak?: number;
  streaks?: Record<string, { count: number }>;
}

type NextPrayer = {
  key?: string;
  name?: string;
}

type Family = {
  id?: string;
  name?: string;
  membersDetails?: unknown[];
}

type FamilyWeeklyGoal = {
  title?: string;
  currentValue?: number;
  targetValue?: number;
}

type DailyContent = {
  esma?: { name?: string; sourceMeta?: unknown };
  dailyDua?: { title?: string; source?: string; sourceMeta?: unknown };
  dua?: { source?: string };
  verse?: { reference?: string; sourceMeta?: unknown };
  campaign?: { id?: string };
  hadith?: { sourceMeta?: unknown };
}

type NotificationPrefs = {
  reminder?: boolean;
  quietHoursEnabled?: boolean;
}

type AiContextResult = {
  userId: string | null;
  activeTab: string;
  activeFeature: string | null;
  isProUser: boolean;
  locationName: string;
  primaryGoal: string | null;
  userIntentSegment: string;
  weeklyGoalPreference: number;
  weekKey: string;
  lastFeature: string | null;
  streak: {
    current: number;
    longest: number;
    prayerCount: number;
    quranCount: number;
    zikirCount: number;
  };
  prayer: {
    nextPrayer: string | null;
    nextPrayerLabel: string | null;
    timings: unknown;
  };
  dailyContent: {
    esmaName: string;
    duaTitle: string;
    verseReference: string;
    campaignId: string;
    sources: unknown[];
  } | null;
  activityPattern: { morning: number; afternoon: number; evening: number };
  weeklySnapshot: unknown;
  notificationPrefs: {
    reminder: boolean;
    quietHoursEnabled: boolean;
  };
  social: {
    family: { id: string | null; name: string; memberCount: number } | null;
    familyWeeklyGoal: { title: string; currentValue: number; targetValue: number } | null;
    socialSummary: unknown;
  };
}

type BuildAiContextOptions = {
  activeTab?: string;
  activeFeature?: string | null;
  streakData?: Partial<StreakData> | null;
  dailyContent?: DailyContent | null;
  timings?: unknown;
  nextPrayer?: NextPrayer | null;
  locationName?: string;
  isProUser?: boolean;
  family?: Family | null;
  familyWeeklyGoal?: FamilyWeeklyGoal | null;
  socialSummary?: unknown;
}

const getLastFeature = (): string | null => storageService.getItem('huzur_last_feature', null);
const getStoredNotificationPrefs = (): NotificationPrefs => storageService.getItem('huzur_notification_prefs', {});

export const buildAiContext = ({
  activeTab = 'home',
  activeFeature = null,
  streakData = null,
  dailyContent = null,
  timings = null,
  nextPrayer = null,
  locationName = '',
  isProUser = false,
  family = null,
  familyWeeklyGoal = null,
  socialSummary = null,
}: BuildAiContextOptions = {}): AiContextResult => {
  const fullStreakData = getStreakData() as StreakData;
  const weeklySnapshot = buildWeeklyEngagementSnapshot(7, new Date());
  const activityPattern = getActivityPattern();
  const notificationPrefs = getStoredNotificationPrefs();
  const primaryGoal = getStoredPrimaryGoal();

  return {
    userId: getCurrentUserId(),
    activeTab,
    activeFeature,
    isProUser: isProUser === true,
    locationName: String(locationName || '').slice(0, 120),
    primaryGoal,
    userIntentSegment: storageService.getString(STORAGE_KEYS.USER_INTENT_SEGMENT, primaryGoal),
    weeklyGoalPreference: getWeeklyGoalPreference(),
    weekKey: getCurrentWeekKey(),
    lastFeature: getLastFeature(),
    streak: {
      current: (streakData as StreakData)?.current || fullStreakData?.currentStreak || 0,
      longest: (streakData as StreakData)?.longest || fullStreakData?.longestStreak || 0,
      prayerCount: fullStreakData?.streaks?.prayer?.count || 0,
      quranCount: fullStreakData?.streaks?.quran?.count || 0,
      zikirCount: fullStreakData?.streaks?.zikir?.count || 0,
    },
    prayer: {
      nextPrayer: nextPrayer?.key || null,
      nextPrayerLabel: nextPrayer?.name || null,
      timings: timings || null,
    },
    dailyContent: dailyContent
      ? {
          esmaName: dailyContent?.esma?.name || '',
          duaTitle: dailyContent?.dailyDua?.title || dailyContent?.dua?.source || '',
          verseReference: dailyContent?.verse?.reference || '',
          campaignId: dailyContent?.campaign?.id || 'evergreen',
          sources: [
            dailyContent?.verse?.sourceMeta,
            dailyContent?.dailyDua?.sourceMeta,
            dailyContent?.esma?.sourceMeta,
            dailyContent?.hadith?.sourceMeta,
          ].filter(Boolean).slice(0, 3),
        }
      : null,
    activityPattern,
    weeklySnapshot,
    notificationPrefs: {
      reminder: notificationPrefs?.reminder === true,
      quietHoursEnabled: notificationPrefs?.quietHoursEnabled === true,
    },
    social: {
      family: family
        ? {
            id: family.id || null,
            name: family.name || 'Aile',
            memberCount: Array.isArray(family.membersDetails) ? family.membersDetails.length : 0,
          }
        : null,
      familyWeeklyGoal: familyWeeklyGoal
        ? {
            title: familyWeeklyGoal.title || '',
            currentValue: Number(familyWeeklyGoal.currentValue) || 0,
            targetValue: Number(familyWeeklyGoal.targetValue) || 0,
          }
        : null,
      socialSummary: socialSummary || null,
    },
  };
};

export default {
  buildAiContext,
};

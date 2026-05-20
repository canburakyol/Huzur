import { getDb } from './firebase';
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { getCurrentUserId } from './authService';
import { logger } from '../utils/logger';
import { BADGES } from '../data/gamificationData';

export { BADGES };

interface Badge {
  id: string;
  name: string;
  category: string;
  [key: string]: unknown;
}

interface BadgeEntry {
  badgeId: string;
  earnedAt: string;
}

interface UserStreaks {
  [key: string]: number;
}

interface UserStats {
  totalPrayers?: number;
  totalJuz?: number;
  totalAyah?: number;
  totalHatim?: number;
  memorizedSurahs?: number;
  totalDhikr?: number;
  totalShares?: number;
  totalInvites?: number;
  totalQuizzes?: number;
  esmaLearned?: number;
  [key: string]: number | undefined;
}

interface UserData {
  streaks?: UserStreaks;
  earnedBadges?: BadgeEntry[];
  stats?: UserStats;
  familyId?: string;
  updatedAt?: unknown;
  [key: string]: unknown;
}

interface StreakUpdateResult {
  updated: boolean;
  currentCount?: number;
  newBadge?: Badge | null;
  error?: string;
}

const COLLECTION_USERS = 'users';

export const gamificationService = {

  updateStreak: async (activityType: string): Promise<StreakUpdateResult | undefined> => {
    const userId = getCurrentUserId();
    if (!userId) return;

    const today = new Date().toISOString().split('T')[0];
    const database = await getDb();
    const userRef = doc(database, COLLECTION_USERS, userId);

    try {
      const userDoc = await getDoc(userRef);
      const userData = (userDoc.data() || {}) as UserData;
      const currentStreaks = userData.streaks || {};

      const lastActivityDate = currentStreaks[`${activityType}_lastDate`];
      let currentCount = currentStreaks[`${activityType}_count`] || 0;

      if (lastActivityDate === today) {
        return { updated: false, currentCount };
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastActivityDate === yesterdayStr) {
        currentCount += 1;
      } else {
        currentCount = 1;
      }

      const updates: Record<string, unknown> = {
        [`streaks.${activityType}_count`]: currentCount,
        [`streaks.${activityType}_lastDate`]: today,
        updatedAt: serverTimestamp()
      };

      if (activityType === 'zikir') {
        updates['stats.totalDhikr'] = increment(1);
      }

      await updateDoc(userRef, updates);

      let newBadge: Badge | null = null;
      try {
        const updatedUserData: UserData = {
          ...userData,
          streaks: { ...currentStreaks, [`${activityType}_count`]: currentCount }
        };
        newBadge = await gamificationService.checkBadges(userId, updatedUserData);
      } catch (badgeError) {
        logger.error('[Gamification] Badge check error during streak update:', badgeError);
      }

      return { updated: true, currentCount, newBadge };

    } catch (error) {
      logger.error('[Gamification] Update streak error:', error);
      return { updated: false, error: (error as Error).message };
    }
  },

  checkBadges: async (userId: string, userData: UserData | null): Promise<Badge | null> => {
    if (!userData) return null;

    const earnedBadges = userData.earnedBadges || [];
    const earnedIds = earnedBadges.map(b => b.badgeId);
    let newlyEarned: Badge | null = null;

    for (const key in BADGES) {
      const badge = BADGES[key] as Badge;
      if (earnedIds.includes(badge.id)) continue;

      let qualified = false;
      const streaks = userData.streaks || {};
      const stats = userData.stats || {};

      switch (badge.category) {
        case 'prayer': {
          const prayerCount = stats.totalPrayers || 0;
          const fajrStreak = streaks.fajr_count || 0;
          if (badge.id === 'first_prayer' && prayerCount >= 1) qualified = true;
          if (badge.id === 'pray_7_days' && (streaks.prayer_count || 0) >= 7) qualified = true;
          if (badge.id === 'pray_30_days' && (streaks.prayer_count || 0) >= 30) qualified = true;
          if (badge.id === 'fajr_7' && fajrStreak >= 7) qualified = true;
          if (badge.id === 'fajr_40' && fajrStreak >= 40) qualified = true;
          if (badge.id === 'tahajjud' && (streaks.tahajjud_count || 0) >= 7) qualified = true;
          break;
        }
        case 'quran': {
          const quranStreak = streaks.quran_count || 0;
          const totalJuz = stats.totalJuz || 0;
          if (badge.id === 'first_ayah' && (stats.totalAyah || 0) >= 1) qualified = true;
          if (badge.id === 'read_7_days' && quranStreak >= 7) qualified = true;
          if (badge.id === 'read_30_days' && quranStreak >= 30) qualified = true;
          if (badge.id === 'first_juz' && totalJuz >= 1) qualified = true;
          if (badge.id === 'hatim_complete' && (stats.totalHatim || 0) >= 1) qualified = true;
          if (badge.id === 'memorize_start' && (stats.memorizedSurahs || 0) >= 1) qualified = true;
          break;
        }
        case 'dhikr': {
          const totalDhikr = stats.totalDhikr || 0;
          const adhkarStreak = streaks.adhkar_count || 0;
          const tespihatStreak = streaks.tespihat_count || 0;
          if (badge.id === 'first_dhikr' && totalDhikr >= 1) qualified = true;
          if (badge.id === 'dhikr_1000' && totalDhikr >= 1000) qualified = true;
          if (badge.id === 'dhikr_10000' && totalDhikr >= 10000) qualified = true;
          if (badge.id === 'dhikr_100000' && totalDhikr >= 100000) qualified = true;
          if (badge.id === 'adhkar_7' && adhkarStreak >= 7) qualified = true;
          if (badge.id === 'tespihat_30' && tespihatStreak >= 30) qualified = true;
          break;
        }
        case 'streak': {
          const generalStreak = streaks.general_count || 0;
          if (badge.id === 'streak_3' && generalStreak >= 3) qualified = true;
          if (badge.id === 'streak_7' && generalStreak >= 7) qualified = true;
          if (badge.id === 'streak_30' && generalStreak >= 30) qualified = true;
          if (badge.id === 'streak_100' && generalStreak >= 100) qualified = true;
          if (badge.id === 'streak_365' && generalStreak >= 365) qualified = true;
          break;
        }
        case 'social': {
          if (badge.id === 'first_share' && (stats.totalShares || 0) >= 1) qualified = true;
          if (badge.id === 'invite_friend' && (stats.totalInvites || 0) >= 1) qualified = true;
          if (badge.id === 'family_joined' && userData.familyId) qualified = true;
          break;
        }
        case 'knowledge': {
          const totalQuizzes = stats.totalQuizzes || 0;
          if (badge.id === 'quiz_first' && totalQuizzes >= 1) qualified = true;
          if (badge.id === 'quiz_master' && totalQuizzes >= 50) qualified = true;
          if (badge.id === 'esma_learner' && (stats.esmaLearned || 0) >= 99) qualified = true;
          break;
        }
        case 'special': {
          if (badge.id === 'friday_faithful' && (streaks.friday_count || 0) >= 4) qualified = true;
          break;
        }
        default:
          break;
      }

      if (qualified) {
        try {
          const badgeEntry: BadgeEntry = {
            badgeId: badge.id,
            earnedAt: new Date().toISOString()
          };

          const database = await getDb();
          await updateDoc(doc(database, COLLECTION_USERS, userId), {
            earnedBadges: arrayUnion(badgeEntry)
          });

          newlyEarned = badge;
          logger.log(`[Gamification] Badge earned: ${badge.name}`);
          break;
        } catch (dbError) {
          logger.error(`[Gamification] Failed to award badge to user ${userId}:`, dbError);
        }
      }
    }

    return newlyEarned;
  },

  getUserBadges: async (): Promise<BadgeEntry[]> => {
    const userId = getCurrentUserId();
    if (!userId) return [];

    const database = await getDb();
    const userDoc = await getDoc(doc(database, COLLECTION_USERS, userId));
    if (!userDoc.exists()) return [];

    const data = userDoc.data() as UserData;
    return data.earnedBadges || [];
  }
};

export default gamificationService;

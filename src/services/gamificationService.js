import { db } from './firebase';
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

// Re-export BADGES for backward compatibility
export { BADGES };

const COLLECTION_USERS = 'users';

export const gamificationService = {
  
  /**
   * Kullanıcının streak bilgisini günceller
   * @param {string} activityType - 'fajr', 'quran', 'zikir'
   */
  updateStreak: async (activityType) => {
    const userId = getCurrentUserId();
    if (!userId) return;

    const today = new Date().toISOString().split('T')[0];
    const userRef = doc(db, COLLECTION_USERS, userId);

    try {
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data() || {};
      const currentStreaks = userData.streaks || {};
      
      const lastActivityDate = currentStreaks[`${activityType}_lastDate`];
      let currentCount = currentStreaks[`${activityType}_count`] || 0;

      // Eğer bugün zaten yapıldıysa işlem yapma
      if (lastActivityDate === today) {
        return { updated: false, currentCount };
      }

      // Dün yapıldı mı kontrolü (Basit tarih kontrolü)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastActivityDate === yesterdayStr) {
        currentCount += 1; // Zincir devam ediyor
      } else {
        currentCount = 1; // Zincir kırıldı veya yeni başladı
      }

      const updates = {
        [`streaks.${activityType}_count`]: currentCount,
        [`streaks.${activityType}_lastDate`]: today,
        updatedAt: serverTimestamp()
      };

      // Zikir için toplu sayacı da artır (eğer zikir ise)
      if (activityType === 'zikir') {
        updates['stats.totalDhikr'] = increment(1);
      }

      await updateDoc(userRef, updates);
      
      // Rozet kontrolü yap - Özel Hata Yakalama (Graceful Degradation)
      let newBadge = null;
      try {
        newBadge = await gamificationService.checkBadges(userId, { 
          ...userData, 
          streaks: { ...currentStreaks, [`${activityType}_count`]: currentCount } 
        });
      } catch (badgeError) {
        logger.error('[Gamification] Badge check error during streak update:', badgeError);
      }

      return { updated: true, currentCount, newBadge };

    } catch (error) {
      logger.error('[Gamification] Update streak error:', error);
      return { updated: false, error: error.message };
    }
  },

  /**
   * Rozet kazanma kontrolü — expanded for 33 badge types
   * @param {string} userId 
   * @param {object} userData - Güncel user verisi (optimize için)
   */
  checkBadges: async (userId, userData) => {
    if (!userData) return null;

    const earnedBadges = userData.earnedBadges || [];
    const earnedIds = earnedBadges.map(b => b.badgeId);
    let newlyEarned = null;

    for (const key in BADGES) {
      const badge = BADGES[key];
      if (earnedIds.includes(badge.id)) continue;

      let qualified = false;
      const streaks = userData.streaks || {};
      const stats = userData.stats || {};

      // Category-based qualification checks
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
          // Special badges are typically awarded manually or via specific event logic
          if (badge.id === 'friday_faithful' && (streaks.friday_count || 0) >= 4) qualified = true;
          break;
        }
        default:
          break;
      }

      if (qualified) {
        try {
          const badgeEntry = {
            badgeId: badge.id,
            earnedAt: new Date().toISOString()
          };
          
          await updateDoc(doc(db, COLLECTION_USERS, userId), {
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

  /**
   * Kullanıcının rozetlerini getirir
   */
  getUserBadges: async () => {
    const userId = getCurrentUserId();
    if (!userId) return [];
    
    const userDoc = await getDoc(doc(db, COLLECTION_USERS, userId));
    if (!userDoc.exists()) return [];
    
    const data = userDoc.data();
    return data.earnedBadges || [];
  }
};

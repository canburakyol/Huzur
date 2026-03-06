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

// --- Rozet Tanımları ---
export const BADGES = {
  EARLY_BIRD: {
    id: 'early_bird',
    title: 'Sabah Bülbülü',
    description: '40 Gün sabah namazını vaktinde kıl',
    icon: '🌅',
    target: 40,
    type: 'streak_fajr'
  },
  QURAN_LOVER: {
    id: 'quran_lover',
    title: 'Kuran Aşığı',
    description: '30 Gün boyunca her gün Kuran oku',
    icon: '📖',
    target: 30,
    type: 'streak_quran'
  },
  DHIKR_MASTER: {
    id: 'dhikr_master',
    title: 'Zikir Ehli',
    description: 'Toplam 10.000 zikir çek',
    icon: '📿',
    target: 10000,
    type: 'total_dhikr'
  },
  FAMILY_FIRST: {
    id: 'family_first',
    title: 'Huzurlu Aile',
    description: 'Bir aile oluştur veya katıl',
    icon: '🏡',
    target: 1,
    type: 'family_joined'
  }
};

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
        updates['stats.totalDhikr'] = increment(1); // Burası değişebilir, parametre gerekebilir
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
        // Rozet kontrolü hata verse bile streak güncellendiği için süreci kesmiyoruz.
      }

      return { updated: true, currentCount, newBadge };

    } catch (error) {
      logger.error('[Gamification] Update streak error:', error);
      return { updated: false, error: error.message };
    }
  },

  /**
   * Rozet kazanma kontrolü
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

      // Kural kontrolü
      if (badge.type.startsWith('streak_')) {
        const type = badge.type.split('_')[1]; // fajr, quran
        const count = userData.streaks?.[`${type}_count`] || 0;
        if (count >= badge.target) qualified = true;
      } else if (badge.type === 'total_dhikr') {
        const total = userData.stats?.totalDhikr || 0;
        if (total >= badge.target) qualified = true;
      } else if (badge.type === 'family_joined') {
        if (userData.familyId) qualified = true;
      }

      if (qualified) {
        try {
          // Rozeti ver
          const badgeEntry = {
            badgeId: badge.id,
            earnedAt: new Date().toISOString()
          };
          
          await updateDoc(doc(db, COLLECTION_USERS, userId), {
            earnedBadges: arrayUnion(badgeEntry)
          });
          
          newlyEarned = badge;
          logger.log(`[Gamification] Badge earned: ${badge.title}`);
          // Sadece ilk kazanılanı döndür (birden fazla olabilir ama UI tek gösterecek şimdilik)
          break; 
        } catch (dbError) {
          logger.error(`[Gamification] Failed to award badge to user ${userId}:`, dbError);
          // Don't break loop, maybe another badge write could succeed, though unlikely if db is down
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

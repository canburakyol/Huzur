import { storageService } from '../services/storageService';

// 30-Level progression system with meaningful Islamic titles
export const LEVELS = [
  // Tier 1: Başlangıç Serüveni (0 - 1,000 XP)
  { level: 1, minPoints: 0, title: 'Yeni Başlayan', tier: 'beginner' },
  { level: 2, minPoints: 50, title: 'Adım Atan', tier: 'beginner' },
  { level: 3, minPoints: 150, title: 'Gayretli', tier: 'beginner' },
  { level: 4, minPoints: 300, title: 'Azimli', tier: 'beginner' },
  { level: 5, minPoints: 500, title: 'Kararlı', tier: 'beginner' },

  // Tier 2: Gelişen Mümin (1,000 - 5,000 XP)
  { level: 6, minPoints: 1000, title: 'Gelişen', tier: 'developing' },
  { level: 7, minPoints: 1500, title: 'İstikrarlı', tier: 'developing' },
  { level: 8, minPoints: 2000, title: 'Düzenli', tier: 'developing' },
  { level: 9, minPoints: 3000, title: 'Bilinçli', tier: 'developing' },
  { level: 10, minPoints: 5000, title: 'Farkında', tier: 'developing' },

  // Tier 3: Adanmış Kul (5,000 - 15,000 XP)
  { level: 11, minPoints: 6000, title: 'Adanmış', tier: 'dedicated' },
  { level: 12, minPoints: 7500, title: 'Sabırlı', tier: 'dedicated' },
  { level: 13, minPoints: 9000, title: 'Mütevazı', tier: 'dedicated' },
  { level: 14, minPoints: 11000, title: 'Şükürlü', tier: 'dedicated' },
  { level: 15, minPoints: 15000, title: 'Sadık', tier: 'dedicated' },

  // Tier 4: İlim Yolcusu (15,000 - 35,000 XP)
  { level: 16, minPoints: 18000, title: 'İlim Talip', tier: 'scholar' },
  { level: 17, minPoints: 22000, title: 'Hikmet Arayan', tier: 'scholar' },
  { level: 18, minPoints: 26000, title: 'İrfan Ehli', tier: 'scholar' },
  { level: 19, minPoints: 30000, title: 'Ferasetli', tier: 'scholar' },
  { level: 20, minPoints: 35000, title: 'Basiretli', tier: 'scholar' },

  // Tier 5: Manevi Rehber (35,000 - 70,000 XP)
  { level: 21, minPoints: 40000, title: 'Rehber', tier: 'guide' },
  { level: 22, minPoints: 47000, title: 'Yol Gösterici', tier: 'guide' },
  { level: 23, minPoints: 55000, title: 'Nur Saçan', tier: 'guide' },
  { level: 24, minPoints: 62000, title: 'İlham Veren', tier: 'guide' },
  { level: 25, minPoints: 70000, title: 'Ümmet Dostu', tier: 'guide' },

  // Tier 6: Huzur Öncüsü (70,000 - 150,000 XP)
  { level: 26, minPoints: 85000, title: 'Huzur Yolcusu', tier: 'pioneer' },
  { level: 27, minPoints: 100000, title: 'Gönül Eri', tier: 'pioneer' },
  { level: 28, minPoints: 120000, title: 'Huzur Elçisi', tier: 'pioneer' },
  { level: 29, minPoints: 135000, title: 'Manevi Öncü', tier: 'pioneer' },
  { level: 30, minPoints: 150000, title: 'Huzur Ustası', tier: 'pioneer' }
];

// Tier colors for UI
export const TIER_COLORS = {
  beginner: { primary: '#6b7280', secondary: '#9ca3af', gradient: 'linear-gradient(135deg, #6b7280, #9ca3af)' },
  developing: { primary: '#22c55e', secondary: '#4ade80', gradient: 'linear-gradient(135deg, #22c55e, #86efac)' },
  dedicated: { primary: '#3b82f6', secondary: '#60a5fa', gradient: 'linear-gradient(135deg, #3b82f6, #93c5fd)' },
  scholar: { primary: '#a855f7', secondary: '#c084fc', gradient: 'linear-gradient(135deg, #a855f7, #d8b4fe)' },
  guide: { primary: '#f59e0b', secondary: '#fbbf24', gradient: 'linear-gradient(135deg, #f59e0b, #fde68a)' },
  pioneer: { primary: '#d4af37', secondary: '#ffd700', gradient: 'linear-gradient(135deg, #d4af37, #ffd700)' }
};

// Helper to get next level info
export function getNextLevel(currentLevel) {
  const idx = LEVELS.findIndex(l => l.level === currentLevel);
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
}

// Helper to calculate progress to next level (0-100)
export function getLevelProgress(points) {
  const currentLevel = LEVELS.slice().reverse().find(l => points >= l.minPoints) || LEVELS[0];
  const nextLevel = getNextLevel(currentLevel.level);
  if (!nextLevel) return 100;
  const needed = nextLevel.minPoints - currentLevel.minPoints;
  const earned = points - currentLevel.minPoints;
  return Math.min(100, Math.round((earned / needed) * 100));
}

// ----- BADGES (30+ rozet) -----
export const BADGES = {
  // === NAMAZ KATEGORİSİ ===
  FIRST_PRAYER: { id: 'first_prayer', icon: '🤲', name: 'İlk Secde', description: 'İlk namazını kaydet', category: 'prayer' },
  PRAY_7_DAYS: { id: 'pray_7_days', icon: '⏰', name: 'Vaktinde 7 Gün', description: '7 gün boyunca vaktinde namaz kıl', category: 'prayer' },
  PRAY_30_DAYS: { id: 'pray_30_days', icon: '🕌', name: 'Namaz Savaşçısı', description: '30 gün boyunca namazlarını takip et', category: 'prayer' },
  FAJR_7: { id: 'fajr_7', icon: '🌅', name: 'Sabah Kuşu', description: '7 gün sabah namazını vaktinde kıl', category: 'prayer' },
  FAJR_40: { id: 'fajr_40', icon: '🌄', name: 'Sabah Bülbülü', description: '40 gün sabah namazını vaktinde kıl', category: 'prayer' },
  TAHAJJUD: { id: 'tahajjud', icon: '🌌', name: 'Teheccüd Savaşçısı', description: '7 gece teheccüd namazı kıl', category: 'prayer' },

  // === KURAN KATEGORİSİ ===
  FIRST_AYAH: { id: 'first_ayah', icon: '📖', name: 'İlk Ayet', description: 'İlk ayetini oku', category: 'quran' },
  READ_7_DAYS: { id: 'read_7_days', icon: '📚', name: 'Kuran Dostu', description: '7 gün boyunca Kuran oku', category: 'quran' },
  READ_30_DAYS: { id: 'read_30_days', icon: '📕', name: 'Kuran Aşığı', description: '30 gün boyunca her gün Kuran oku', category: 'quran' },
  FIRST_JUZ: { id: 'first_juz', icon: '🎓', name: '1 Cüz Tamam', description: '1 cüz oku', category: 'quran' },
  HATIM_COMPLETE: { id: 'hatim_complete', icon: '🏆', name: 'Hatim Kahramanı', description: 'Bir hatim tamamla', category: 'quran' },
  MEMORIZE_START: { id: 'memorize_start', icon: '🧠', name: 'Hafız Adayı', description: 'İlk sureni ezberle', category: 'quran' },

  // === ZİKİR KATEGORİSİ ===
  FIRST_DHIKR: { id: 'first_dhikr', icon: '📿', name: 'İlk Tesbih', description: 'İlk zikrini yap', category: 'dhikr' },
  DHIKR_1000: { id: 'dhikr_1000', icon: '✨', name: 'Bin Tesbih', description: 'Toplam 1.000 zikir çek', category: 'dhikr' },
  DHIKR_10000: { id: 'dhikr_10000', icon: '🌟', name: 'On Bin Tesbih', description: 'Toplam 10.000 zikir çek', category: 'dhikr' },
  DHIKR_100000: { id: 'dhikr_100000', icon: '💫', name: 'Zikir Ustası', description: 'Toplam 100.000 zikir çek', category: 'dhikr' },
  ADHKAR_7: { id: 'adhkar_7', icon: '🌤️', name: 'Sabah/Akşam Sadığı', description: '7 gün sabah-akşam adhkarı tamamla', category: 'dhikr' },
  TESPIHAT_30: { id: 'tespihat_30', icon: '🤲', name: 'Tespihat Ehli', description: '30 gün tespihat tamamla', category: 'dhikr' },

  // === STREAK KATEGORİSİ ===
  STREAK_3: { id: 'streak_3', icon: '🔥', name: '3 Gün Seri', description: '3 gün art arda aktif ol', category: 'streak' },
  STREAK_7: { id: 'streak_7', icon: '💪', name: 'Haftalık Seri', description: '7 gün art arda aktif ol', category: 'streak' },
  STREAK_30: { id: 'streak_30', icon: '🏅', name: 'Aylık Seri', description: '30 gün art arda aktif ol', category: 'streak' },
  STREAK_100: { id: 'streak_100', icon: '👑', name: 'Yüz Gün Efsanesi', description: '100 gün art arda aktif ol', category: 'streak' },
  STREAK_365: { id: 'streak_365', icon: '🌍', name: 'Yılın Yıldızı', description: '365 gün art arda aktif ol', category: 'streak' },

  // === SOSYAL KATEGORİ ===
  FIRST_SHARE: { id: 'first_share', icon: '🤝', name: 'İlk Paylaşım', description: 'İlk içeriğini paylaş', category: 'social' },
  INVITE_FRIEND: { id: 'invite_friend', icon: '💌', name: 'Davetçi', description: 'Bir arkadaşını davet et', category: 'social' },
  FAMILY_JOINED: { id: 'family_joined', icon: '🏡', name: 'Huzurlu Aile', description: 'Bir aile grubuna katıl veya oluştur', category: 'social' },

  // === ÖZEL / SEZONLUK ===
  RAMADAN_WARRIOR: { id: 'ramadan_warrior', icon: '🌙', name: 'Ramazan Savaşçısı', description: 'Ramazan boyunca her gün aktif ol', category: 'special' },
  FRIDAY_FAITHFUL: { id: 'friday_faithful', icon: '🕌', name: 'Cuma Sadığı', description: '4 Cuma art arda Cuma namazı kıl', category: 'special' },
  NIGHT_OF_POWER: { id: 'night_of_power', icon: '⭐', name: 'Kadir Gecesi', description: 'Kadir Gecesi aktif ol', category: 'special' },

  // === İLİM KATEGORİSİ ===
  QUIZ_FIRST: { id: 'quiz_first', icon: '🎯', name: 'İlk Quiz', description: 'İlk quiz\'ini tamamla', category: 'knowledge' },
  QUIZ_MASTER: { id: 'quiz_master', icon: '🧪', name: 'Quiz Ustası', description: '50 quiz tamamla', category: 'knowledge' },
  ESMA_LEARNER: { id: 'esma_learner', icon: '✨', name: 'Esma Öğrencisi', description: '99 Esma-ül Hüsna\'yı öğren', category: 'knowledge' }
};

// Badge categories for UI grouping
export const BADGE_CATEGORIES = {
  prayer: { icon: '🕌', label: 'Namaz', color: '#22c55e' },
  quran: { icon: '📖', label: 'Kuran', color: '#3b82f6' },
  dhikr: { icon: '📿', label: 'Zikir', color: '#a855f7' },
  streak: { icon: '🔥', label: 'Seri', color: '#f59e0b' },
  social: { icon: '👥', label: 'Sosyal', color: '#ec4899' },
  special: { icon: '🌙', label: 'Özel', color: '#d4af37' },
  knowledge: { icon: '📚', label: 'İlim', color: '#06b6d4' }
};

// Haftalık Meydan Okumalar
export const WEEKLY_CHALLENGES = [
  {
    id: 'quran_week',
    icon: '📖',
    title: 'Kuran Haftası',
    description: 'Bu hafta 7 cüz Kuran oku',
    target: 7,
    unit: 'cüz',
    category: 'quran',
    rewardPoints: 100,
    reward: { xp: 100 },
    color: '#22c55e'
  },
  {
    id: 'namaz_week',
    icon: '🕌',
    title: 'Namaz Haftası',
    description: 'Bu hafta 40 rekat nafile namaz kıl',
    target: 40,
    unit: 'rekat',
    category: 'prayer',
    rewardPoints: 100,
    reward: { xp: 100 },
    color: '#3b82f6'
  },
  {
    id: 'zikir_week',
    icon: '📿',
    title: 'Zikir Haftası',
    description: 'Bu hafta 1000 tesbih çek',
    target: 1000,
    unit: 'tesbih',
    category: 'dhikr',
    rewardPoints: 100,
    reward: { xp: 100 },
    color: '#a855f7'
  },
  {
    id: 'sabah_week',
    icon: '🌅',
    title: 'Sabah Namazı',
    description: 'Bu hafta 7 gün sabah namazını vaktinde kıl',
    target: 7,
    unit: 'gün',
    category: 'prayer',
    rewardPoints: 150,
    reward: { xp: 150 },
    color: '#f59e0b'
  },
  {
    id: 'tespihat_week',
    icon: '🤲',
    title: 'Tespihat Haftası',
    description: 'Bu hafta 7 gün tespihat (sabah/akşam) tamamla',
    target: 7,
    unit: 'gün',
    category: 'dhikr',
    rewardPoints: 100,
    reward: { xp: 100 },
    color: '#ec4899'
  },
  {
    id: 'hatim_week',
    icon: '📚',
    title: 'Hatim Haftası',
    description: 'Bu hafta 1 hatim tamamla',
    target: 1,
    unit: 'hatim',
    category: 'quran',
    rewardPoints: 200,
    reward: { xp: 200 },
    color: '#14b8a6'
  },
  {
    id: 'fasting_week',
    icon: '🌙',
    title: 'Oruç Haftası',
    description: 'Bu hafta 2 gün nafile oruç tut',
    target: 2,
    unit: 'gün',
    category: 'fasting',
    rewardPoints: 150,
    reward: { xp: 150 },
    color: '#8b5cf6'
  },
  {
    id: 'charity_week',
    icon: '💝',
    title: 'Sadaka Haftası',
    description: 'Bu hafta 7 gün sadaka ver',
    target: 7,
    unit: 'gün',
    category: 'charity',
    rewardPoints: 100,
    reward: { xp: 100 },
    color: '#f97316'
  }
];

// Weekly challenges storage key
const CHALLENGES_STORAGE_KEY = 'huzur_weekly_challenges_progress';

/**
 * Get weekly challenges adapted to the user's current level
 * Adaptive Challenge System: Scales up targets for higher-level users
 */
export function getAdaptiveWeeklyChallenges(userLevel = 1) {
  let multiplier = 1;
  if (userLevel >= 6 && userLevel <= 15) multiplier = 1.5;
  else if (userLevel >= 16 && userLevel <= 25) multiplier = 2;
  else if (userLevel > 25) multiplier = 3;

  const data = storageService.getItem(CHALLENGES_STORAGE_KEY, {});

  return WEEKLY_CHALLENGES.map(challenge => {
    // Scale target and rewards
    const scaledTarget = Math.ceil(challenge.target * multiplier);
    const scaledReward = Math.ceil(challenge.rewardPoints * (1 + (multiplier - 1) * 0.5));
    
    // Update description text with new target
    const newDesc = challenge.description.replace(challenge.target.toString(), scaledTarget.toString());

    return {
      ...challenge,
      target: scaledTarget,
      rewardPoints: scaledReward,
      reward: { xp: scaledReward },
      description: newDesc,
      isAdaptive: multiplier > 1,
      progress: data[challenge.id]?.progress || 0,
      completed: data[challenge.id]?.completed || false
    };
  });
}

/**
 * Backward compatibility
 */
export function getWeeklyChallenges() {
  return getAdaptiveWeeklyChallenges(1);
}

/**
 * Update challenge progress
 */
export function updateChallengeProgress(challengeId, progress) {
  const data = storageService.getItem(CHALLENGES_STORAGE_KEY, {});
  
  if (!data[challengeId]) {
    data[challengeId] = { progress: 0, completed: false };
  }
  
  data[challengeId].progress = progress;
  data[challengeId].lastUpdated = new Date().toISOString();
  
  storageService.setItem(CHALLENGES_STORAGE_KEY, data);
  return data[challengeId];
}

/**
 * Complete a challenge
 */
export function completeChallenge(challengeId) {
  const data = storageService.getItem(CHALLENGES_STORAGE_KEY, {});
  
  const challenge = WEEKLY_CHALLENGES.find(c => c.id === challengeId);
  
  data[challengeId] = {
    progress: challenge?.target || 0,
    completed: true,
    completedAt: new Date().toISOString()
  };
  
  storageService.setItem(CHALLENGES_STORAGE_KEY, data);
  return data[challengeId];
}

// Meydan okuma kategorileri
export const CHALLENGE_CATEGORIES = {
  prayer: { icon: '🕌', label: 'Namaz', color: '#22c55e' },
  quran: { icon: '📖', label: 'Kuran', color: '#3b82f6' },
  dhikr: { icon: '📿', label: 'Zikir', color: '#d4af37' },
  fasting: { icon: '🌙', label: 'Oruç', color: '#8b5cf6' },
  charity: { icon: '💝', label: 'Sadaka', color: '#f97316' },
  community: { icon: '👥', label: 'Topluluk', color: '#ec4899' }
};

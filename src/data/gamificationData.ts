import { storageService } from '../services/storageService';

export interface Level {
  level: number;
  minPoints: number;
  title: string;
  tier: string;
}

export interface TierColor {
  primary: string;
  secondary: string;
  gradient: string;
}

export interface Badge {
  id: string;
  icon: string;
  name: string;
  description: string;
  category: string;
}

export interface Challenge {
  id: string;
  icon: string;
  title: string;
  description: string;
  target: number;
  unit: string;
  category: string;
  rewardPoints: number;
  reward: { xp: number };
  color: string;
}

export interface AdaptiveChallenge extends Challenge {
  isAdaptive: boolean;
  progress: number;
  completed: boolean;
}

export interface ChallengeProgress {
  progress: number;
  completed: boolean;
  lastUpdated?: string;
  completedAt?: string;
}

export const LEVELS: Level[] = [
  { level: 1, minPoints: 0, title: 'Yeni Başlayan', tier: 'beginner' },
  { level: 2, minPoints: 50, title: 'Adım Atan', tier: 'beginner' },
  { level: 3, minPoints: 150, title: 'Gayretli', tier: 'beginner' },
  { level: 4, minPoints: 300, title: 'Azimli', tier: 'beginner' },
  { level: 5, minPoints: 500, title: 'Kararlı', tier: 'beginner' },
  { level: 6, minPoints: 1000, title: 'Gelişen', tier: 'developing' },
  { level: 7, minPoints: 1500, title: 'İstikrarlı', tier: 'developing' },
  { level: 8, minPoints: 2000, title: 'Düzenli', tier: 'developing' },
  { level: 9, minPoints: 3000, title: 'Bilinçli', tier: 'developing' },
  { level: 10, minPoints: 5000, title: 'Farkında', tier: 'developing' },
  { level: 11, minPoints: 6000, title: 'Adanmış', tier: 'dedicated' },
  { level: 12, minPoints: 7500, title: 'Sabırlı', tier: 'dedicated' },
  { level: 13, minPoints: 9000, title: 'Mütevazı', tier: 'dedicated' },
  { level: 14, minPoints: 11000, title: 'Şükürlü', tier: 'dedicated' },
  { level: 15, minPoints: 15000, title: 'Sadık', tier: 'dedicated' },
  { level: 16, minPoints: 18000, title: 'İlim Talip', tier: 'scholar' },
  { level: 17, minPoints: 22000, title: 'Hikmet Arayan', tier: 'scholar' },
  { level: 18, minPoints: 26000, title: 'İrfan Ehli', tier: 'scholar' },
  { level: 19, minPoints: 30000, title: 'Ferasetli', tier: 'scholar' },
  { level: 20, minPoints: 35000, title: 'Basiretli', tier: 'scholar' },
  { level: 21, minPoints: 40000, title: 'Rehber', tier: 'guide' },
  { level: 22, minPoints: 47000, title: 'Yol Gösterici', tier: 'guide' },
  { level: 23, minPoints: 55000, title: 'Nur Saçan', tier: 'guide' },
  { level: 24, minPoints: 62000, title: 'İlham Veren', tier: 'guide' },
  { level: 25, minPoints: 70000, title: 'Ümmet Dostu', tier: 'guide' },
  { level: 26, minPoints: 85000, title: 'Huzur Yolcusu', tier: 'pioneer' },
  { level: 27, minPoints: 100000, title: 'Gönül Eri', tier: 'pioneer' },
  { level: 28, minPoints: 120000, title: 'Huzur Elçisi', tier: 'pioneer' },
  { level: 29, minPoints: 135000, title: 'Manevi Öncü', tier: 'pioneer' },
  { level: 30, minPoints: 150000, title: 'Huzur Ustası', tier: 'pioneer' }
];

// Concrete Stitch palette colors support legacy alpha-suffix composition in badge visuals.
export const TIER_COLORS: Record<string, TierColor> = {
  beginner: { primary: '#434843', secondary: '#434843', gradient: 'linear-gradient(135deg, #434843, #434843)' },
  developing: { primary: '#8daa91', secondary: '#8daa91', gradient: 'linear-gradient(135deg, #8daa91, #f5f2e9)' },
  dedicated: { primary: '#1b3022', secondary: '#1b3022', gradient: 'linear-gradient(135deg, #1b3022, #f5f2e9)' },
  scholar: { primary: '#8daa91', secondary: '#8daa91', gradient: 'linear-gradient(135deg, #8daa91, #f5f2e9)' },
  guide: { primary: '#aa8343', secondary: '#aa8343', gradient: 'linear-gradient(135deg, #aa8343, #f5f2e9)' },
  pioneer: { primary: '#aa8343', secondary: '#aa8343', gradient: 'linear-gradient(135deg, #aa8343, #aa8343)' }
};

export function getNextLevel(currentLevel: number): Level | null {
  const idx = LEVELS.findIndex(l => l.level === currentLevel);
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
}

export function getLevelProgress(points: number): number {
  const currentLevel = LEVELS.slice().reverse().find(l => points >= l.minPoints) || LEVELS[0];
  const nextLevel = getNextLevel(currentLevel.level);
  if (!nextLevel) return 100;
  const needed = nextLevel.minPoints - currentLevel.minPoints;
  const earned = points - currentLevel.minPoints;
  return Math.min(100, Math.round((earned / needed) * 100));
}

export const BADGES: Record<string, Badge> = {
  FIRST_PRAYER: { id: 'first_prayer', icon: '🤲', name: 'İlk Secde', description: 'İlk namazını kaydet', category: 'prayer' },
  PRAY_7_DAYS: { id: 'pray_7_days', icon: '⏰', name: 'Vaktinde 7 Gün', description: '7 gün boyunca vaktinde namaz kıl', category: 'prayer' },
  PRAY_30_DAYS: { id: 'pray_30_days', icon: '🕌', name: 'Namaz Savaşçısı', description: '30 gün boyunca namazlarını takip et', category: 'prayer' },
  FAJR_7: { id: 'fajr_7', icon: '🌅', name: 'Sabah Kuşu', description: '7 gün sabah namazını vaktinde kıl', category: 'prayer' },
  FAJR_40: { id: 'fajr_40', icon: '🌄', name: 'Sabah Bülbülü', description: '40 gün sabah namazını vaktinde kıl', category: 'prayer' },
  TAHAJJUD: { id: 'tahajjud', icon: '🌌', name: 'Teheccüd Savaşçısı', description: '7 gece teheccüd namazı kıl', category: 'prayer' },
  FIRST_AYAH: { id: 'first_ayah', icon: '📖', name: 'İlk Ayet', description: 'İlk ayetini oku', category: 'quran' },
  READ_7_DAYS: { id: 'read_7_days', icon: '📚', name: 'Kuran Dostu', description: '7 gün boyunca Kuran oku', category: 'quran' },
  READ_30_DAYS: { id: 'read_30_days', icon: '📕', name: 'Kuran Aşığı', description: '30 gün boyunca her gün Kuran oku', category: 'quran' },
  FIRST_JUZ: { id: 'first_juz', icon: '🎓', name: '1 Cüz Tamam', description: '1 cüz oku', category: 'quran' },
  HATIM_COMPLETE: { id: 'hatim_complete', icon: '🏆', name: 'Hatim Kahramanı', description: 'Bir hatim tamamla', category: 'quran' },
  MEMORIZE_START: { id: 'memorize_start', icon: '🧠', name: 'Hafız Adayı', description: 'İlk sureni ezberle', category: 'quran' },
  FIRST_DHIKR: { id: 'first_dhikr', icon: '📿', name: 'İlk Tesbih', description: 'İlk zikrini yap', category: 'dhikr' },
  DHIKR_1000: { id: 'dhikr_1000', icon: '✨', name: 'Bin Tesbih', description: 'Toplam 1.000 zikir çek', category: 'dhikr' },
  DHIKR_10000: { id: 'dhikr_10000', icon: '🌟', name: 'On Bin Tesbih', description: 'Toplam 10.000 zikir çek', category: 'dhikr' },
  DHIKR_100000: { id: 'dhikr_100000', icon: '💫', name: 'Zikir Ustası', description: 'Toplam 100.000 zikir çek', category: 'dhikr' },
  ADHKAR_7: { id: 'adhkar_7', icon: '🌤️', name: 'Sabah/Akşam Sadığı', description: '7 gün sabah-akşam adhkarı tamamla', category: 'dhikr' },
  TESPIHAT_30: { id: 'tespihat_30', icon: '🤲', name: 'Tespihat Ehli', description: '30 gün tespihat tamamla', category: 'dhikr' },
  STREAK_3: { id: 'streak_3', icon: '🔥', name: '3 Gün Seri', description: '3 gün art arda aktif ol', category: 'streak' },
  STREAK_7: { id: 'streak_7', icon: '💪', name: 'Haftalık Seri', description: '7 gün art arda aktif ol', category: 'streak' },
  STREAK_30: { id: 'streak_30', icon: '🏅', name: 'Aylık Seri', description: '30 gün art arda aktif ol', category: 'streak' },
  STREAK_100: { id: 'streak_100', icon: '👑', name: 'Yüz Gün Efsanesi', description: '100 gün art arda aktif ol', category: 'streak' },
  STREAK_365: { id: 'streak_365', icon: '🌍', name: 'Yılın Yıldızı', description: '365 gün art arda aktif ol', category: 'streak' },
  FIRST_SHARE: { id: 'first_share', icon: '🤝', name: 'İlk Paylaşım', description: 'İlk içeriğini paylaş', category: 'social' },
  INVITE_FRIEND: { id: 'invite_friend', icon: '💌', name: 'Davetçi', description: 'Bir arkadaşını davet et', category: 'social' },
  FAMILY_JOINED: { id: 'family_joined', icon: '🏡', name: 'Huzurlu Aile', description: 'Bir aile grubuna katıl veya oluştur', category: 'social' },
  RAMADAN_WARRIOR: { id: 'ramadan_warrior', icon: '🌙', name: 'Ramazan Savaşçısı', description: 'Ramazan boyunca her gün aktif ol', category: 'special' },
  FRIDAY_FAITHFUL: { id: 'friday_faithful', icon: '🕌', name: 'Cuma Sadığı', description: '4 Cuma art arda Cuma namazı kıl', category: 'special' },
  NIGHT_OF_POWER: { id: 'night_of_power', icon: '⭐', name: 'Kadir Gecesi', description: 'Kadir Gecesi aktif ol', category: 'special' },
  QUIZ_FIRST: { id: 'quiz_first', icon: '🎯', name: 'İlk Quiz', description: 'İlk quiz\'ini tamamla', category: 'knowledge' },
  QUIZ_MASTER: { id: 'quiz_master', icon: '🧪', name: 'Quiz Ustası', description: '50 quiz tamamla', category: 'knowledge' },
  ESMA_LEARNER: { id: 'esma_learner', icon: '✨', name: 'Esma Öğrencisi', description: '99 Esma-ül Hüsna\'yı öğren', category: 'knowledge' }
};

export const BADGE_CATEGORIES: Record<string, { icon: string; label: string; color: string }> = {
  prayer: { icon: '🕌', label: 'Namaz', color: '#8daa91' },
  quran: { icon: '📖', label: 'Kuran', color: '#1b3022' },
  dhikr: { icon: '📿', label: 'Zikir', color: '#8daa91' },
  streak: { icon: '🔥', label: 'Seri', color: '#aa8343' },
  social: { icon: '👥', label: 'Sosyal', color: '#8daa91' },
  special: { icon: '🌙', label: 'Özel', color: '#aa8343' },
  knowledge: { icon: '📚', label: 'İlim', color: '#1b3022' }
};

export const WEEKLY_CHALLENGES: Challenge[] = [
  { id: 'quran_week', icon: '📖', title: 'Kuran Haftası', description: 'Bu hafta 7 cüz Kuran oku', target: 7, unit: 'cüz', category: 'quran', rewardPoints: 100, reward: { xp: 100 }, color: '#8daa91' },
  { id: 'namaz_week', icon: '🕌', title: 'Namaz Haftası', description: 'Bu hafta 40 rekat nafile namaz kıl', target: 40, unit: 'rekat', category: 'prayer', rewardPoints: 100, reward: { xp: 100 }, color: '#1b3022' },
  { id: 'zikir_week', icon: '📿', title: 'Zikir Haftası', description: 'Bu hafta 1000 tesbih çek', target: 1000, unit: 'tesbih', category: 'dhikr', rewardPoints: 100, reward: { xp: 100 }, color: '#8daa91' },
  { id: 'sabah_week', icon: '🌅', title: 'Sabah Namazı', description: 'Bu hafta 7 gün sabah namazını vaktinde kıl', target: 7, unit: 'gün', category: 'prayer', rewardPoints: 150, reward: { xp: 150 }, color: '#aa8343' },
  { id: 'tespihat_week', icon: '🤲', title: 'Tespihat Haftası', description: 'Bu hafta 7 gün tespihat (sabah/akşam) tamamla', target: 7, unit: 'gün', category: 'dhikr', rewardPoints: 100, reward: { xp: 100 }, color: '#8daa91' },
  { id: 'hatim_week', icon: '📚', title: 'Hatim Haftası', description: 'Bu hafta 1 hatim tamamla', target: 1, unit: 'hatim', category: 'quran', rewardPoints: 200, reward: { xp: 200 }, color: '#8daa91' },
  { id: 'fasting_week', icon: '🌙', title: 'Oruç Haftası', description: 'Bu hafta 2 gün nafile oruç tut', target: 2, unit: 'gün', category: 'fasting', rewardPoints: 150, reward: { xp: 150 }, color: '#8daa91' },
  { id: 'charity_week', icon: '💝', title: 'Sadaka Haftası', description: 'Bu hafta 7 gün sadaka ver', target: 7, unit: 'gün', category: 'charity', rewardPoints: 100, reward: { xp: 100 }, color: '#aa8343' }
];

const CHALLENGES_STORAGE_KEY = 'huzur_weekly_challenges_progress';

export function getAdaptiveWeeklyChallenges(userLevel = 1): AdaptiveChallenge[] {
  let multiplier = 1;
  if (userLevel >= 6 && userLevel <= 15) multiplier = 1.5;
  else if (userLevel >= 16 && userLevel <= 25) multiplier = 2;
  else if (userLevel > 25) multiplier = 3;

  const data = storageService.getItem(CHALLENGES_STORAGE_KEY, {}) as Record<string, ChallengeProgress>;

  return WEEKLY_CHALLENGES.map(challenge => {
    const scaledTarget = Math.ceil(challenge.target * multiplier);
    const scaledReward = Math.ceil(challenge.rewardPoints * (1 + (multiplier - 1) * 0.5));
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

export function getWeeklyChallenges(): AdaptiveChallenge[] {
  return getAdaptiveWeeklyChallenges(1);
}

export function updateChallengeProgress(challengeId: string, progress: number): ChallengeProgress {
  const data = storageService.getItem(CHALLENGES_STORAGE_KEY, {}) as Record<string, ChallengeProgress>;

  if (!data[challengeId]) {
    data[challengeId] = { progress: 0, completed: false };
  }

  data[challengeId].progress = progress;
  data[challengeId].lastUpdated = new Date().toISOString();

  storageService.setItem(CHALLENGES_STORAGE_KEY, data);
  return data[challengeId];
}

export function completeChallenge(challengeId: string): ChallengeProgress {
  const data = storageService.getItem(CHALLENGES_STORAGE_KEY, {}) as Record<string, ChallengeProgress>;
  const challenge = WEEKLY_CHALLENGES.find(c => c.id === challengeId);

  data[challengeId] = {
    progress: challenge?.target || 0,
    completed: true,
    completedAt: new Date().toISOString()
  };

  storageService.setItem(CHALLENGES_STORAGE_KEY, data);
  return data[challengeId];
}

export const CHALLENGE_CATEGORIES: Record<string, { icon: string; label: string; color: string }> = {
  prayer: { icon: '🕌', label: 'Namaz', color: '#8daa91' },
  quran: { icon: '📖', label: 'Kuran', color: '#1b3022' },
  dhikr: { icon: '📿', label: 'Zikir', color: '#aa8343' },
  fasting: { icon: '🌙', label: 'Oruç', color: '#8daa91' },
  charity: { icon: '💝', label: 'Sadaka', color: '#aa8343' },
  community: { icon: '👥', label: 'Topluluk', color: '#8daa91' }
};

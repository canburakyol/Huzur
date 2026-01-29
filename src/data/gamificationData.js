export const LEVELS = [
  { level: 1, minPoints: 0, title: 'Başlangıç' },
  { level: 2, minPoints: 100, title: 'Gayretli' },
  { level: 3, minPoints: 300, title: 'İstikrarlı' },
  { level: 4, minPoints: 600, title: 'Adanmış' },
  { level: 5, minPoints: 1000, title: 'Öncü' }
];

export const BADGES = {
  FIRST_PRAYER: { id: 'first_prayer', icon: '🤲', name: 'İlk Adım', description: 'İlk namazını kaydettin' },
  WEEKLY_STREAK: { id: 'weekly_streak', icon: '🔥', name: 'Haftalık Seri', description: '7 gün boyunca ibadet ettin' },
  EARLY_BIRD: { id: 'early_bird', icon: '🌅', name: 'Sabah Kuşu', description: 'Sabah namazını vaktinde kıldın' }
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
 * Get weekly challenges with current progress
 */
export function getWeeklyChallenges() {
  // Return challenges template (progress will be added by service)
  return WEEKLY_CHALLENGES.map(challenge => ({
    ...challenge,
    progress: 0,
    completed: false
  }));
}

/**
 * Update challenge progress
 */
export function updateChallengeProgress(challengeId, progress) {
  const stored = localStorage.getItem(CHALLENGES_STORAGE_KEY);
  const data = stored ? JSON.parse(stored) : {};
  
  if (!data[challengeId]) {
    data[challengeId] = { progress: 0, completed: false };
  }
  
  data[challengeId].progress = progress;
  data[challengeId].lastUpdated = new Date().toISOString();
  
  localStorage.setItem(CHALLENGES_STORAGE_KEY, JSON.stringify(data));
  return data[challengeId];
}

/**
 * Complete a challenge
 */
export function completeChallenge(challengeId) {
  const stored = localStorage.getItem(CHALLENGES_STORAGE_KEY);
  const data = stored ? JSON.parse(stored) : {};
  
  const challenge = WEEKLY_CHALLENGES.find(c => c.id === challengeId);
  
  data[challengeId] = {
    progress: challenge?.target || 0,
    completed: true,
    completedAt: new Date().toISOString()
  };
  
  localStorage.setItem(CHALLENGES_STORAGE_KEY, JSON.stringify(data));
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

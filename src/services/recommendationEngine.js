/**
 * Recommendation Engine
 * Kullanıcı davranış verisine göre kişiselleştirilmiş öneriler üretir.
 * Harici AI API gerektirmez — localStorage tabanlı kural motoru.
 */

import { storageService } from './storageService';

// ── Sabitler ────────────────────────────────────────────────────
const STORAGE_KEY_ACTIVITY = 'huzur_user_activity';
const STORAGE_KEY_STREAK   = 'huzur_streak_data';
const STORAGE_KEY_LAST_FEATURE = 'huzur_last_feature';

const TIME_BLOCKS = {
  MORNING:   { start: 4,  end: 11, label: 'sabah' },
  AFTERNOON: { start: 11, end: 17, label: 'öğle'  },
  EVENING:   { start: 17, end: 21, label: 'akşam' },
  NIGHT:     { start: 21, end: 4,  label: 'gece'  },
};

/** @typedef {{ id: string, title: string, body: string, icon: string, feature?: string }} Suggestion */

// ── Yardımcı Fonksiyonlar ────────────────────────────────────────

const getCurrentTimeBlock = () => {
  const hour = new Date().getHours();
  for (const [key, block] of Object.entries(TIME_BLOCKS)) {
    if (block.start < block.end) {
      if (hour >= block.start && hour < block.end) return key;
    } else {
      if (hour >= block.start || hour < block.end) return key;
    }
  }
  return 'MORNING';
};

const getStreakData = () => {
  return storageService.getItem(STORAGE_KEY_STREAK) || { count: 0, lastDate: null };
};

const getLastUsedFeature = () => {
  return storageService.getItem(STORAGE_KEY_LAST_FEATURE) || null;
};

// ── Öneri Kuralları ──────────────────────────────────────────────

/**
 * Zaman dilimine göre öneriler
 * @param {string} timeBlock
 * @returns {Suggestion[]}
 */
const getTimeBasedSuggestions = (timeBlock) => {
  const map = {
    MORNING: [
      {
        id: 'morning_prayer',
        title: 'Sabah Namazı',
        body: 'Güne bereketli başla — sabah namazı vakti yaklaşıyor.',
        icon: '🌅',
        feature: 'prayers',
      },
      {
        id: 'morning_zikir',
        title: 'Sabah Zikirlerine Başla',
        body: 'Sabah zikirlerini yapmak için harika bir an.',
        icon: '📿',
        feature: 'zikirmatik',
      },
    ],
    AFTERNOON: [
      {
        id: 'quran_reading',
        title: 'Kuran Okuma Zamanı',
        body: 'Öğleden sonra Kuran okumak için ideal vakit.',
        icon: '📖',
        feature: 'quran',
      },
      {
        id: 'dua_tracker',
        title: 'Dua Listeni Kontrol Et',
        body: 'Bugün için dualarını gözden geçir.',
        icon: '🤲',
        feature: 'dua',
      },
    ],
    EVENING: [
      {
        id: 'daily_tasks',
        title: 'Günlük Görevler',
        body: 'Bugünkü ibadet görevlerini tamamladın mı?',
        icon: '✅',
        feature: 'tasks',
      },
      {
        id: 'evening_prayer',
        title: 'Akşam Namazı',
        body: 'Akşam namazı vakti yaklaşıyor, hazırlan.',
        icon: '🌇',
        feature: 'prayers',
      },
    ],
    NIGHT: [
      {
        id: 'night_reflection',
        title: 'Günü Değerlendir',
        body: 'Bugün ne kadar ibadet ettiğini gözden geçir.',
        icon: '🌙',
        feature: 'tasks',
      },
      {
        id: 'night_quran',
        title: 'Yatmadan Önce Kuran',
        body: 'Uyumadan önce birkaç ayet oku.',
        icon: '📖',
        feature: 'quran',
      },
    ],
  };
  return map[timeBlock] || map.MORNING;
};

/**
 * Streak durumuna göre öneriler
 * @param {{ count: number, lastDate: string|null }} streakData
 * @returns {Suggestion[]}
 */
const getStreakBasedSuggestions = (streakData) => {
  const suggestions = [];
  const { count } = streakData;

  if (count >= 7) {
    suggestions.push({
      id: 'streak_protect',
      title: `${count} Günlük Serinizi Koruyun! 🔥`,
      body: 'Bugün de ibadetlerinizi tamamlayarak serinizi sürdürün.',
      icon: '🔥',
      feature: 'tasks',
    });
  } else if (count >= 3) {
    suggestions.push({
      id: 'streak_grow',
      title: `${count} Günlük Seri — Devam Et!`,
      body: 'Harika gidiyorsun, bugün de devam et.',
      icon: '⚡',
      feature: 'tasks',
    });
  } else if (count === 0) {
    suggestions.push({
      id: 'streak_start',
      title: 'Serine Bugün Başla',
      body: 'İlk adımı at — bugün ibadetlerini tamamla.',
      icon: '🌱',
      feature: 'tasks',
    });
  }

  return suggestions;
};

/**
 * Son kullanılan özelliğe göre öneriler
 * @param {string|null} lastFeature
 * @returns {Suggestion[]}
 */
const getFeatureBasedSuggestions = (lastFeature) => {
  if (!lastFeature) return [];

  const continuationMap = {
    quran: {
      id: 'continue_quran',
      title: 'Kuran Okumaya Devam Et',
      body: 'Kaldığın yerden devam et.',
      icon: '📖',
      feature: 'quran',
    },
    zikirmatik: {
      id: 'continue_zikir',
      title: 'Zikirlerine Devam Et',
      body: 'Dünkü zikirlerine bugün de devam et.',
      icon: '📿',
      feature: 'zikirmatik',
    },
    hatim: {
      id: 'continue_hatim',
      title: 'Hatim Takibini Güncelle',
      body: 'Hatim grubundaki ilerlemeyi kontrol et.',
      icon: '📚',
      feature: 'hatim',
    },
  };

  const suggestion = continuationMap[lastFeature];
  return suggestion ? [suggestion] : [];
};

// ── Ana API ──────────────────────────────────────────────────────

/**
 * Kullanıcı için kişiselleştirilmiş öneriler üretir.
 * @returns {{ suggestions: Suggestion[], context: string }}
 */
export const getPersonalizedSuggestions = () => {
  const timeBlock   = getCurrentTimeBlock();
  const streakData  = getStreakData();
  const lastFeature = getLastUsedFeature();

  const timeSuggestions    = getTimeBasedSuggestions(timeBlock);
  const streakSuggestions  = getStreakBasedSuggestions(streakData);
  const featureSuggestions = getFeatureBasedSuggestions(lastFeature);

  // Öncelik: streak > devam > zaman
  const merged = [
    ...streakSuggestions,
    ...featureSuggestions,
    ...timeSuggestions,
  ];

  // Tekrar eden feature'ları filtrele, max 3 öneri
  const seen = new Set();
  const unique = merged.filter((s) => {
    if (seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  }).slice(0, 3);

  const timeLabel = TIME_BLOCKS[timeBlock]?.label ?? 'bugün';
  const context = streakData.count > 0
    ? `${streakData.count} günlük seriniz var. ${timeLabel.charAt(0).toUpperCase() + timeLabel.slice(1)} için öneriler:`
    : `${timeLabel.charAt(0).toUpperCase() + timeLabel.slice(1)} için öneriler:`;

  return { suggestions: unique, context };
};

/**
 * Kullanıcının en son kullandığı özelliği kaydet.
 * @param {string} featureId
 */
export const recordFeatureUsage = (featureId) => {
  storageService.setItem(STORAGE_KEY_LAST_FEATURE, featureId);
};

/**
 * Streak verisini güncelle (dışarıdan çağrılabilir).
 * @param {{ count: number, lastDate: string }} data
 */
export const updateStreakData = (data) => {
  storageService.setItem(STORAGE_KEY_STREAK, data);
};

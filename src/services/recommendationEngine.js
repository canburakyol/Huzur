import { storageService } from './storageService';

const STORAGE_KEY_STREAK = 'huzur_streak_data';
const STORAGE_KEY_LAST_FEATURE = 'huzur_last_feature';

const TIME_BLOCKS = {
  MORNING:   { start: 4,  end: 11, label: 'sabah' },
  AFTERNOON: { start: 11, end: 17, label: 'ogle' },
  EVENING:   { start: 17, end: 21, label: 'aksam' },
  NIGHT:     { start: 21, end: 4,  label: 'gece'  },
};

const getCurrentTimeBlock = () => {
  const hour = new Date().getHours();
  for (const [key, block] of Object.entries(TIME_BLOCKS)) {
    if (block.start < block.end) {
      if (hour >= block.start && hour < block.end) return key;
    } else if (hour >= block.start || hour < block.end) {
      return key;
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

const getTimeBasedSuggestions = (timeBlock) => {
  const map = {
    MORNING: [
      {
        id: 'morning_prayer',
        title: 'Sabah Namazi',
        body: 'Gune bereketli basla; sabah namazi vakti yaklasiyor.',
        icon: '☀',
        feature: 'prayers',
      },
      {
        id: 'morning_zikir',
        title: 'Sabah Zikirlerine Basla',
        body: 'Sabah zikirlerini yapmak icin harika bir an.',
        icon: '۞',
        feature: 'zikirmatik',
      },
    ],
    AFTERNOON: [
      {
        id: 'quran_reading',
        title: 'Kuran Okuma Zamani',
        body: 'Ogleden sonra Kuran okumak icin ideal vakit.',
        icon: '📖',
        feature: 'quran',
      },
      {
        id: 'dua_tracker',
        title: 'Dua Listeni Kontrol Et',
        body: 'Bugun icin dualarini gozden gecir.',
        icon: '🤲',
        feature: 'dua',
      },
    ],
    EVENING: [
      {
        id: 'daily_tasks',
        title: 'Gunluk Gorevler',
        body: 'Bugunku ibadet gorevlerini tamamladin mi?',
        icon: '✓',
        feature: 'tasks',
      },
      {
        id: 'evening_prayer',
        title: 'Aksam Namazi',
        body: 'Aksam namazi vakti yaklasiyor, hazirlan.',
        icon: '☾',
        feature: 'prayers',
      },
    ],
    NIGHT: [
      {
        id: 'night_reflection',
        title: 'Gunu Degerlendir',
        body: 'Bugun ne kadar ibadet ettigini gozden gecir.',
        icon: '☽',
        feature: 'tasks',
      },
      {
        id: 'night_quran',
        title: 'Yatmadan Once Kuran',
        body: 'Uyumadan once birkac ayet oku.',
        icon: '📖',
        feature: 'quran',
      },
    ],
  };

  return map[timeBlock] || map.MORNING;
};

const getStreakBasedSuggestions = (streakData) => {
  const suggestions = [];
  const { count } = streakData;

  if (count >= 7) {
    suggestions.push({
      id: 'streak_protect',
      title: `${count} gunluk serinizi koruyun`,
      body: 'Bugun de ibadetlerinizi tamamlayarak serinizi surdurun.',
      icon: '🔥',
      feature: 'tasks',
    });
  } else if (count >= 3) {
    suggestions.push({
      id: 'streak_grow',
      title: `${count} gunluk seri - devam et`,
      body: 'Harika gidiyorsun, bugun de devam et.',
      icon: '⚡',
      feature: 'tasks',
    });
  } else if (count === 0) {
    suggestions.push({
      id: 'streak_start',
      title: 'Serine bugun basla',
      body: 'Ilk adimi at; bugun ibadetlerini tamamla.',
      icon: '🌱',
      feature: 'tasks',
    });
  }

  return suggestions;
};

const getFeatureBasedSuggestions = (lastFeature) => {
  if (!lastFeature) return [];

  const continuationMap = {
    quran: {
      id: 'continue_quran',
      title: 'Kuran okumaya devam et',
      body: 'Kaldigin yerden devam et.',
      icon: '📖',
      feature: 'quran',
    },
    zikirmatik: {
      id: 'continue_zikir',
      title: 'Zikirlerine devam et',
      body: 'Dunku zikirlerine bugun de devam et.',
      icon: '۞',
      feature: 'zikirmatik',
    },
    hatim: {
      id: 'continue_hatim',
      title: 'Hatim takibini guncelle',
      body: 'Hatim grubundaki ilerlemeyi kontrol et.',
      icon: '👥',
      feature: 'hatim',
    },
  };

  const suggestion = continuationMap[lastFeature];
  return suggestion ? [suggestion] : [];
};

export const getPersonalizedSuggestions = () => {
  const timeBlock = getCurrentTimeBlock();
  const streakData = getStreakData();
  const lastFeature = getLastUsedFeature();

  const merged = [
    ...getStreakBasedSuggestions(streakData),
    ...getFeatureBasedSuggestions(lastFeature),
    ...getTimeBasedSuggestions(timeBlock),
  ];

  const seen = new Set();
  const unique = merged.filter((suggestion) => {
    if (seen.has(suggestion.id)) return false;
    seen.add(suggestion.id);
    return true;
  }).slice(0, 3);

  const timeLabel = TIME_BLOCKS[timeBlock]?.label ?? 'bugun';
  const context = streakData.count > 0
    ? `${streakData.count} gunluk seriniz var. ${timeLabel} icin oneriler:`
    : `${timeLabel} icin oneriler:`;

  return { suggestions: unique, context };
};

export const recordFeatureUsage = (featureId) => {
  storageService.setItem(STORAGE_KEY_LAST_FEATURE, featureId);
};

export const updateStreakData = (data) => {
  storageService.setItem(STORAGE_KEY_STREAK, data);
};

/**
 * Günlük Görevler Veri Yapısı
 * Her gün için rastgele seçilen görev havuzu
 */

export const TASK_CATEGORIES = {
  PRAYER: 'namaz',
  QURAN: 'kuran',
  DHIKR: 'zikir',
  KNOWLEDGE: 'ilim',
  CHARITY: 'iyilik'
};

export const DAILY_TASKS = [
  // Namaz Görevleri
  {
    id: 'pray_fajr',
    category: TASK_CATEGORIES.PRAYER,
    title: 'dailyTasks.tasks.pray_fajr.title',
    description: 'dailyTasks.tasks.pray_fajr.desc',
    points: 20,
    icon: '🌅',
    recurring: true
  },
  {
    id: 'pray_on_time',
    category: TASK_CATEGORIES.PRAYER,
    title: 'dailyTasks.tasks.pray_on_time.title',
    description: 'dailyTasks.tasks.pray_on_time.desc',
    points: 15,
    icon: '⏰',
    recurring: true
  },
  {
    id: 'pray_sunnah',
    category: TASK_CATEGORIES.PRAYER,
    title: 'dailyTasks.tasks.pray_sunnah.title',
    description: 'dailyTasks.tasks.pray_sunnah.desc',
    points: 10,
    icon: '🤲',
    recurring: true
  },

  // Kuran Görevleri
  {
    id: 'read_ayah',
    category: TASK_CATEGORIES.QURAN,
    title: 'dailyTasks.tasks.read_ayah.title',
    description: 'dailyTasks.tasks.read_ayah.desc',
    points: 10,
    icon: '📖',
    recurring: true
  },
  {
    id: 'read_page',
    category: TASK_CATEGORIES.QURAN,
    title: 'dailyTasks.tasks.read_page.title',
    description: 'dailyTasks.tasks.read_page.desc',
    points: 15,
    icon: '📚',
    recurring: true
  },
  {
    id: 'listen_quran',
    category: TASK_CATEGORIES.QURAN,
    title: 'dailyTasks.tasks.listen_quran.title',
    description: 'dailyTasks.tasks.listen_quran.desc',
    points: 10,
    icon: '🎧',
    recurring: true
  },
  {
    id: 'memorize_ayah',
    category: TASK_CATEGORIES.QURAN,
    title: 'dailyTasks.tasks.memorize_ayah.title',
    description: 'dailyTasks.tasks.memorize_ayah.desc',
    points: 25,
    icon: '🧠',
    recurring: true
  },

  // Zikir Görevleri
  {
    id: 'dhikr_33',
    category: TASK_CATEGORIES.DHIKR,
    title: 'dailyTasks.tasks.dhikr_33.title',
    description: 'dailyTasks.tasks.dhikr_33.desc',
    points: 10,
    icon: '📿',
    recurring: true
  },
  {
    id: 'dhikr_morning',
    category: TASK_CATEGORIES.DHIKR,
    title: 'dailyTasks.tasks.dhikr_morning.title',
    description: 'dailyTasks.tasks.dhikr_morning.desc',
    points: 15,
    icon: '🌤️',
    recurring: true
  },
  {
    id: 'dhikr_evening',
    category: TASK_CATEGORIES.DHIKR,
    title: 'dailyTasks.tasks.dhikr_evening.title',
    description: 'dailyTasks.tasks.dhikr_evening.desc',
    points: 15,
    icon: '🌙',
    recurring: true
  },
  {
    id: 'istigfar_100',
    category: TASK_CATEGORIES.DHIKR,
    title: 'dailyTasks.tasks.istigfar_100.title',
    description: 'dailyTasks.tasks.istigfar_100.desc',
    points: 20,
    icon: '💫',
    recurring: true
  },

  // İlim Görevleri
  {
    id: 'read_hadith',
    category: TASK_CATEGORIES.KNOWLEDGE,
    title: 'dailyTasks.tasks.read_hadith.title',
    description: 'dailyTasks.tasks.read_hadith.desc',
    points: 10,
    icon: '📜',
    recurring: true
  },
  {
    id: 'learn_name',
    category: TASK_CATEGORIES.KNOWLEDGE,
    title: 'dailyTasks.tasks.learn_name.title',
    description: 'dailyTasks.tasks.learn_name.desc',
    points: 15,
    icon: '✨',
    recurring: true
  },
  {
    id: 'watch_lecture',
    category: TASK_CATEGORIES.KNOWLEDGE,
    title: 'dailyTasks.tasks.watch_lecture.title',
    description: 'dailyTasks.tasks.watch_lecture.desc',
    points: 10,
    icon: '🎬',
    recurring: true
  },

  // İyilik Görevleri
  {
    id: 'help_someone',
    category: TASK_CATEGORIES.CHARITY,
    title: 'dailyTasks.tasks.help_someone.title',
    description: 'dailyTasks.tasks.help_someone.desc',
    points: 20,
    icon: '🤝',
    recurring: true
  },
  {
    id: 'smile',
    category: TASK_CATEGORIES.CHARITY,
    title: 'dailyTasks.tasks.smile.title',
    description: 'dailyTasks.tasks.smile.desc',
    points: 5,
    icon: '😊',
    recurring: true
  },
  {
    id: 'share_knowledge',
    category: TASK_CATEGORIES.CHARITY,
    title: 'dailyTasks.tasks.share_knowledge.title',
    description: 'dailyTasks.tasks.share_knowledge.desc',
    points: 15,
    icon: '💡',
    recurring: true
  },
  {
    id: 'make_dua',
    category: TASK_CATEGORIES.CHARITY,
    title: 'dailyTasks.tasks.make_dua.title',
    description: 'dailyTasks.tasks.make_dua.desc',
    points: 10,
    icon: '🙏',
    recurring: true
  }
];

// Rozet tanımlamaları (görev bazlı)
export const TASK_BADGES = {
  FIRST_TASK: { id: 'first_task', title: 'dailyTasks.badges.first_task.title', emoji: '🎯', requirement: 'dailyTasks.badges.first_task.req' },
  DAILY_COMPLETE: { id: 'daily_complete', title: 'dailyTasks.badges.daily_complete.title', emoji: '⭐', requirement: 'dailyTasks.badges.daily_complete.req' },
  WEEK_STREAK: { id: 'week_streak', title: 'dailyTasks.badges.week_streak.title', emoji: '🔥', requirement: 'dailyTasks.badges.week_streak.req' },
  POINT_100: { id: 'point_100', title: 'dailyTasks.badges.point_100.title', emoji: '💯', requirement: 'dailyTasks.badges.point_100.req' },
  POINT_500: { id: 'point_500', title: 'dailyTasks.badges.point_500.title', emoji: '🏅', requirement: 'dailyTasks.badges.point_500.req' },
  POINT_1000: { id: 'point_1000', title: 'dailyTasks.badges.point_1000.title', emoji: '🏆', requirement: 'dailyTasks.badges.point_1000.req' },
  QURAN_MASTER: { id: 'quran_master', title: 'dailyTasks.badges.quran_master.title', emoji: '📖', requirement: 'dailyTasks.badges.quran_master.req' },
  DHIKR_MASTER: { id: 'dhikr_master', title: 'dailyTasks.badges.dhikr_master.title', emoji: '📿', requirement: 'dailyTasks.badges.dhikr_master.req' }
};

export default {
  TASK_CATEGORIES,
  DAILY_TASKS,
  TASK_BADGES
};

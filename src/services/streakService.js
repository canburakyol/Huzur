/**
 * Streak Service - Günlük uygulama kullanım serisi ve ibadet takibi
 * LocalStorage'da streak verilerini yönetir
 */

import { storageService } from './storageService';
import { analyticsService } from './analyticsService';
import { STORAGE_KEYS } from '../constants';

// Rozet tanımlamaları
const BADGES = {
  DAY_7: { id: '7_days', days: 7, emoji: '🌟', title: '7 Gün Serisi', message: 'Tebrikler! 7 gün boyunca her gün uygulamamızı açtınız!' },
  DAY_15: { id: '15_days', days: 15, emoji: '🔥', title: '15 Gün Serisi', message: 'Harika! 2 haftayı aştınız, devam edin!' },
  DAY_30: { id: '30_days', days: 30, emoji: '🏆', title: '30 Gün Serisi', message: 'Muhteşem! 1 aylık seri başarısı!' },
  DAY_100: { id: '100_days', days: 100, emoji: '👑', title: '100 Gün Serisi', message: 'Efsanevi! 100 gün kesintisiz kullanım!' }
};

const STREAK_DATA_KEY = 'huzur_streak_data';

const DEFAULT_STREAK_DATA = {
  currentStreak: 0,
  longestStreak: 0,
  lastVisitDate: null,
  totalDays: 0,
  earnedBadges: [],
  recoveryUsed: false,
  // New: Categorized streaks
  streaks: {
    prayer: { count: 0, lastDate: null, freezeTokens: 1, history: [] },
    quran: { count: 0, lastDate: null, freezeTokens: 0, history: [] },
    zikir: { count: 0, lastDate: null, freezeTokens: 0, history: [] }
  }
};

/**
 * Bugünün tarihini YYYY-MM-DD formatında döndürür
 */
const getTodayString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

/**
 * İki tarih arasındaki gün farkını hesaplar
 */
const getDaysDifference = (date1Str, date2Str) => {
  if (!date1Str || !date2Str) return 0;
  const date1 = new Date(date1Str);
  const date2 = new Date(date2Str);
  const diffTime = Math.abs(date2 - date1);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Mevcut streak verilerini localStorage'dan al
 */
export const getStreakData = () => {
  return storageService.getItem(STREAK_DATA_KEY, DEFAULT_STREAK_DATA);
};

/**
 * Streak verilerini localStorage'a kaydet
 */
const saveStreakData = (data) => {
  storageService.setItem(STREAK_DATA_KEY, data);
};

/**
 * Streak'i kontrol et ve güncelle (App Init için)
 */
export const checkAndUpdateStreak = () => {
  const today = getTodayString();
  const data = getStreakData();
  let newBadge = null;

  if (data.lastVisitDate === today) {
    return { streakData: data, newBadge: null };
  }

  if (!data.lastVisitDate) {
    data.currentStreak = 1;
    data.totalDays = 1;
    data.lastVisitDate = today;
    data.longestStreak = 1;
    saveStreakData(data);
    return { streakData: data, newBadge: null };
  }

  const daysDiff = getDaysDifference(data.lastVisitDate, today);

  if (daysDiff === 1) {
    data.currentStreak += 1;
    data.totalDays += 1;
    if (data.currentStreak > data.longestStreak) data.longestStreak = data.currentStreak;
    
    newBadge = checkForNewBadge(data.currentStreak, data.earnedBadges);
    if (newBadge) data.earnedBadges.push(newBadge.id);
  } else {
    // Note: Here we might eventually auto-trigger the protection modal
    data.currentStreak = 1;
    data.totalDays += 1;
  }

  data.lastVisitDate = today;
  saveStreakData(data);
  return { streakData: data, newBadge };
};

/**
 * Yeni rozet kazanılıp kazanılmadığını kontrol et
 */
const checkForNewBadge = (currentStreak, earnedBadges) => {
  const badgesList = Object.values(BADGES);
  for (const badge of badgesList) {
    if (currentStreak === badge.days && !earnedBadges.includes(badge.id)) {
      return badge;
    }
  }
  return null;
};

/**
 * Kategori bazlı aktivite kaydet
 */
export const recordActivity = (category) => {
  const data = getStreakData();
  if (!data.streaks[category]) {
     data.streaks[category] = { count: 0, lastDate: null, freezeTokens: 0, history: [] };
  }
  
  const categoryData = data.streaks[category];
  const today = getTodayString();
  
  if (categoryData.lastDate === today) {
    return { success: true, message: 'Already recorded today' };
  }

  const daysDiff = getDaysDifference(categoryData.lastDate, today);

  if (daysDiff === 1) {
    categoryData.count += 1;
  } else if (!categoryData.lastDate) {
    categoryData.count = 1;
  } else {
     // Streak broken, start again
     categoryData.count = 1;
  }

  categoryData.lastDate = today;
  if (!categoryData.history) categoryData.history = [];
  categoryData.history.push({ date: today, type: 'activity' });

  const weeklyGoal = storageService.getNumber(STORAGE_KEYS.WEEKLY_GOAL, 3);

  // 7 günde 1 dondurma hakkı kazan
  if (categoryData.count > 0 && categoryData.count % 7 === 0) {
    categoryData.freezeTokens += 1;
    analyticsService.logEvent('streak_reward_token', { category, count: categoryData.count });
  }

  saveStreakData(data);
  analyticsService.logStreakIncremented(category, categoryData.count, weeklyGoal);
  
  // Dispatch event for Gamification
  window.dispatchEvent(new CustomEvent('streak:activity', { 
    detail: { 
      category, 
      count: categoryData.count 
    } 
  }));
  
  return { success: true, count: categoryData.count };
};

/**
 * Dondurma hakkı kullan (Seriyi kurtar)
 */
export const useFreezeToken = (category) => {
  const data = getStreakData();
  const categoryData = data.streaks[category];

  if (categoryData && categoryData.freezeTokens > 0) {
    categoryData.freezeTokens -= 1;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    
    categoryData.lastDate = yesterdayStr;
    categoryData.history.push({ date: yesterdayStr, type: 'frozen' });

    saveStreakData(data);
    analyticsService.logStreakRecoveryStarted(category, 'freeze_token');
    analyticsService.logStreakRecoveryCompleted(category, categoryData.count);
    return { success: true, tokensRemaining: categoryData.freezeTokens };
  }

  return { success: false, message: 'No tokens available' };
};

export const getStreakDisplay = () => {
  const data = getStreakData();
  return {
    current: data.currentStreak,
    longest: data.longestStreak,
    total: data.totalDays,
    isMilestone: data.currentStreak >= 15,
    emoji: data.currentStreak >= 100 ? '👑' : 
           data.currentStreak >= 30 ? '🏆' : 
           data.currentStreak >= 15 ? '🔥' : 
           data.currentStreak >= 7 ? '🌟' : '✨'
  };
};

export const getEarnedBadges = () => {
  const data = getStreakData();
  return Object.values(BADGES).filter(badge => data.earnedBadges.includes(badge.id));
};

/**
 * Streak kurtarma durumunu kontrol et (Legacy Ad-based recovery)
 */
export const getRecoveryStatus = () => {
  const data = getStreakData();
  const today = getTodayString();
  
  if (!data.lastVisitDate || data.lastVisitDate === today) {
    return { canRecover: false, daysMissed: 0, recoveryDeadline: null };
  }
  
  const daysDiff = getDaysDifference(data.lastVisitDate, today);
  
  if (daysDiff === 2) {
    const lastVisit = new Date(data.lastVisitDate);
    const recoveryDeadline = new Date(lastVisit);
    recoveryDeadline.setDate(recoveryDeadline.getDate() + 2);
    
    const now = new Date();
    const canRecover = now < recoveryDeadline;
    
    return {
      canRecover,
      daysMissed: 1,
      recoveryDeadline: recoveryDeadline.toISOString()
    };
  }
  
  return { canRecover: false, daysMissed: daysDiff - 1, recoveryDeadline: null };
};

/**
 * Streak'i kurtar (Legacy Ad-based recovery)
 */
export const recoverStreak = () => {
  const status = getRecoveryStatus();
  if (!status.canRecover) return { success: false, newStreak: 0, message: 'Recovery not possible' };
  
  const data = getStreakData();
  const today = getTodayString();
  data.lastVisitDate = today;
  data.totalDays += 1;
  saveStreakData(data);
  return { success: true, newStreak: data.currentStreak, message: 'Streak recovered!' };
};

export const hasUsedRecovery = () => getStreakData().recoveryUsed || false;
export const markRecoveryUsed = () => {
  const data = getStreakData();
  data.recoveryUsed = true;
  data.recoveryUsedDate = getTodayString();
  saveStreakData(data);
};

/**
 * 24 saatlik telafi penceresi
 * Kullanıcı bir günü kaçırdıysa ve son aktivite üzerinden 24 saat geçmediyse telafi hakkı verir.
 */
export const getCategoryRecoveryStatus = (category = 'prayer') => {
  const data = getStreakData();
  const categoryData = data?.streaks?.[category];

  if (!categoryData?.lastDate || !categoryData?.count) {
    return {
      canRecover: false,
      category,
      deadline: null,
      reason: 'no_streak'
    };
  }

  const now = new Date();
  const today = getTodayString();
  if (categoryData.lastDate === today) {
    return {
      canRecover: false,
      category,
      deadline: null,
      reason: 'already_active_today'
    };
  }

  const lastDate = new Date(categoryData.lastDate);
  const daysDiff = getDaysDifference(categoryData.lastDate, today);

  if (daysDiff !== 1) {
    return {
      canRecover: false,
      category,
      deadline: null,
      reason: 'outside_single_day_gap'
    };
  }

  const recoveryDeadline = new Date(lastDate);
  recoveryDeadline.setHours(23, 59, 59, 999);
  recoveryDeadline.setDate(recoveryDeadline.getDate() + 1);

  const canRecover = now <= recoveryDeadline;

  return {
    canRecover,
    category,
    deadline: recoveryDeadline.toISOString(),
    reason: canRecover ? 'within_24h_window' : 'window_expired',
    currentCount: categoryData.count
  };
};

/**
 * Kategori streak telafisi uygular
 */
export const recoverCategoryStreak = (category = 'prayer') => {
  const status = getCategoryRecoveryStatus(category);
  if (!status.canRecover) {
    return { success: false, category, message: status.reason };
  }

  const data = getStreakData();
  const categoryData = data.streaks?.[category];
  if (!categoryData) {
    return { success: false, category, message: 'category_not_found' };
  }

  const today = getTodayString();
  categoryData.lastDate = today;
  categoryData.history = categoryData.history || [];
  categoryData.history.push({ date: today, type: 'recovered_24h' });

  saveStreakData(data);
  analyticsService.logStreakRecoveryStarted(category, '24h_window');
  analyticsService.logStreakRecoveryCompleted(category, categoryData.count);

  return {
    success: true,
    category,
    count: categoryData.count,
    message: 'recovered'
  };
};

/**
 * Haftalık hedef tercihi
 */
export const getWeeklyGoalPreference = () => {
  return storageService.getNumber(STORAGE_KEYS.WEEKLY_GOAL, 3);
};

export const setWeeklyGoalPreference = (goalCount, source = 'settings') => {
  const normalized = [3, 5, 7].includes(goalCount) ? goalCount : 3;
  storageService.setNumber(STORAGE_KEYS.WEEKLY_GOAL, normalized);
  analyticsService.logWeeklyGoalSelected(normalized, source);
  return normalized;
};

export default {
  getStreakData,
  checkAndUpdateStreak,
  getEarnedBadges,
  getStreakDisplay,
  recordActivity,
  useFreezeToken,
  getRecoveryStatus,
  recoverStreak,
  hasUsedRecovery,
  markRecoveryUsed,
  getCategoryRecoveryStatus,
  recoverCategoryStreak,
  getWeeklyGoalPreference,
  setWeeklyGoalPreference
};

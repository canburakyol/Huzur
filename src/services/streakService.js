/**
 * Streak Service - Günlük uygulama kullanım serisi takibi
 * LocalStorage'da streak verilerini yönetir
 */

import { storageService } from './storageService';
import { STORAGE_KEYS } from '../constants';

// Rozet tanımlamaları
const BADGES = {
  DAY_7: { id: '7_days', days: 7, emoji: '🌟', title: '7 Gün Serisi', message: 'Tebrikler! 7 gün boyunca her gün uygulamamızı açtınız!' },
  DAY_15: { id: '15_days', days: 15, emoji: '🔥', title: '15 Gün Serisi', message: 'Harika! 2 haftayı aştınız, devam edin!' },
  DAY_30: { id: '30_days', days: 30, emoji: '🏆', title: '30 Gün Serisi', message: 'Muhteşem! 1 aylık seri başarısı!' },
  DAY_100: { id: '100_days', days: 100, emoji: '👑', title: '100 Gün Serisi', message: 'Efsanevi! 100 gün kesintisiz kullanım!' }
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
  const date1 = new Date(date1Str);
  const date2 = new Date(date2Str);
  const diffTime = Math.abs(date2 - date1);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Mevcut streak verilerini localStorage'dan al
 */
export const getStreakData = () => {
  try {
    const data = storageService.getItem('huzur_streak_data');
    if (data) {
      return data;
    }
  } catch (error) {
    console.warn('[StreakService] Error reading streak data:', error);
  }
  
  // Varsayılan değerler
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastVisitDate: null,
    totalDays: 0,
    earnedBadges: []
  };
};

/**
 * Streak verilerini localStorage'a kaydet
 */
const saveStreakData = (data) => {
  try {
    storageService.setItem('huzur_streak_data', data);
  } catch (error) {
    console.warn('[StreakService] Error saving streak data:', error);
  }
};

/**
 * Streak'i kontrol et ve güncelle
 * @returns {{ streakData: object, newBadge: object|null }}
 */
export const checkAndUpdateStreak = () => {
  const today = getTodayString();
  const data = getStreakData();
  let newBadge = null;

  // Bugün zaten ziyaret edilmiş mi?
  if (data.lastVisitDate === today) {
    return { streakData: data, newBadge: null };
  }

  // İlk ziyaret
  if (!data.lastVisitDate) {
    data.currentStreak = 1;
    data.totalDays = 1;
    data.lastVisitDate = today;
    data.longestStreak = 1;
    saveStreakData(data);
    return { streakData: data, newBadge: null };
  }

  // Gün farkını hesapla
  const daysDiff = getDaysDifference(data.lastVisitDate, today);

  if (daysDiff === 1) {
    // Ardışık gün - streak devam ediyor
    data.currentStreak += 1;
    data.totalDays += 1;
    
    // En uzun seri güncelle
    if (data.currentStreak > data.longestStreak) {
      data.longestStreak = data.currentStreak;
    }

    // Yeni rozet kazanıldı mı kontrol et
    newBadge = checkForNewBadge(data.currentStreak, data.earnedBadges);
    if (newBadge) {
      data.earnedBadges.push(newBadge.id);
    }
  } else {
    // Seri kırıldı
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
 * Kazanılan tüm rozetleri döndür
 */
export const getEarnedBadges = () => {
  const data = getStreakData();
  const badgesList = Object.values(BADGES);
  
  return badgesList.filter(badge => data.earnedBadges.includes(badge.id));
};

/**
 * Streak bilgisini UI için formatla
 */
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

export default {
  getStreakData,
  checkAndUpdateStreak,
  getEarnedBadges,
  getStreakDisplay
};

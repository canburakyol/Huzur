/**
 * Daily Tasks Service - Günlük görev yönetimi
 * LocalStorage'da görev verilerini yönetir
 */

import { DAILY_TASKS, TASK_BADGES, TASK_CATEGORIES } from '../data/dailyTasksData';
import { storageService } from './storageService';
import { STORAGE_KEYS } from '../constants';

/**
 * Bugünün tarihini YYYY-MM-DD formatında döndürür
 */
const getTodayString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

/**
 * Günlük görevler için rastgele seçim yapar
 * Her kategoriden 1 görev seçer (toplam 5 görev)
 */
const selectDailyTasks = () => {
  const selectedTasks = [];
  
  Object.values(TASK_CATEGORIES).forEach(category => {
    const categoryTasks = DAILY_TASKS.filter(t => t.category === category);
    if (categoryTasks.length > 0) {
      const randomIndex = Math.floor(Math.random() * categoryTasks.length);
      selectedTasks.push({
        ...categoryTasks[randomIndex],
        completed: false,
        completedAt: null
      });
    }
  });
  
  return selectedTasks;
};

/**
 * Bugünün görevlerini al
 * Eğer bugün için görev seçilmemişse yeni görev seç
 */
export const getTodayTasks = () => {
  try {
    const today = getTodayString();
    const data = storageService.getItem('huzur_daily_tasks');
    
    if (data && data.date === today) {
      return data.tasks;
    }
    
    // Yeni gün, yeni görevler
    const newTasks = selectDailyTasks();
    saveTodayTasks(newTasks);
    return newTasks;
    
  } catch (error) {
    console.warn('[DailyTasksService] Error getting tasks:', error);
    return selectDailyTasks();
  }
};

/**
 * Bugünün görevlerini kaydet
 */
const saveTodayTasks = (tasks) => {
  try {
    const today = getTodayString();
    storageService.setItem('huzur_daily_tasks', {
      date: today,
      tasks: tasks
    });
  } catch (error) {
    console.warn('[DailyTasksService] Error saving tasks:', error);
  }
};

/**
 * Bir görevi tamamlandı olarak işaretle
 */
export const completeTask = (taskId) => {
  try {
    const tasks = getTodayTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) return { success: false, message: 'Görev bulunamadı' };
    if (tasks[taskIndex].completed) return { success: false, message: 'Görev zaten tamamlandı' };
    
    tasks[taskIndex].completed = true;
    tasks[taskIndex].completedAt = new Date().toISOString();
    
    saveTodayTasks(tasks);
    
    // İstatistikleri güncelle
    const points = tasks[taskIndex].points;
    updateStats(tasks[taskIndex]);
    
    // Yeni rozet kazanıldı mı kontrol et
    const newBadge = checkForNewBadge();
    
    return {
      success: true,
      points: points,
      newBadge: newBadge,
      allCompleted: tasks.every(t => t.completed)
    };
    
  } catch (error) {
    console.warn('[DailyTasksService] Error completing task:', error);
    return { success: false, message: 'Bir hata oluştu' };
  }
};

/**
 * Görev tamamlama geri al
 */
export const uncompleteTask = (taskId) => {
  try {
    const tasks = getTodayTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) return { success: false };
    
    const wasCompleted = tasks[taskIndex].completed;
    tasks[taskIndex].completed = false;
    tasks[taskIndex].completedAt = null;
    
    saveTodayTasks(tasks);
    
    // Eğer önceden tamamlanmışsa puanı düş
    if (wasCompleted) {
      decrementStats(tasks[taskIndex]);
    }
    
    return { success: true };
    
  } catch (error) {
    console.warn('[DailyTasksService] Error uncompleting task:', error);
    return { success: false };
  }
};

/**
 * İstatistikleri getir
 */
export const getStats = () => {
  try {
    const data = storageService.getItem('huzur_task_stats');
    if (data) {
      return data;
    }
  } catch (error) {
    console.warn('[DailyTasksService] Error getting stats:', error);
  }
  
  return {
    totalPoints: 0,
    totalTasksCompleted: 0,
    daysWithTasks: 0,
    categoryStats: {
      [TASK_CATEGORIES.PRAYER]: 0,
      [TASK_CATEGORIES.QURAN]: 0,
      [TASK_CATEGORIES.DHIKR]: 0,
      [TASK_CATEGORIES.KNOWLEDGE]: 0,
      [TASK_CATEGORIES.CHARITY]: 0
    },
    earnedBadges: [],
    lastActiveDate: null,
    consecutiveDays: 0
  };
};

/**
 * İstatistikleri kaydet
 */
const saveStats = (stats) => {
  try {
    storageService.setItem('huzur_task_stats', stats);
  } catch (error) {
    console.warn('[DailyTasksService] Error saving stats:', error);
  }
};

/**
 * Görev tamamlandığında istatistikleri güncelle
 */
const updateStats = (task) => {
  const stats = getStats();
  const today = getTodayString();
  
  stats.totalPoints += task.points;
  stats.totalTasksCompleted += 1;
  stats.categoryStats[task.category] = (stats.categoryStats[task.category] || 0) + 1;
  
  // Ardışık gün kontrolü
  if (stats.lastActiveDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    
    if (stats.lastActiveDate === yesterdayStr) {
      stats.consecutiveDays += 1;
    } else if (stats.lastActiveDate !== today) {
      stats.consecutiveDays = 1;
    }
    
    stats.daysWithTasks += 1;
    stats.lastActiveDate = today;
  }
  
  saveStats(stats);
};

/**
 * Görev geri alındığında istatistikleri düşür
 */
const decrementStats = (task) => {
  const stats = getStats();
  
  stats.totalPoints = Math.max(0, stats.totalPoints - task.points);
  stats.totalTasksCompleted = Math.max(0, stats.totalTasksCompleted - 1);
  stats.categoryStats[task.category] = Math.max(0, (stats.categoryStats[task.category] || 1) - 1);
  
  saveStats(stats);
};

/**
 * Yeni rozet kontrolü
 */
const checkForNewBadge = () => {
  const stats = getStats();
  const tasks = getTodayTasks();
  let newBadge = null;
  
  // İlk görev rozeti
  if (stats.totalTasksCompleted === 1 && !stats.earnedBadges.includes(TASK_BADGES.FIRST_TASK.id)) {
    newBadge = TASK_BADGES.FIRST_TASK;
    stats.earnedBadges.push(newBadge.id);
  }
  
  // Gün tamamlandı rozeti
  if (tasks.every(t => t.completed) && !stats.earnedBadges.includes(TASK_BADGES.DAILY_COMPLETE.id)) {
    newBadge = TASK_BADGES.DAILY_COMPLETE;
    stats.earnedBadges.push(newBadge.id);
  }
  
  // Haftalık seri rozeti
  if (stats.consecutiveDays >= 7 && !stats.earnedBadges.includes(TASK_BADGES.WEEK_STREAK.id)) {
    newBadge = TASK_BADGES.WEEK_STREAK;
    stats.earnedBadges.push(newBadge.id);
  }
  
  // Puan rozetleri
  if (stats.totalPoints >= 100 && !stats.earnedBadges.includes(TASK_BADGES.POINT_100.id)) {
    newBadge = TASK_BADGES.POINT_100;
    stats.earnedBadges.push(newBadge.id);
  }
  if (stats.totalPoints >= 500 && !stats.earnedBadges.includes(TASK_BADGES.POINT_500.id)) {
    newBadge = TASK_BADGES.POINT_500;
    stats.earnedBadges.push(newBadge.id);
  }
  if (stats.totalPoints >= 1000 && !stats.earnedBadges.includes(TASK_BADGES.POINT_1000.id)) {
    newBadge = TASK_BADGES.POINT_1000;
    stats.earnedBadges.push(newBadge.id);
  }
  
  // Kategori rozetleri
  if (stats.categoryStats[TASK_CATEGORIES.QURAN] >= 30 && !stats.earnedBadges.includes(TASK_BADGES.QURAN_MASTER.id)) {
    newBadge = TASK_BADGES.QURAN_MASTER;
    stats.earnedBadges.push(newBadge.id);
  }
  if (stats.categoryStats[TASK_CATEGORIES.DHIKR] >= 50 && !stats.earnedBadges.includes(TASK_BADGES.DHIKR_MASTER.id)) {
    newBadge = TASK_BADGES.DHIKR_MASTER;
    stats.earnedBadges.push(newBadge.id);
  }
  
  if (newBadge) {
    saveStats(stats);
  }
  
  return newBadge;
};

/**
 * Kazanılan tüm rozetleri döndür
 */
export const getEarnedBadges = () => {
  const stats = getStats();
  return Object.values(TASK_BADGES).filter(badge => stats.earnedBadges.includes(badge.id));
};

/**
 * Bugünün ilerleme yüzdesini hesapla
 */
export const getTodayProgress = () => {
  const tasks = getTodayTasks();
  const completed = tasks.filter(t => t.completed).length;
  const total = tasks.length;
  
  return {
    completed,
    total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    points: tasks.filter(t => t.completed).reduce((sum, t) => sum + t.points, 0),
    maxPoints: tasks.reduce((sum, t) => sum + t.points, 0)
  };
};

export default {
  getTodayTasks,
  completeTask,
  uncompleteTask,
  getStats,
  getEarnedBadges,
  getTodayProgress
};

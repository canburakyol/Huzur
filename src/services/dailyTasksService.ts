import { DAILY_TASKS, TASK_BADGES, TASK_CATEGORIES } from '../data/dailyTasksData';
import { storageService } from './storageService';
import { saveDailyTasksSnapshot } from './engagementSummaryService';
import { logger } from '../utils/logger';

type TaskCategory = typeof TASK_CATEGORIES[keyof typeof TASK_CATEGORIES];

type DailyTask = {
  id: string;
  title: string;
  category: TaskCategory;
  points: number;
  completed: boolean;
  completedAt: string | null;
};

type TaskBadge = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

type TaskStats = {
  totalPoints: number;
  totalTasksCompleted: number;
  daysWithTasks: number;
  categoryStats: Record<TaskCategory, number>;
  earnedBadges: string[];
  lastActiveDate: string | null;
  consecutiveDays: number;
};

type TaskResult = {
  success: boolean;
  message?: string;
  points?: number;
  newBadge?: TaskBadge | null;
  allCompleted?: boolean;
};

const getTodayString = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const selectDailyTasks = (): DailyTask[] => {
  const selectedTasks: DailyTask[] = [];

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

export const getTodayTasks = (): DailyTask[] => {
  try {
    const today = getTodayString();
    const data = storageService.getItem<{ date: string; tasks: DailyTask[] }>('huzur_daily_tasks');

    if (data && data.date === today) {
      return data.tasks;
    }

    const newTasks = selectDailyTasks();
    saveTodayTasks(newTasks);
    return newTasks;

  } catch (error) {
    logger.warn('[DailyTasksService] Error getting tasks:', error);
    return selectDailyTasks();
  }
};

const saveTodayTasks = (tasks: DailyTask[]): void => {
  try {
    const today = getTodayString();
    storageService.setItem('huzur_daily_tasks', {
      date: today,
      tasks
    });
    saveDailyTasksSnapshot({
      dateKey: today,
      tasks
    });
  } catch (error) {
    logger.warn('[DailyTasksService] Error saving tasks:', error);
  }
};

export const completeTask = (taskId: string): TaskResult => {
  try {
    const tasks = getTodayTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) return { success: false, message: 'Gorev bulunamadi' };
    if (tasks[taskIndex].completed) return { success: false, message: 'Gorev zaten tamamlandi' };

    tasks[taskIndex].completed = true;
    tasks[taskIndex].completedAt = new Date().toISOString();

    saveTodayTasks(tasks);

    const points = tasks[taskIndex].points;
    updateStats(tasks[taskIndex]);

    const newBadge = checkForNewBadge();

    return {
      success: true,
      points,
      newBadge,
      allCompleted: tasks.every(t => t.completed)
    };

  } catch (error) {
    logger.warn('[DailyTasksService] Error completing task:', error);
    return { success: false, message: 'Bir hata olustu' };
  }
};

export const uncompleteTask = (taskId: string): { success: boolean } => {
  try {
    const tasks = getTodayTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) return { success: false };

    const wasCompleted = tasks[taskIndex].completed;
    tasks[taskIndex].completed = false;
    tasks[taskIndex].completedAt = null;

    saveTodayTasks(tasks);

    if (wasCompleted) {
      decrementStats(tasks[taskIndex]);
    }

    return { success: true };

  } catch (error) {
    logger.warn('[DailyTasksService] Error uncompleting task:', error);
    return { success: false };
  }
};

export const getStats = (): TaskStats => {
  try {
    const data = storageService.getItem<TaskStats>('huzur_task_stats');
    if (data) {
      return data;
    }
  } catch (error) {
    logger.warn('[DailyTasksService] Error getting stats:', error);
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

const saveStats = (stats: TaskStats): void => {
  try {
    storageService.setItem('huzur_task_stats', stats);
  } catch (error) {
    logger.warn('[DailyTasksService] Error saving stats:', error);
  }
};

const updateStats = (task: DailyTask): void => {
  const stats = getStats();
  const today = getTodayString();

  stats.totalPoints += task.points;
  stats.totalTasksCompleted += 1;
  stats.categoryStats[task.category] = (stats.categoryStats[task.category] || 0) + 1;

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

const decrementStats = (task: DailyTask): void => {
  const stats = getStats();

  stats.totalPoints = Math.max(0, stats.totalPoints - task.points);
  stats.totalTasksCompleted = Math.max(0, stats.totalTasksCompleted - 1);
  stats.categoryStats[task.category] = Math.max(0, (stats.categoryStats[task.category] || 1) - 1);

  saveStats(stats);
};

const checkForNewBadge = (): TaskBadge | null => {
  const stats = getStats();
  const tasks = getTodayTasks();
  let newBadge: TaskBadge | null = null;

  if (stats.totalTasksCompleted === 1 && !stats.earnedBadges.includes(TASK_BADGES.FIRST_TASK.id)) {
    newBadge = TASK_BADGES.FIRST_TASK;
    stats.earnedBadges.push(newBadge.id);
  }

  if (tasks.every(t => t.completed) && !stats.earnedBadges.includes(TASK_BADGES.DAILY_COMPLETE.id)) {
    newBadge = TASK_BADGES.DAILY_COMPLETE;
    stats.earnedBadges.push(newBadge.id);
  }

  if (stats.consecutiveDays >= 7 && !stats.earnedBadges.includes(TASK_BADGES.WEEK_STREAK.id)) {
    newBadge = TASK_BADGES.WEEK_STREAK;
    stats.earnedBadges.push(newBadge.id);
  }

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

export const getEarnedBadges = (): TaskBadge[] => {
  const stats = getStats();
  return Object.values(TASK_BADGES).filter(badge => stats.earnedBadges.includes(badge.id));
};

export const getTodayProgress = (): {
  completed: number;
  total: number;
  percentage: number;
  points: number;
  maxPoints: number;
} => {
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

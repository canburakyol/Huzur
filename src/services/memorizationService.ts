import { storageService } from './storageService';
import { logger } from '../utils/logger';

const MEMORIZATION_KEY = 'huzur_memorization_data';

type MemorizationSurah = {
  number: number;
  startedAt: string;
  status: 'learning' | 'reviewing' | 'memorized';
  progress: number;
  memorizedAyahs: number[];
  nextReviewDate: string | null;
  level: number;
  lastReviewDate: string | null;
  lastActivity?: string;
};

type MemorizationData = {
  surahs: MemorizationSurah[];
};

type ReviewResult = {
  nextReview: Date;
  level: number;
};

type MemorizationStats = {
  totalSurahs: number;
  memorizedSurahs: number;
  totalAyahs: number;
  learningCount: number;
  reviewCount: number;
};

export const getMemorizationData = (): MemorizationData => {
  try {
    return storageService.getItem(MEMORIZATION_KEY, { surahs: [] }) as MemorizationData;
  } catch (error) {
    logger.error('[MemorizationService] getMemorizationData failed', error);
    return { surahs: [] };
  }
};

const saveMemorizationData = (data: MemorizationData): void => {
  storageService.setItem(MEMORIZATION_KEY, data);
};

export const startMemorizing = (surahNumber: number): boolean => {
  const data = getMemorizationData();
  
  if (data.surahs.find(s => s.number === surahNumber)) {
    return false;
  }

  const newSurah: MemorizationSurah = {
    number: surahNumber,
    startedAt: new Date().toISOString(),
    status: 'learning',
    progress: 0,
    memorizedAyahs: [],
    nextReviewDate: null,
    level: 0,
    lastReviewDate: null
  };

  data.surahs.push(newSurah);
  saveMemorizationData(data);
  return true;
};

export const markAyahMemorized = (surahNumber: number, ayahNumber: number, totalAyahs: number): boolean => {
  const data = getMemorizationData();
  const surah = data.surahs.find(s => s.number === surahNumber);

  if (!surah) return false;

  if (!surah.memorizedAyahs.includes(ayahNumber)) {
    surah.memorizedAyahs.push(ayahNumber);
    surah.progress = Math.round((surah.memorizedAyahs.length / totalAyahs) * 100);
    
    if (surah.memorizedAyahs.length === totalAyahs) {
      surah.status = 'reviewing';
      surah.level = 1;
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      surah.nextReviewDate = tomorrow.toISOString();
    }
    
    surah.lastActivity = new Date().toISOString();
    saveMemorizationData(data);
    return true;
  }
  
  return false;
};

export const reviewSurah = (surahNumber: number, quality: number): ReviewResult | false => {
  const data = getMemorizationData();
  const surah = data.surahs.find(s => s.number === surahNumber);

  if (!surah) return false;

  let intervalDays = 1;
  
  if (quality === 1) {
    surah.level = 1;
    intervalDays = 1;
  } else if (quality === 2) {
    surah.level = Math.max(1, surah.level);
    intervalDays = Math.pow(2, surah.level);
  } else {
    surah.level += 1;
    intervalDays = Math.pow(2.5, surah.level);
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + Math.round(intervalDays));
  
  surah.nextReviewDate = nextDate.toISOString();
  surah.lastReviewDate = new Date().toISOString();
  
  if (surah.level >= 5) {
    surah.status = 'memorized';
  }

  saveMemorizationData(data);
  return { nextReview: nextDate, level: surah.level };
};

export const getDueReviews = (): MemorizationSurah[] => {
  const data = getMemorizationData();
  const now = new Date();
  
  return data.surahs.filter(s => {
    if (s.status !== 'reviewing' && s.status !== 'memorized') return false;
    if (!s.nextReviewDate) return true;
    return new Date(s.nextReviewDate) <= now;
  });
};

export const getMemorizationStats = (): MemorizationStats => {
  const data = getMemorizationData();
  const totalSurahs = data.surahs.length;
  const memorizedSurahs = data.surahs.filter(s => s.status === 'memorized').length;
  const totalAyahs = data.surahs.reduce((acc, s) => acc + s.memorizedAyahs.length, 0);
  
  return {
    totalSurahs,
    memorizedSurahs,
    totalAyahs,
    learningCount: data.surahs.filter(s => s.status === 'learning').length,
    reviewCount: getDueReviews().length
  };
};

export default {
  getMemorizationData,
  startMemorizing,
  markAyahMemorized,
  reviewSurah,
  getDueReviews,
  getMemorizationStats
};

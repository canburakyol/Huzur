/**
 * Education Module
 * Eğitim & Öğretim özellikleri
 */

import { lazy } from 'react';
import type { FeatureConfig, ModuleInfo } from '../core';

// Lazy-loaded components with chunk grouping
export const PrayerTeacher = lazy(() => import(/* webpackChunkName: "feature-education" */ '../../domains/prayer/components/PrayerTeacher'));
export const QuranMemorize = lazy(() => import(/* webpackChunkName: "feature-education" */ '../../domains/quran/components/QuranMemorize'));
export const TajweedTutor = lazy(() => import(/* webpackChunkName: "feature-education" */ '../../domains/education/components/TajweedTutor'));
export const NuzulExplorer = lazy(() => import(/* webpackChunkName: "feature-education" */ '../../domains/content/components/NuzulExplorer'));
export const WordByWord = lazy(() => import(/* webpackChunkName: "feature-education" */ '../../domains/quran/wordByWord/components/WordByWordShell'));
export const SeerahMap = lazy(() => import(/* webpackChunkName: "feature-education" */ '../../domains/content/components/SeerahMap'));
export const DailyIslamicQuiz = lazy(() => import(/* webpackChunkName: "feature-education" */ '../../domains/education/components/DailyIslamicQuiz'));

export const educationFeatures: Record<string, FeatureConfig> = {
  prayerTeacher: {
    component: PrayerTeacher,
    category: 'EDUCATION',
    module: 'education',
    nameKey: 'features.prayerTeacher',
    icon: '🎓'
  },
  quranMemorize: {
    component: QuranMemorize,
    category: 'EDUCATION',
    module: 'education',
    nameKey: 'features.quranMemorize',
    icon: '🧠'
  },
  tajweedTutor: {
    component: TajweedTutor,
    category: 'EDUCATION',
    module: 'education',
    nameKey: 'features.tajweedTutor',
    icon: '🔊'
  },
  nuzulExplorer: {
    component: NuzulExplorer,
    category: 'EDUCATION',
    module: 'education',
    nameKey: 'features.nuzulExplorer',
    icon: '📜',
    hasUpgrade: true
  },
  wordByWord: {
    component: WordByWord,
    category: 'EDUCATION',
    module: 'education',
    nameKey: 'features.wordByWord',
    icon: '🔤',
    hasUpgrade: true
  },
  seerahMap: {
    component: SeerahMap,
    category: 'EDUCATION',
    module: 'education',
    nameKey: 'features.seerahMap',
    icon: '🗺️'
  },
  dailyQuiz: {
    component: DailyIslamicQuiz,
    category: 'GAMIFICATION',
    module: 'education',
    nameKey: 'quiz.title',
    icon: 'star'
  }
};

export const moduleInfo: ModuleInfo = {
  nameKey: 'modules.education',
  descriptionKey: 'modules.educationDesc',
  icon: '📚',
  priority: 3,
  chunkName: 'feature-education'
};

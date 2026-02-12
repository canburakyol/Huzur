/**
 * Education Module
 * Eğitim & Öğretim özellikleri
 */

import { lazy } from 'react';

// Lazy-loaded components with chunk grouping
export const PrayerTeacher = lazy(() => import(/* webpackChunkName: "feature-education" */ '../../components/PrayerTeacher'));
export const QuranMemorize = lazy(() => import(/* webpackChunkName: "feature-education" */ '../../components/QuranMemorize'));
export const TajweedTutor = lazy(() => import(/* webpackChunkName: "feature-education" */ '../../components/TajweedTutor'));
export const NuzulExplorer = lazy(() => import(/* webpackChunkName: "feature-education" */ '../../components/NuzulExplorer'));
export const WordByWord = lazy(() => import(/* webpackChunkName: "feature-education" */ '../../components/WordByWord'));
export const SeerahMap = lazy(() => import(/* webpackChunkName: "feature-education" */ '../../components/SeerahMap'));

// Feature configuration for this module
export const educationFeatures = {
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
  }
};

// Module metadata
export const moduleInfo = {
  nameKey: 'modules.education',
  descriptionKey: 'modules.educationDesc',
  icon: '📚',
  priority: 3,
  chunkName: 'feature-education'
};

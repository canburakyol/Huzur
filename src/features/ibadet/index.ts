/**
 * Ibadet Module
 * İbadet & Zikir özellikleri
 */

import { lazy } from 'react';
import type { FeatureConfig, ModuleInfo } from '../core';

// Lazy-loaded components with chunk grouping
export const Zikirmatik = lazy(() => import(/* webpackChunkName: "feature-ibadet" */ '../../domains/ibadet/components/Zikirmatik'));
export const Adhkar = lazy(() => import(/* webpackChunkName: "feature-ibadet" */ '../../domains/ibadet/components/Adhkar'));
export const Tespihat = lazy(() => import(/* webpackChunkName: "feature-ibadet" */ '../../domains/ibadet/components/Tespihat'));
export const EsmaUlHusna = lazy(() => import(/* webpackChunkName: "feature-ibadet" */ '../../domains/ibadet/components/EsmaUlHusna'));
export const FastingTracker = lazy(() => import(/* webpackChunkName: "feature-ibadet" */ '../../domains/ibadet/components/FastingTracker'));
export const HatimCoach = lazy(() => import(/* webpackChunkName: "feature-ibadet" */ '../../domains/tools/components/HatimCoach'));
export const MissedPrayers = lazy(() => import(/* webpackChunkName: "feature-ibadet" */ '../../domains/prayer/components/MissedPrayers'));
export const DeedJournal = lazy(() => import(/* webpackChunkName: "feature-ibadet" */ '../../domains/gamification/components/DeedJournal'));
export const NafilePrayers = lazy(() => import(/* webpackChunkName: "feature-ibadet" */ '../../domains/prayer/components/NafilePrayers'));
export const DuaTracker = lazy(() => import(/* webpackChunkName: "feature-ibadet" */ '../../domains/ibadet/components/DuaTracker'));

export const ibadatFeatures: Record<string, FeatureConfig> = {
  zikirmatik: {
    component: Zikirmatik,
    category: 'IBADET',
    module: 'ibadet',
    nameKey: 'features.zikirmatik',
    icon: '📿'
  },
  adhkar: {
    component: Adhkar,
    category: 'IBADET',
    module: 'ibadet',
    nameKey: 'features.adhkar',
    icon: '🤲'
  },
  tespihat: {
    component: Tespihat,
    category: 'IBADET',
    module: 'ibadet',
    nameKey: 'features.tespihat',
    icon: '🔢'
  },
  esmaUlHusna: {
    component: EsmaUlHusna,
    category: 'IBADET',
    module: 'ibadet',
    nameKey: 'features.esmaUlHusna',
    icon: '✨'
  },
  fasting: {
    component: FastingTracker,
    category: 'IBADET',
    module: 'ibadet',
    nameKey: 'features.fasting',
    icon: '🌙'
  },
  hatimCoach: {
    component: HatimCoach,
    category: 'IBADET',
    module: 'ibadet',
    nameKey: 'features.hatimCoach',
    icon: '🎯'
  },
  missedPrayers: {
    component: MissedPrayers,
    category: 'IBADET',
    module: 'ibadet',
    nameKey: 'features.missedPrayers',
    icon: '⏰'
  },
  deedJournal: {
    component: DeedJournal,
    category: 'IBADET',
    module: 'ibadet',
    nameKey: 'features.deedJournal',
    icon: '📝'
  },
  nafilePrayers: {
    component: NafilePrayers,
    category: 'IBADET',
    module: 'ibadet',
    nameKey: 'features.nafilePrayers',
    icon: '🌙'
  },
  duaTracker: {
    component: DuaTracker,
    category: 'IBADET',
    module: 'ibadet',
    nameKey: 'features.duaTracker',
    icon: '🤲'
  }
};

export const moduleInfo: ModuleInfo = {
  nameKey: 'modules.ibadet',
  descriptionKey: 'modules.ibadatDesc',
  icon: '🤲',
  priority: 2,
  chunkName: 'feature-ibadet'
};

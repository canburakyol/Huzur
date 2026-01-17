/**
 * Ibadet Module
 * İbadet & Zikir özellikleri
 */

import { lazy } from 'react';

// Lazy-loaded components with chunk grouping
export const Zikirmatik = lazy(() => import(/* webpackChunkName: "feature-ibadet" */ '../../components/Zikirmatik'));
export const Adhkar = lazy(() => import(/* webpackChunkName: "feature-ibadet" */ '../../components/Adhkar'));
export const Tespihat = lazy(() => import(/* webpackChunkName: "feature-ibadet" */ '../../components/Tespihat'));
export const EsmaUlHusna = lazy(() => import(/* webpackChunkName: "feature-ibadet" */ '../../components/EsmaUlHusna'));
export const FastingTracker = lazy(() => import(/* webpackChunkName: "feature-ibadet" */ '../../components/FastingTracker'));
export const HatimTracker = lazy(() => import(/* webpackChunkName: "feature-ibadet" */ '../../components/HatimTracker'));
export const HatimCoach = lazy(() => import(/* webpackChunkName: "feature-ibadet" */ '../../components/HatimCoach'));
export const MissedPrayers = lazy(() => import(/* webpackChunkName: "feature-ibadet" */ '../../components/MissedPrayers'));
export const DeedJournal = lazy(() => import(/* webpackChunkName: "feature-ibadet" */ '../../components/DeedJournal'));

// Feature configuration for this module
export const ibadatFeatures = {
  zikirmatik: {
    component: Zikirmatik,
    category: 'IBADET',
    module: 'ibadet',
    name: 'Zikirmatik',
    icon: '📿'
  },
  adhkar: {
    component: Adhkar,
    category: 'IBADET',
    module: 'ibadet',
    name: 'Dualar',
    icon: '🤲'
  },
  tespihat: {
    component: Tespihat,
    category: 'IBADET',
    module: 'ibadet',
    name: 'Tesbihat',
    icon: '🔢'
  },
  esmaUlHusna: {
    component: EsmaUlHusna,
    category: 'IBADET',
    module: 'ibadet',
    name: '99 Esma',
    icon: '✨'
  },
  fasting: {
    component: FastingTracker,
    category: 'IBADET',
    module: 'ibadet',
    name: 'Oruç Takibi',
    icon: '🌙'
  },
  hatim: {
    component: HatimTracker,
    category: 'IBADET',
    module: 'ibadet',
    name: 'Hatim Takibi',
    icon: '📚'
  },
  hatimCoach: {
    component: HatimCoach,
    category: 'IBADET',
    module: 'ibadet',
    name: 'Hatim Koçu',
    icon: '🎯'
  },
  missedPrayers: {
    component: MissedPrayers,
    category: 'IBADET',
    module: 'ibadet',
    name: 'Kaza Namazları',
    icon: '⏰'
  },
  deedJournal: {
    component: DeedJournal,
    category: 'IBADET',
    module: 'ibadet',
    name: 'İyilik Günlüğü',
    icon: '📝'
  }
};

// Module metadata
export const moduleInfo = {
  name: 'İbadet & Zikir',
  description: 'Günlük ibadet pratikleri ve takip özellikleri',
  icon: '🤲',
  priority: 2,
  chunkName: 'feature-ibadet'
};

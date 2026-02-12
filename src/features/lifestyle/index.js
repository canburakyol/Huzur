/**
 * Lifestyle Module
 * Yaşam Tarzı & Kişiselleştirme özellikleri
 */

import { lazy } from 'react';

// Lazy-loaded components with chunk grouping
export const HuzurMode = lazy(() => import(/* webpackChunkName: "feature-lifestyle" */ '../../components/HuzurMode'));
export const DailyTasks = lazy(() => import(/* webpackChunkName: "feature-lifestyle" */ '../../components/DailyTasks'));
export const FamilyMode = lazy(() => import(/* webpackChunkName: "feature-lifestyle" */ '../../components/FamilyMode'));
export const IslamicMeditation = lazy(() => import(/* webpackChunkName: "feature-lifestyle" */ '../../components/IslamicMeditation'));
export const ThemeSelector = lazy(() => import(/* webpackChunkName: "feature-lifestyle" */ '../../components/ThemeSelector'));
export const FontSettings = lazy(() => import(/* webpackChunkName: "feature-lifestyle" */ '../../components/FontSettings'));
export const MuezzinSelector = lazy(() => import(/* webpackChunkName: "feature-lifestyle" */ '../../components/MuezzinSelector'));

export const StreakFeature = lazy(() => import(/* webpackChunkName: "feature-lifestyle" */ './StreakFeature'));

// Feature configuration for this module
export const lifestyleFeatures = {
  streak: {
    component: StreakFeature,
    category: 'LIFESTYLE',
    module: 'lifestyle',
    nameKey: 'features.streak',
    icon: '🔥'
  },
  huzurMode: {
    component: HuzurMode,
    category: 'LIFESTYLE',
    module: 'lifestyle',
    nameKey: 'features.huzurMode',
    icon: '🌙'
  },
  dailyTasks: {
    component: DailyTasks,
    category: 'LIFESTYLE',
    module: 'lifestyle',
    nameKey: 'features.dailyTasks',
    icon: '✅'
  },
  family: {
    component: FamilyMode,
    category: 'LIFESTYLE',
    module: 'lifestyle',
    nameKey: 'features.family',
    icon: '👨‍👩‍👧‍👦'
  },
  islamicMeditation: {
    component: IslamicMeditation,
    category: 'LIFESTYLE',
    module: 'lifestyle',
    nameKey: 'features.islamicMeditation',
    icon: '🧘'
  },
  theme: {
    component: ThemeSelector,
    category: 'LIFESTYLE',
    module: 'lifestyle',
    nameKey: 'features.theme',
    icon: '🎨'
  },
  fontSettings: {
    component: FontSettings,
    category: 'LIFESTYLE',
    module: 'lifestyle',
    nameKey: 'features.fontSettings',
    icon: '🔤'
  },
  muezzinSelector: {
    component: MuezzinSelector,
    category: 'LIFESTYLE',
    module: 'lifestyle',
    nameKey: 'features.muezzinSelector',
    icon: '🔊'
  }
};

// Module metadata
export const moduleInfo = {
  nameKey: 'modules.lifestyle',
  descriptionKey: 'modules.lifestyleDesc',
  icon: '🌙',
  priority: 7,
  chunkName: 'feature-lifestyle'
};

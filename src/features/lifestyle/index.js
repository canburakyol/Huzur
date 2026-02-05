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
    name: 'Seri Takvimi',
    icon: '🔥'
  },
  huzurMode: {
    component: HuzurMode,
    category: 'LIFESTYLE',
    module: 'lifestyle',
    name: 'Huzur Modu',
    icon: '🌙'
  },
  dailyTasks: {
    component: DailyTasks,
    category: 'LIFESTYLE',
    module: 'lifestyle',
    name: 'Günlük Görevler',
    icon: '✅'
  },
  family: {
    component: FamilyMode,
    category: 'LIFESTYLE',
    module: 'lifestyle',
    name: 'Aile Modu',
    icon: '👨‍👩‍👧‍👦'
  },
  islamicMeditation: {
    component: IslamicMeditation,
    category: 'LIFESTYLE',
    module: 'lifestyle',
    name: 'İslami Meditasyon',
    icon: '🧘'
  },
  theme: {
    component: ThemeSelector,
    category: 'LIFESTYLE',
    module: 'lifestyle',
    name: 'Tema',
    icon: '🎨'
  },
  fontSettings: {
    component: FontSettings,
    category: 'LIFESTYLE',
    module: 'lifestyle',
    name: 'Yazı Tipi',
    icon: '🔤'
  },
  muezzinSelector: {
    component: MuezzinSelector,
    category: 'LIFESTYLE',
    module: 'lifestyle',
    name: 'Müezzin Seç',
    icon: '🔊'
  }
};

// Module metadata
export const moduleInfo = {
  name: 'Yaşam Tarzı',
  description: 'Kişisel yaşam ve wellness özellikleri',
  icon: '🌙',
  priority: 7,
  chunkName: 'feature-lifestyle'
};

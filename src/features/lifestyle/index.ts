/**
 * Lifestyle Module
 * Yasam tarzi ve kisisellestirme ozellikleri
 */

import { lazy } from 'react';
import type { FeatureConfig, ModuleInfo } from '../core';

export const HuzurMode = lazy(() => import(/* webpackChunkName: "feature-lifestyle" */ '../../domains/lifestyle/components/HuzurMode'));
export const DailyTasks = lazy(() => import(/* webpackChunkName: "feature-lifestyle" */ '../../domains/ibadet/components/DailyTasks'));
export const IslamicMeditation = lazy(() => import(/* webpackChunkName: "feature-lifestyle" */ '../../domains/lifestyle/components/IslamicMeditation'));
export const ThemeSelector = lazy(() => import(/* webpackChunkName: "feature-lifestyle" */ '../../components/ThemeSelector'));
export const FontSettings = lazy(() => import(/* webpackChunkName: "feature-lifestyle" */ '../../components/FontSettings'));
export const MuezzinSelector = lazy(() => import(/* webpackChunkName: "feature-lifestyle" */ '../../domains/lifestyle/components/MuezzinSelector'));
export const StreakFeature = lazy(() => import(/* webpackChunkName: "feature-lifestyle" */ './StreakFeature'));
export const SpiritualJourney = lazy(() => import(/* webpackChunkName: "feature-lifestyle" */ '../../domains/gamification/components/SpiritualJourney'));
export const RoutineBuilder = lazy(() => import(/* webpackChunkName: "feature-lifestyle" */ '../../domains/lifestyle/components/RoutineBuilder'));

export const lifestyleFeatures: Record<string, FeatureConfig> = {
  streak: {
    component: StreakFeature,
    category: 'LIFESTYLE',
    module: 'lifestyle',
    nameKey: 'features.streak',
    icon: 'fire'
  },
  huzurMode: {
    component: HuzurMode,
    category: 'LIFESTYLE',
    module: 'lifestyle',
    nameKey: 'features.huzurMode',
    icon: 'moon'
  },
  dailyTasks: {
    component: DailyTasks,
    category: 'LIFESTYLE',
    module: 'lifestyle',
    nameKey: 'features.dailyTasks',
    icon: 'check'
  },
  islamicMeditation: {
    component: IslamicMeditation,
    category: 'LIFESTYLE',
    module: 'lifestyle',
    nameKey: 'features.islamicMeditation',
    icon: 'meditation'
  },
  theme: {
    component: ThemeSelector,
    category: 'LIFESTYLE',
    module: 'lifestyle',
    nameKey: 'features.theme',
    icon: 'palette'
  },
  fontSettings: {
    component: FontSettings,
    category: 'LIFESTYLE',
    module: 'lifestyle',
    nameKey: 'features.fontSettings',
    icon: 'font'
  },
  muezzinSelector: {
    component: MuezzinSelector,
    category: 'LIFESTYLE',
    module: 'lifestyle',
    nameKey: 'features.muezzinSelector',
    icon: 'volume'
  },
  spiritualJourney: {
    component: SpiritualJourney,
    category: 'GAMIFICATION',
    module: 'lifestyle',
    nameKey: 'journey.title',
    icon: 'trending-up'
  },
  routineBuilder: {
    component: RoutineBuilder,
    category: 'LIFESTYLE',
    module: 'lifestyle',
    nameKey: 'routine.title',
    icon: 'check-square'
  }
};

export const moduleInfo: ModuleInfo = {
  nameKey: 'modules.lifestyle',
  descriptionKey: 'modules.lifestyleDesc',
  icon: 'moon',
  priority: 7,
  chunkName: 'feature-lifestyle'
};

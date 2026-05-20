/**
 * Content Module
 * Icerik ve medya ozellikleri
 */

import { lazy } from 'react';
import type { FeatureConfig, ModuleInfo } from '../core';

// Lazy-loaded components with chunk grouping
export const Hadiths = lazy(() => import(/* webpackChunkName: "feature-content" */ '../../domains/content/components/Hadiths'));
export const Hikmetname = lazy(() => import(/* webpackChunkName: "feature-content" */ '../../domains/content/components/Hikmetname'));
export const WeeklySermon = lazy(() => import(/* webpackChunkName: "feature-content" */ '../../domains/content/components/WeeklySermon'));
export const Library = lazy(() => import(/* webpackChunkName: "feature-content" */ '../../domains/library/components/LibraryShell'));
export const QuranRadio = lazy(() => import(/* webpackChunkName: "feature-content" */ '../../domains/quran/components/QuranRadio'));
export const Multimedia = lazy(() => import(/* webpackChunkName: "feature-content" */ '../../domains/content/components/Multimedia'));
export const LiveBroadcast = lazy(() => import(/* webpackChunkName: "feature-content" */ '../../domains/content/components/LiveBroadcast'));

export const contentFeatures: Record<string, FeatureConfig> = {
  hadiths: {
    component: Hadiths,
    category: 'CONTENT',
    module: 'content',
    nameKey: 'features.hadiths',
    icon: '📜'
  },
  hikmetname: {
    component: Hikmetname,
    category: 'CONTENT',
    module: 'content',
    nameKey: 'features.hikmetname',
    icon: '💎'
  },
  weeklySermon: {
    component: WeeklySermon,
    category: 'CONTENT',
    module: 'content',
    nameKey: 'features.weeklySermon',
    icon: '🎤'
  },
  library: {
    component: Library,
    category: 'CONTENT',
    module: 'content',
    nameKey: 'features.library',
    icon: '📚',
    hasUpgrade: true
  },
  radio: {
    component: QuranRadio,
    category: 'CONTENT',
    module: 'content',
    nameKey: 'features.radio',
    icon: '📻'
  },
  multimedia: {
    component: Multimedia,
    category: 'CONTENT',
    module: 'content',
    nameKey: 'features.multimedia',
    icon: '🎬'
  },
  liveBroadcast: {
    component: LiveBroadcast,
    category: 'CONTENT',
    module: 'content',
    nameKey: 'features.liveBroadcast',
    icon: '📺'
  }
};

export const moduleInfo: ModuleInfo = {
  nameKey: 'modules.content',
  descriptionKey: 'modules.contentDesc',
  icon: '📖',
  priority: 4,
  chunkName: 'feature-content'
};

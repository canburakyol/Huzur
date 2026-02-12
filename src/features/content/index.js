/**
 * Content Module
 * İçerik & Medya özellikleri
 */

import { lazy } from 'react';

// Lazy-loaded components with chunk grouping
export const Hadiths = lazy(() => import(/* webpackChunkName: "feature-content" */ '../../components/Hadiths'));
export const Hikmetname = lazy(() => import(/* webpackChunkName: "feature-content" */ '../../components/Hikmetname'));
export const WeeklySermon = lazy(() => import(/* webpackChunkName: "feature-content" */ '../../components/WeeklySermon'));
export const Library = lazy(() => import(/* webpackChunkName: "feature-content" */ '../../components/Library'));
export const QuranRadio = lazy(() => import(/* webpackChunkName: "feature-content" */ '../../components/QuranRadio'));
export const Multimedia = lazy(() => import(/* webpackChunkName: "feature-content" */ '../../components/Multimedia'));
export const LiveBroadcast = lazy(() => import(/* webpackChunkName: "feature-content" */ '../../components/LiveBroadcast'));

// Feature configuration for this module
export const contentFeatures = {
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
    icon: '📚'
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

// Module metadata
export const moduleInfo = {
  nameKey: 'modules.content',
  descriptionKey: 'modules.contentDesc',
  icon: '📖',
  priority: 4,
  chunkName: 'feature-content'
};

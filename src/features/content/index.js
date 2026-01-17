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
    name: 'Hadisler',
    icon: '📜'
  },
  hikmetname: {
    component: Hikmetname,
    category: 'CONTENT',
    module: 'content',
    name: 'Hikmetname',
    icon: '💎'
  },
  weeklySermon: {
    component: WeeklySermon,
    category: 'CONTENT',
    module: 'content',
    name: 'Haftalık Hutbe',
    icon: '🎤'
  },
  library: {
    component: Library,
    category: 'CONTENT',
    module: 'content',
    name: 'Kütüphane',
    icon: '📚'
  },
  radio: {
    component: QuranRadio,
    category: 'CONTENT',
    module: 'content',
    name: 'Kuran Radyo',
    icon: '📻'
  },
  multimedia: {
    component: Multimedia,
    category: 'CONTENT',
    module: 'content',
    name: 'Multimedya',
    icon: '🎬'
  },
  liveBroadcast: {
    component: LiveBroadcast,
    category: 'CONTENT',
    module: 'content',
    name: 'Canlı Yayın',
    icon: '📺'
  }
};

// Module metadata
export const moduleInfo = {
  name: 'İçerik & Medya',
  description: 'İslami içerik ve medya özellikleri',
  icon: '📖',
  priority: 4,
  chunkName: 'feature-content'
};

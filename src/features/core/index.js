/**
 * Core Module
 * Temel özellikler - prayers, qibla, quran, tracker, settings
 */

import { lazy } from 'react';

// Lazy-loaded components with chunk grouping
export const Prayers = lazy(() => import(/* webpackChunkName: "feature-core" */ '../../components/Prayers'));
export const QiblaCompass = lazy(() => import(/* webpackChunkName: "feature-core" */ '../../components/QiblaCompass'));
export const Quran = lazy(() => import(/* webpackChunkName: "feature-core" */ '../../components/Quran'));
export const PrayerTracker = lazy(() => import(/* webpackChunkName: "feature-core" */ '../../components/PrayerTracker'));
export const Settings = lazy(() => import(/* webpackChunkName: "feature-core" */ '../../components/Settings'));

// Feature configuration for this module
export const coreFeatures = {
  prayers: {
    component: Prayers,
    category: 'CORE',
    module: 'core',
    nameKey: 'features.prayers',
    icon: '🕌'
  },
  qibla: {
    component: QiblaCompass,
    category: 'CORE',
    module: 'core',
    nameKey: 'features.qibla',
    icon: '🧭'
  },
  quran: {
    component: Quran,
    category: 'CORE',
    module: 'core',
    nameKey: 'features.quran',
    icon: '📖'
  },
  tracker: {
    component: PrayerTracker,
    category: 'CORE',
    module: 'core',
    nameKey: 'features.tracker',
    icon: '✓'
  },
  settings: {
    component: Settings,
    category: 'CORE',
    module: 'core',
    nameKey: 'features.settings',
    icon: '⚙️'
  }
};

// Module metadata
export const moduleInfo = {
  nameKey: 'modules.core',
  descriptionKey: 'modules.coreDesc',
  icon: '🏠',
  priority: 1,
  chunkName: 'feature-core'
};

/**
 * Core Module
 * Temel özellikler - prayers, qibla, quran, tracker, settings
 */

import { lazy, LazyExoticComponent, ComponentType } from 'react';

// Lazy-loaded components with chunk grouping
export const Prayers = lazy(() => import(/* webpackChunkName: "feature-core" */ '../../domains/prayer/components/Prayers'));
export const QiblaCompass = lazy(() => import(/* webpackChunkName: "feature-core" */ '../../domains/prayer/components/QiblaCompass'));
export const Quran = lazy(() => import(/* webpackChunkName: "feature-core" */ '../../domains/quran/components/Quran'));
export const PrayerTracker = lazy(() => import(/* webpackChunkName: "feature-core" */ '../../domains/prayer/components/PrayerTracker'));
export const Settings = lazy(() => import(/* webpackChunkName: "feature-core" */ '../../domains/settings/components/SettingsShell'));

export type FeatureCategory = 'CORE' | 'IBADET' | 'EDUCATION' | 'CONTENT' | 'TOOLS' | 'SOCIAL' | 'LIFESTYLE' | 'AI' | 'SYSTEM' | 'FAMILY' | 'GAMIFICATION';

export interface FeatureConfig {
  // Feature screens are JS components with differing props (onClose, onNavigate...).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: LazyExoticComponent<ComponentType<any>>;
  category: FeatureCategory;
  module: string;
  nameKey: string;
  icon: string;
  hasUpgrade?: boolean;
}

export interface ModuleInfo {
  nameKey: string;
  descriptionKey: string;
  icon: string;
  priority: number;
  chunkName: string;
}

export const coreFeatures: Record<string, FeatureConfig> = {
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

export const moduleInfo: ModuleInfo = {
  nameKey: 'modules.core',
  descriptionKey: 'modules.coreDesc',
  icon: '🏠',
  priority: 1,
  chunkName: 'feature-core'
};

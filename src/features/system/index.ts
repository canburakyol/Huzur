/**
 * System Module
 * Sistem yönetimi özellikleri
 */

import { lazy } from 'react';
import type { FeatureConfig, ModuleInfo } from '../core';

// Lazy-loaded components with chunk grouping
export const Support = lazy(() => import(/* webpackChunkName: "feature-system" */ '../../domains/system/components/Support'));
export const ProUpgrade = lazy(() => import(/* webpackChunkName: "feature-system" */ '../../domains/onboarding/components/ProUpgrade'));

export const systemFeatures: Record<string, FeatureConfig> = {
  support: {
    component: Support,
    category: 'SYSTEM',
    module: 'system',
    nameKey: 'features.support',
    icon: '💬'
  },
  pro: {
    component: ProUpgrade,
    category: 'SYSTEM',
    module: 'system',
    nameKey: 'features.pro',
    icon: '⭐'
  }
};

export const moduleInfo: ModuleInfo = {
  nameKey: 'modules.system',
  descriptionKey: 'modules.systemDesc',
  icon: '⚙️',
  priority: 9,
  chunkName: 'feature-system'
};

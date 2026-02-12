/**
 * System Module
 * Sistem yönetimi özellikleri
 */

import { lazy } from 'react';

// Lazy-loaded components with chunk grouping
export const Support = lazy(() => import(/* webpackChunkName: "feature-system" */ '../../components/Support'));
export const ProUpgrade = lazy(() => import(/* webpackChunkName: "feature-system" */ '../../components/ProUpgrade'));

// Feature configuration for this module
export const systemFeatures = {
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

// Module metadata
export const moduleInfo = {
  nameKey: 'modules.system',
  descriptionKey: 'modules.systemDesc',
  icon: '⚙️',
  priority: 9,
  chunkName: 'feature-system'
};

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
    name: 'Destek',
    icon: '💬'
  },
  pro: {
    component: ProUpgrade,
    category: 'SYSTEM',
    module: 'system',
    name: 'Pro Yükselt',
    icon: '⭐'
  }
};

// Module metadata
export const moduleInfo = {
  name: 'Sistem',
  description: 'Uygulama yönetimi ve destek',
  icon: '⚙️',
  priority: 9,
  chunkName: 'feature-system'
};

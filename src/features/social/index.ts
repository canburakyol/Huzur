/**
 * Social Feature Module
 * Grup Hatim ve Dua Kardeşliği
 */

import { lazy } from 'react';
import type { FeatureConfig, ModuleInfo } from '../core';

// Lazy-loaded components
export const SocialDashboard = lazy(() => import(/* webpackChunkName: "feature-social" */ '../../domains/social/components/SocialDashboard'));

export const socialFeatures: Record<string, FeatureConfig> = {
  social: {
    component: SocialDashboard,
    category: 'SOCIAL',
    module: 'social',
    nameKey: 'features.social',
    icon: '🤲'
  }
};

export const moduleInfo: ModuleInfo = {
  nameKey: 'modules.social',
  descriptionKey: 'modules.socialDesc',
  icon: '🤝',
  priority: 8,
  chunkName: 'feature-social'
};

/**
 * Social Feature Module
 * Grup Hatim ve Dua Kardeşliği
 */

import { lazy } from 'react';

// Lazy-loaded components
export const SocialDashboard = lazy(() => import(/* webpackChunkName: "feature-social" */ '../../components/social/SocialDashboard'));

// Feature configuration
export const socialFeatures = {
  social: {
    component: SocialDashboard,
    category: 'SOCIAL',
    module: 'social',
    name: 'Dua Kardeşliği',
    icon: '🤲'
  }
};

// Module metadata
export const moduleInfo = {
  name: 'Sosyal',
  description: 'Grup Hatim ve Dua İstekleri',
  icon: '🤝',
  priority: 8,
  chunkName: 'feature-social'
};

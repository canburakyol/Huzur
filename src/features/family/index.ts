/**
 * Family Module
 * Aile ve Çocuk özellikleri
 */

import { lazy } from 'react';
import type { FeatureConfig, ModuleInfo } from '../core';

// Lazy-loaded components with chunk grouping
export const FamilyDashboard = lazy(() => import(/* webpackChunkName: "feature-family" */ '../../domains/family/components/FamilyDashboard'));

export const familyFeatures: Record<string, FeatureConfig> = {
  family: {
    component: FamilyDashboard,
    category: 'FAMILY',
    module: 'family',
    nameKey: 'features.familyDashboard',
    icon: '🏡'
  }
};

export const moduleInfo: ModuleInfo = {
  nameKey: 'modules.family',
  descriptionKey: 'modules.familyDesc',
  icon: '👨‍👩‍👧‍👦',
  priority: 7,
  chunkName: 'feature-family'
};

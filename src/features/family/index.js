/**
 * Family Module
 * Aile ve Çocuk özellikleri
 */

import { lazy } from 'react';

// Lazy-loaded components with chunk grouping
export const FamilyDashboard = lazy(() => import(/* webpackChunkName: "feature-family" */ '../../components/family/FamilyDashboard'));

// Feature configuration for this module
export const familyFeatures = {
  family: {
    component: FamilyDashboard,
    category: 'FAMILY',
    module: 'family',
    name: 'Huzurlu Aile',
    icon: '🏡'
  }
};

// Module metadata
export const moduleInfo = {
  name: 'Aile & Çocuk',
  description: 'Aile ve çocuklar için özel içerikler',
  icon: '👨‍👩‍👧‍👦',
  priority: 7,
  chunkName: 'feature-family'
};

/**
 * AI Module
 * Yapay Zeka destekli özellikler
 */

import { lazy } from 'react';

// Lazy-loaded components with chunk grouping
export const Assistant = lazy(() => import(/* webpackChunkName: "feature-ai" */ '../../components/Assistant'));
export const SpiritualCoach = lazy(() => import(/* webpackChunkName: "feature-ai" */ '../../components/SpiritualCoach'));

// Feature configuration for this module
export const aiFeatures = {
  assistant: {
    component: Assistant,
    category: 'AI',
    module: 'ai',
    nameKey: 'features.assistant',
    icon: '🤖'
  },
  spiritualCoach: {
    component: SpiritualCoach,
    category: 'AI',
    module: 'ai',
    nameKey: 'features.spiritualCoach',
    icon: '🧠'
  }
};

// Module metadata
export const moduleInfo = {
  nameKey: 'modules.ai',
  descriptionKey: 'modules.aiDesc',
  icon: '🤖',
  priority: 8,
  chunkName: 'feature-ai'
};

/**
 * AI Module
 * Yapay Zeka destekli özellikler
 */

import { lazy } from 'react';
import type { FeatureConfig, ModuleInfo } from '../core';

// Lazy-loaded components with chunk grouping
export const Assistant = lazy(() => import(/* webpackChunkName: "feature-ai" */ '../../domains/assistant/components/AssistantShell'));

export const aiFeatures: Record<string, FeatureConfig> = {
  assistant: {
    component: Assistant,
    category: 'AI',
    module: 'ai',
    nameKey: 'features.assistant',
    icon: '🤖'
  },
  spiritualCoach: {
    component: Assistant,
    category: 'AI',
    module: 'ai',
    nameKey: 'features.spiritualCoach',
    icon: '🧠'
  }
};

export const moduleInfo: ModuleInfo = {
  nameKey: 'modules.ai',
  descriptionKey: 'modules.aiDesc',
  icon: '🤖',
  priority: 8,
  chunkName: 'feature-ai'
};

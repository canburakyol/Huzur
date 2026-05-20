/**
 * Tools Module
 * Yardımcı araçlar
 */

import { lazy } from 'react';
import type { FeatureConfig, ModuleInfo } from '../core';

// Lazy-loaded components with chunk grouping
export const MosqueFinder = lazy(() => import(/* webpackChunkName: "feature-tools" */ '../../domains/tools/components/MosqueFinder'));
export const ReligiousDays = lazy(() => import(/* webpackChunkName: "feature-tools" */ '../../domains/content/components/ReligiousDays'));
export const Imsakiye = lazy(() => import(/* webpackChunkName: "feature-tools" */ '../../domains/prayer/components/Imsakiye'));
export const ZakatCalculator = lazy(() => import(/* webpackChunkName: "feature-tools" */ '../../domains/ibadet/components/ZakatCalculator'));
export const Agenda = lazy(() => import(/* webpackChunkName: "feature-tools" */ '../../domains/lifestyle/components/Agenda'));
export const SpecialDaysCalendar = lazy(() => import(/* webpackChunkName: "feature-tools" */ '../../domains/tools/components/SpecialDaysCalendar'));

export const toolsFeatures: Record<string, FeatureConfig> = {
  mosque: {
    component: MosqueFinder,
    category: 'TOOLS',
    module: 'tools',
    nameKey: 'features.mosque',
    icon: '🕌'
  },
  calendar: {
    component: ReligiousDays,
    category: 'TOOLS',
    module: 'tools',
    nameKey: 'features.calendar',
    icon: '📅'
  },
  imsakiye: {
    component: Imsakiye,
    category: 'TOOLS',
    module: 'tools',
    nameKey: 'features.imsakiye',
    icon: '🌅'
  },
  zakat: {
    component: ZakatCalculator,
    category: 'TOOLS',
    module: 'tools',
    nameKey: 'features.zakat',
    icon: '💰'
  },
  agenda: {
    component: Agenda,
    category: 'TOOLS',
    module: 'tools',
    nameKey: 'features.agenda',
    icon: '📰'
  },
  specialDays: {
    component: SpecialDaysCalendar,
    category: 'TOOLS',
    module: 'tools',
    nameKey: 'features.specialDays',
    icon: '📅'
  }
};

export const moduleInfo: ModuleInfo = {
  nameKey: 'modules.tools',
  descriptionKey: 'modules.toolsDesc',
  icon: '🛠️',
  priority: 5,
  chunkName: 'feature-tools'
};

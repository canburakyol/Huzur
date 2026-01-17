/**
 * Tools Module
 * Yardımcı araçlar
 */

import { lazy } from 'react';

// Lazy-loaded components with chunk grouping
export const MosqueFinder = lazy(() => import(/* webpackChunkName: "feature-tools" */ '../../components/MosqueFinder'));
export const ReligiousDays = lazy(() => import(/* webpackChunkName: "feature-tools" */ '../../components/ReligiousDays'));
export const Imsakiye = lazy(() => import(/* webpackChunkName: "feature-tools" */ '../../components/Imsakiye'));
export const ZakatCalculator = lazy(() => import(/* webpackChunkName: "feature-tools" */ '../../components/ZakatCalculator'));
export const Agenda = lazy(() => import(/* webpackChunkName: "feature-tools" */ '../../components/Agenda'));

// Feature configuration for this module
export const toolsFeatures = {
  mosque: {
    component: MosqueFinder,
    category: 'TOOLS',
    module: 'tools',
    name: 'Cami Bul',
    icon: '🕌'
  },
  calendar: {
    component: ReligiousDays,
    category: 'TOOLS',
    module: 'tools',
    name: 'Dini Günler',
    icon: '📅'
  },
  imsakiye: {
    component: Imsakiye,
    category: 'TOOLS',
    module: 'tools',
    name: 'İmsakiye',
    icon: '🌅'
  },
  zakat: {
    component: ZakatCalculator,
    category: 'TOOLS',
    module: 'tools',
    name: 'Zekat Hesapla',
    icon: '💰'
  },
  agenda: {
    component: Agenda,
    category: 'TOOLS',
    module: 'tools',
    name: 'Gündem',
    icon: '📰'
  }
};

// Module metadata
export const moduleInfo = {
  name: 'Araçlar',
  description: 'Yardımcı araçlar ve hesaplayıcılar',
  icon: '🛠️',
  priority: 5,
  chunkName: 'feature-tools'
};

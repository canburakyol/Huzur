/**
 * Social Module
 * Sosyal & Topluluk özellikleri
 */

import { lazy } from 'react';

// Lazy-loaded components with chunk grouping
export const GreetingCards = lazy(() => import(/* webpackChunkName: "feature-social" */ '../../components/GreetingCards'));
export const ZikirWorld = lazy(() => import(/* webpackChunkName: "feature-social" */ '../../components/ZikirWorld'));
export const PrayerCircle = lazy(() => import(/* webpackChunkName: "feature-social" */ '../../components/PrayerCircle'));
export const Community = lazy(() => import(/* webpackChunkName: "feature-social" */ '../../components/Community'));

// Feature configuration for this module
export const socialFeatures = {
  greetingCards: {
    component: GreetingCards,
    category: 'SOCIAL',
    module: 'social',
    name: 'Tebrik Kartları',
    icon: '💌'
  },
  zikirWorld: {
    component: ZikirWorld,
    category: 'SOCIAL',
    module: 'social',
    name: 'Zikir Dünyası',
    icon: '🌍'
  },
  prayerCircle: {
    component: PrayerCircle,
    category: 'SOCIAL',
    module: 'social',
    name: 'Dua Halkası',
    icon: '🤝'
  },
  community: {
    component: Community,
    category: 'SOCIAL',
    module: 'social',
    name: 'Topluluk',
    icon: '👥'
  }
};

// Module metadata
export const moduleInfo = {
  name: 'Sosyal & Topluluk',
  description: 'Sosyal paylaşım ve topluluk özellikleri',
  icon: '👥',
  priority: 6,
  chunkName: 'feature-social'
};

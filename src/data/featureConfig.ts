/**
 * Feature Configuration
 *
 * Backward-compatible feature map used by the active feature overlay.
 */

import { allFeatures } from '../features';

interface FeatureEntry {
  component: React.LazyExoticComponent<() => JSX.Element>;
  category: string;
  module: string;
  hasUpgrade?: boolean;
}

export const featureConfig: Record<string, FeatureEntry> = Object.entries(allFeatures).reduce((acc, [key, config]) => {
  acc[key] = {
    component: config.component,
    category: config.category,
    module: config.module,
    ...(config.hasUpgrade && { hasUpgrade: true })
  };
  return acc;
}, {} as Record<string, FeatureEntry>);

export { allFeatures };

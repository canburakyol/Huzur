/**
 * Feature Configuration
 *
 * Backward-compatible feature map used by the active feature overlay.
 */

import { allFeatures } from '../features';

export const featureConfig = Object.entries(allFeatures).reduce((acc, [key, config]) => {
  acc[key] = {
    component: config.component,
    category: config.category,
    module: config.module,
    ...(config.hasUpgrade && { hasUpgrade: true })
  };
  return acc;
}, {});

export { allFeatures };

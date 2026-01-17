/**
 * Feature Configuration
 * 
 * This file provides backward compatibility with the legacy feature system
 * while leveraging the new modular architecture in src/features/
 * 
 * For new code, prefer importing directly from 'src/features'
 */

import { allFeatures, moduleRegistry, getModulesSortedByPriority } from '../features';

// Re-export the combined feature configuration for backward compatibility
export const featureConfig = Object.entries(allFeatures).reduce((acc, [key, config]) => {
  acc[key] = {
    component: config.component,
    category: config.category,
    module: config.module,
    ...(config.hasUpgrade && { hasUpgrade: true })
  };
  return acc;
}, {});

// Helper function to get features by module
export const getFeaturesByModule = (moduleName) => {
  const module = moduleRegistry[moduleName];
  return module ? Object.keys(module.features) : [];
};

// Helper function to get features by category
export const getFeaturesByCategory = (categoryName) => {
  return Object.entries(featureConfig)
    .filter(([, config]) => config.category === categoryName)
    .map(([key]) => key);
};

// Module definitions for backward compatibility
export const moduleDefinitions = Object.entries(moduleRegistry).reduce((acc, [key, { info }]) => {
  acc[key] = {
    name: info.name,
    icon: info.icon,
    priority: info.priority,
    chunkName: info.chunkName
  };
  return acc;
}, {});

// Re-export for convenience
export { allFeatures, moduleRegistry, getModulesSortedByPriority };

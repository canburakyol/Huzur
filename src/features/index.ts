/**
 * Features Module Registry
 *
 * This is the main entry point for all feature modules.
 * Import features from here for a clean, organized codebase.
 */

import type { FeatureConfig, ModuleInfo } from './core';

// Module exports - explicit exports to avoid namespace conflicts
export { coreFeatures, moduleInfo as coreInfo } from './core';
export { ibadatFeatures, moduleInfo as ibadatInfo } from './ibadet';
export { educationFeatures, moduleInfo as educationInfo } from './education';
export { contentFeatures, moduleInfo as contentInfo } from './content';
export { toolsFeatures, moduleInfo as toolsInfo } from './tools';
export { socialFeatures, moduleInfo as socialInfo } from './social';
export { lifestyleFeatures, moduleInfo as lifestyleInfo } from './lifestyle';
export { aiFeatures, moduleInfo as aiInfo } from './ai';
export { systemFeatures, moduleInfo as systemInfo } from './system';
export { familyFeatures, moduleInfo as familyInfo } from './family';

// Import all feature configurations
import { coreFeatures, moduleInfo as coreInfo } from './core';
import { ibadatFeatures, moduleInfo as ibadatInfo } from './ibadet';
import { educationFeatures, moduleInfo as educationInfo } from './education';
import { contentFeatures, moduleInfo as contentInfo } from './content';
import { toolsFeatures, moduleInfo as toolsInfo } from './tools';
import { socialFeatures, moduleInfo as socialInfo } from './social';
import { lifestyleFeatures, moduleInfo as lifestyleInfo } from './lifestyle';
import { aiFeatures, moduleInfo as aiInfo } from './ai';
import { systemFeatures, moduleInfo as systemInfo } from './system';
import { familyFeatures, moduleInfo as familyInfo } from './family';

// Combined feature configuration
export const allFeatures: Record<string, FeatureConfig> = {
  ...coreFeatures,
  ...ibadatFeatures,
  ...educationFeatures,
  ...contentFeatures,
  ...toolsFeatures,
  ...socialFeatures,
  ...lifestyleFeatures,
  ...aiFeatures,
  ...systemFeatures,
  ...familyFeatures
};

export interface ModuleEntry {
  features: Record<string, FeatureConfig>;
  info: ModuleInfo;
}

export interface ModuleWithKey extends ModuleEntry {
  key: string;
}

// Module registry with metadata
export const moduleRegistry: Record<string, ModuleEntry> = {
  core: {
    features: coreFeatures,
    info: coreInfo
  },
  ibadet: {
    features: ibadatFeatures,
    info: ibadatInfo
  },
  education: {
    features: educationFeatures,
    info: educationInfo
  },
  content: {
    features: contentFeatures,
    info: contentInfo
  },
  tools: {
    features: toolsFeatures,
    info: toolsInfo
  },
  social: {
    features: socialFeatures,
    info: socialInfo
  },
  lifestyle: {
    features: lifestyleFeatures,
    info: lifestyleInfo
  },
  ai: {
    features: aiFeatures,
    info: aiInfo
  },
  system: {
    features: systemFeatures,
    info: systemInfo
  },
  family: {
    features: familyFeatures,
    info: familyInfo
  }
};

// Get all modules sorted by priority
export const getModulesSortedByPriority = (): ModuleWithKey[] => {
  return Object.entries(moduleRegistry)
    .sort(([, a], [, b]) => a.info.priority - b.info.priority)
    .map(([key, value]) => ({ key, ...value }));
};

// Get features by module name
export const getFeaturesByModuleName = (moduleName: string): string[] => {
  const module = moduleRegistry[moduleName];
  return module ? Object.keys(module.features) : [];
};

// Get feature component by key
export const getFeatureComponent = (featureKey: string) => {
  return allFeatures[featureKey]?.component;
};

// Get feature config by key
export const getFeatureConfig = (featureKey: string): FeatureConfig | undefined => {
  return allFeatures[featureKey];
};

// Check if feature exists
export const hasFeature = (featureKey: string): boolean => {
  return featureKey in allFeatures;
};

// Get all feature keys
export const getAllFeatureKeys = (): string[] => {
  return Object.keys(allFeatures);
};

// Get features that require upgrade
export const getUpgradeFeatures = (): string[] => {
  return Object.entries(allFeatures)
    .filter(([, config]) => config.hasUpgrade)
    .map(([key]) => key);
};

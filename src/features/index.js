/**
 * Features Module Registry
 * 
 * This is the main entry point for all feature modules.
 * Import features from here for a clean, organized codebase.
 */

// Module exports
export * from './core';
export * from './ibadet';
export * from './education';
export * from './content';
export * from './tools';
export * from './social';
export * from './lifestyle';
export * from './ai';
export * from './system';
export * from './family';

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
export const allFeatures = {
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

// Module registry with metadata
export const moduleRegistry = {
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
export const getModulesSortedByPriority = () => {
  return Object.entries(moduleRegistry)
    .sort(([, a], [, b]) => a.info.priority - b.info.priority)
    .map(([key, value]) => ({ key, ...value }));
};

// Get features by module name
export const getFeaturesByModuleName = (moduleName) => {
  const module = moduleRegistry[moduleName];
  return module ? Object.keys(module.features) : [];
};

// Get feature component by key
export const getFeatureComponent = (featureKey) => {
  return allFeatures[featureKey]?.component;
};

// Get feature config by key
export const getFeatureConfig = (featureKey) => {
  return allFeatures[featureKey];
};

// Check if feature exists
export const hasFeature = (featureKey) => {
  return featureKey in allFeatures;
};

// Get all feature keys
export const getAllFeatureKeys = () => {
  return Object.keys(allFeatures);
};

// Get features that require upgrade
export const getUpgradeFeatures = () => {
  return Object.entries(allFeatures)
    .filter(([, config]) => config.hasUpgrade)
    .map(([key]) => key);
};

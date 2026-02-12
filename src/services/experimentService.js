import { STORAGE_KEYS } from '../constants';
import { storageService } from './storageService';

const DEFAULT_EXPERIMENTS = {
  push_copy_v1: {
    variants: ['A', 'B', 'C'],
    fallbackVariant: 'A'
  },
  share_cta_v1: {
    variants: ['A', 'B', 'C'],
    fallbackVariant: 'A'
  },
  onboarding_headline_v1: {
    variants: ['A', 'B'],
    fallbackVariant: 'A'
  }
};

// FNV-1a hash: better distribution than djb2 for short strings
const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

const hashString = (value = '') => {
  let hash = FNV_OFFSET_BASIS;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME);
  }
  return (hash >>> 0); // Ensure unsigned 32-bit integer
};

const readAssignments = () => {
  return storageService.getItem(STORAGE_KEYS.EXPERIMENT_ASSIGNMENTS, {});
};

const writeAssignments = (assignments) => {
  storageService.setItem(STORAGE_KEYS.EXPERIMENT_ASSIGNMENTS, assignments || {});
};

const getOrCreateUnitSeed = () => {
  const existing = storageService.getString(STORAGE_KEYS.EXPERIMENT_UNIT_SEED, '');
  if (existing) return existing;

  const created = `exp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  storageService.setString(STORAGE_KEYS.EXPERIMENT_UNIT_SEED, created);
  return created;
};

const resolveVariantDeterministically = (experimentKey, variants, seed) => {
  if (!Array.isArray(variants) || variants.length === 0) return 'A';
  const hash = hashString(`${experimentKey}:${seed}`);
  return variants[hash % variants.length];
};

const normalizeVariant = (variant, variants, fallbackVariant) => {
  if (variant && variants.includes(variant)) return variant;
  if (fallbackVariant && variants.includes(fallbackVariant)) return fallbackVariant;
  return variants[0] || 'A';
};

export const getExperimentConfig = (experimentKey) => {
  return DEFAULT_EXPERIMENTS[experimentKey] || {
    variants: ['A'],
    fallbackVariant: 'A'
  };
};

export const getExperimentVariant = (experimentKey) => {
  const config = getExperimentConfig(experimentKey);
  const assignments = readAssignments();
  const savedVariant = assignments?.[experimentKey]?.variant;
  if (savedVariant && config.variants.includes(savedVariant)) {
    return savedVariant;
  }

  const seed = getOrCreateUnitSeed();
  const resolved = normalizeVariant(
    resolveVariantDeterministically(experimentKey, config.variants, seed),
    config.variants,
    config.fallbackVariant
  );

  const next = {
    ...assignments,
    [experimentKey]: {
      variant: resolved,
      assignedAt: new Date().toISOString()
    }
  };
  writeAssignments(next);
  return resolved;
};

export const setExperimentVariant = (experimentKey, variant) => {
  const config = getExperimentConfig(experimentKey);
  const normalized = normalizeVariant(variant, config.variants, config.fallbackVariant);
  const assignments = readAssignments();
  const next = {
    ...assignments,
    [experimentKey]: {
      variant: normalized,
      assignedAt: new Date().toISOString(),
      forced: true
    }
  };
  writeAssignments(next);
  return normalized;
};

export const getExperimentAssignments = () => {
  return readAssignments();
};

export const clearExperimentAssignments = () => {
  storageService.removeItem(STORAGE_KEYS.EXPERIMENT_ASSIGNMENTS);
};

export default {
  getExperimentVariant,
  setExperimentVariant,
  getExperimentAssignments,
  clearExperimentAssignments,
  getExperimentConfig
};

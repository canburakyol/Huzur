import { STORAGE_KEYS } from '../constants';
import { storageService } from './storageService';
import { logExperimentAssigned } from './analyticsService';

interface ExperimentConfig {
  variants: string[];
  fallbackVariant: string;
}

interface ExperimentAssignment {
  variant: string;
  assignedAt: string;
  forced?: boolean;
}

interface ExperimentAssignments {
  [key: string]: ExperimentAssignment;
}

interface ExperimentDefinition {
  variants: string[];
  fallbackVariant: string;
}

const DEFAULT_EXPERIMENTS: Record<string, ExperimentDefinition> = {
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
  },
  onboarding_goal_step_v1: {
    variants: ['A', 'B'],
    fallbackVariant: 'A'
  },
  paywall_value_stack_v1: {
    variants: ['A', 'B'],
    fallbackVariant: 'A'
  },
  paywall_cta_v1: {
    variants: ['A', 'B'],
    fallbackVariant: 'A'
  },
  home_layout_v1: {
    variants: ['A', 'B'],
    fallbackVariant: 'A'
  }
};

const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

const hashString = (value = ''): number => {
  let hash = FNV_OFFSET_BASIS;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME);
  }
  return (hash >>> 0);
};

const readAssignments = (): ExperimentAssignments => {
  return storageService.getItem<ExperimentAssignments>(STORAGE_KEYS.EXPERIMENT_ASSIGNMENTS, {}) || {};
};

const writeAssignments = (assignments: ExperimentAssignments): void => {
  storageService.setItem(STORAGE_KEYS.EXPERIMENT_ASSIGNMENTS, assignments || {});
};

const getOrCreateUnitSeed = (): string => {
  const existing = storageService.getString(STORAGE_KEYS.EXPERIMENT_UNIT_SEED, '');
  if (existing) return existing;

  const created = `exp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  storageService.setString(STORAGE_KEYS.EXPERIMENT_UNIT_SEED, created);
  return created;
};

const resolveVariantDeterministically = (experimentKey: string, variants: string[], seed: string): string => {
  if (!Array.isArray(variants) || variants.length === 0) return 'A';
  const hash = hashString(`${experimentKey}:${seed}`);
  return variants[hash % variants.length];
};

const normalizeVariant = (variant: string | null | undefined, variants: string[], fallbackVariant: string): string => {
  if (variant && variants.includes(variant)) return variant;
  if (fallbackVariant && variants.includes(fallbackVariant)) return fallbackVariant;
  return variants[0] || 'A';
};

export const getExperimentConfig = (experimentKey: string): ExperimentConfig => {
  return DEFAULT_EXPERIMENTS[experimentKey] || {
    variants: ['A'],
    fallbackVariant: 'A'
  };
};

export const getExperimentVariant = (experimentKey: string): string => {
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

  const next: ExperimentAssignments = {
    ...assignments,
    [experimentKey]: {
      variant: resolved,
      assignedAt: new Date().toISOString()
    }
  };
  writeAssignments(next);
  logExperimentAssigned(experimentKey, resolved, 'experiment_service');
  return resolved;
};

export const setExperimentVariant = (experimentKey: string, variant: string): string => {
  const config = getExperimentConfig(experimentKey);
  const normalized = normalizeVariant(variant, config.variants, config.fallbackVariant);
  const assignments = readAssignments();
  const next: ExperimentAssignments = {
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

export const getExperimentAssignments = (): ExperimentAssignments => {
  return readAssignments();
};

export const clearExperimentAssignments = (): void => {
  storageService.removeItem(STORAGE_KEYS.EXPERIMENT_ASSIGNMENTS);
};

export default {
  getExperimentVariant,
  setExperimentVariant,
  getExperimentAssignments,
  clearExperimentAssignments,
  getExperimentConfig
};

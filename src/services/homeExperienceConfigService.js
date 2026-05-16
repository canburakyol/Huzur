import { getRemoteConfigInstance } from './firebase';
import { getExperimentVariant } from './experimentService';
import { logExperimentAssigned } from './analyticsService';
import { logger } from '../utils/logger';

export const HOME_EXPERIENCE_REMOTE_KEY = 'home_experience_v1';

export const DEFAULT_HOME_EXPERIENCE_CONFIG = Object.freeze({
  enabled: true,
  source: 'default',
  variant: 'recovery_v1',
  experimentKey: 'home_layout_v1',
  experimentVariant: 'A',
  quickAccessEnabled: true,
  priorityCardEnabled: true,
  recoveryCardEnabled: true,
  aiRecommendationEnabled: true,
  featureGridEnabled: true,
  dailyContentEnabled: true,
  dailyQuestsEnabled: true,
});

const VARIANT_PRESETS = {
  recovery_v1: {},
  classic_safe: {
    recoveryCardEnabled: false,
    aiRecommendationEnabled: false,
  },
  minimal_safe: {
    priorityCardEnabled: false,
    recoveryCardEnabled: false,
    aiRecommendationEnabled: false,
    dailyContentEnabled: false,
  },
};

const normalizeBoolean = (value, fallback) => (
  typeof value === 'boolean' ? value : fallback
);

const normalizeVariant = (value, experimentVariant) => {
  if (['recovery_v1', 'classic_safe', 'minimal_safe'].includes(value)) return value;
  return experimentVariant === 'B' ? 'classic_safe' : DEFAULT_HOME_EXPERIENCE_CONFIG.variant;
};

export const normalizeHomeExperienceConfig = (value = {}, experimentVariant = 'A') => {
  const source = value && typeof value === 'object' ? value : {};
  const enabled = normalizeBoolean(source.enabled, DEFAULT_HOME_EXPERIENCE_CONFIG.enabled);
  const variant = enabled
    ? normalizeVariant(source.variant, experimentVariant)
    : 'minimal_safe';
  const preset = VARIANT_PRESETS[variant] || {};
  const base = {
    ...DEFAULT_HOME_EXPERIENCE_CONFIG,
    ...preset,
    source: source.source || DEFAULT_HOME_EXPERIENCE_CONFIG.source,
    enabled,
    variant,
    experimentVariant,
  };

  return {
    ...base,
    quickAccessEnabled: normalizeBoolean(source.quickAccessEnabled, base.quickAccessEnabled),
    priorityCardEnabled: normalizeBoolean(source.priorityCardEnabled, base.priorityCardEnabled),
    recoveryCardEnabled: normalizeBoolean(source.recoveryCardEnabled, base.recoveryCardEnabled),
    aiRecommendationEnabled: normalizeBoolean(source.aiRecommendationEnabled, base.aiRecommendationEnabled),
    featureGridEnabled: normalizeBoolean(source.featureGridEnabled, base.featureGridEnabled),
    dailyContentEnabled: normalizeBoolean(source.dailyContentEnabled, base.dailyContentEnabled),
    dailyQuestsEnabled: normalizeBoolean(source.dailyQuestsEnabled, base.dailyQuestsEnabled),
  };
};

const parseRemoteJson = (rawValue) => {
  if (!rawValue) return null;
  try {
    const parsed = JSON.parse(rawValue);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (error) {
    logger.warn('[HomeExperience] Invalid Remote Config JSON', error);
    return null;
  }
};

export const loadHomeExperienceConfig = async () => {
  const experimentVariant = getExperimentVariant(DEFAULT_HOME_EXPERIENCE_CONFIG.experimentKey);
  logExperimentAssigned(DEFAULT_HOME_EXPERIENCE_CONFIG.experimentKey, experimentVariant, 'home_experience_config');

  try {
    const { remoteConfig, fetchAndActivate, getValue } = await getRemoteConfigInstance();
    if (!remoteConfig || !fetchAndActivate || !getValue) {
      return normalizeHomeExperienceConfig({ source: 'local_fallback' }, experimentVariant);
    }

    await fetchAndActivate(remoteConfig);
    const rawValue = getValue(remoteConfig, HOME_EXPERIENCE_REMOTE_KEY).asString();
    const remoteConfigValue = parseRemoteJson(rawValue);
    return normalizeHomeExperienceConfig({
      ...(remoteConfigValue || {}),
      source: remoteConfigValue ? 'remote_config' : 'remote_empty',
    }, experimentVariant);
  } catch (error) {
    logger.warn('[HomeExperience] Failed to load config', error);
    return normalizeHomeExperienceConfig({ source: 'remote_error' }, experimentVariant);
  }
};

export default {
  DEFAULT_HOME_EXPERIENCE_CONFIG,
  HOME_EXPERIENCE_REMOTE_KEY,
  loadHomeExperienceConfig,
  normalizeHomeExperienceConfig,
};

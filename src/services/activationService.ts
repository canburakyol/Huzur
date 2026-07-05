import { STORAGE_KEYS } from '../constants';
import {
  logFirstActivationFeatureOpened,
  logFirstPrayerActionCompleted,
} from './analyticsService';
import { markFirstIbadahCompletedForReferral } from './referralService';
import { storageService } from './storageService';
import { getStoredPrimaryGoal } from '../utils/primaryGoal';

export const FIRST_IBADAH_ACTION_COMPLETED_EVENT = 'huzur:first-ibadah-action-completed';

const ACTIVATION_FEATURES = new Set([
  'dailyTasks',
  'routineBuilder',
  'quran',
  'zikirmatik',
  'duaTracker',
  'adhkar',
  'tespihat',
]);

type ActivationResult = {
  marked: boolean;
  reason: string | null;
  source?: string;
};

const normalizeSource = (source: string | undefined | null): string => {
  if (typeof source !== 'string' || source.trim().length === 0) {
    return 'unknown';
  }

  return source.trim();
};

const buildActionSource = ({ source, feature }: { source?: string; feature?: string | null } = {}): string => {
  const normalizedSource = normalizeSource(source);
  return feature ? `${normalizedSource}:${feature}` : normalizedSource;
};

const buildActivationAnalyticsContext = (stage: string): Record<string, unknown> => ({
  activation_stage: stage,
  primary_goal: getStoredPrimaryGoal(),
});

const notifyFirstIbadahActionCompleted = (detail: ActivationResult): void => {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') {
    return;
  }

  window.dispatchEvent(new CustomEvent(FIRST_IBADAH_ACTION_COMPLETED_EVENT, { detail }));
};

export const isActivationFeature = (feature: string): boolean => ACTIVATION_FEATURES.has(feature);

export const hasCompletedFirstActivationAction = (): boolean => {
  return (
    storageService.getBoolean(STORAGE_KEYS.FIRST_ACTIVATION_FEATURE_OPENED, false)
    || storageService.getBoolean(STORAGE_KEYS.FIRST_IBADAH_ACTION_DONE, false)
  );
};

export const hasCompletedFirstIbadahAction = (): boolean => {
  return storageService.getBoolean(STORAGE_KEYS.FIRST_IBADAH_ACTION_DONE, false);
};

export const markFirstActivationAction = ({ feature, source = 'feature_open' }: { feature: string; source?: string } = {}): ActivationResult => {
  if (!isActivationFeature(feature)) {
    return {
      marked: false,
      reason: 'non_activation_feature',
    };
  }

  if (hasCompletedFirstActivationAction()) {
    return {
      marked: false,
      reason: 'already_completed',
    };
  }

  const actionSource = buildActionSource({ source, feature });
  storageService.setBoolean(STORAGE_KEYS.FIRST_ACTIVATION_FEATURE_OPENED, true);
  logFirstActivationFeatureOpened(feature, actionSource, buildActivationAnalyticsContext('feature_opened'));

  return {
    marked: true,
    reason: null,
    source: actionSource,
  };
};

export const markFirstIbadahActionCompleted = ({ feature = null, source = 'spiritual_action' }: { feature?: string | null; source?: string } = {}): ActivationResult => {
  if (hasCompletedFirstIbadahAction()) {
    return {
      marked: false,
      reason: 'already_completed',
    };
  }

  const actionSource = buildActionSource({ source, feature });
  storageService.setBoolean(STORAGE_KEYS.FIRST_IBADAH_ACTION_DONE, true);
  storageService.setBoolean(STORAGE_KEYS.FIRST_ACTIVATION_FEATURE_OPENED, true);
  logFirstPrayerActionCompleted(actionSource, buildActivationAnalyticsContext('ibadah_completed'));
  markFirstIbadahCompletedForReferral();

  const result = {
    marked: true,
    reason: null,
    source: actionSource,
  };

  notifyFirstIbadahActionCompleted(result);

  return result;
};

export default {
  FIRST_IBADAH_ACTION_COMPLETED_EVENT,
  hasCompletedFirstActivationAction,
  hasCompletedFirstIbadahAction,
  isActivationFeature,
  markFirstIbadahActionCompleted,
  markFirstActivationAction,
};

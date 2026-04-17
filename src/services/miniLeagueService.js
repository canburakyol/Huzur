import { httpsCallable } from 'firebase/functions';
import { doc, getDoc } from 'firebase/firestore';
import { db, getFunctionsInstance } from './firebase';
import { getCurrentUserIdEnsured } from './authService';
import { storageService } from './storageService';
import { logger } from '../utils/logger';

const COLLECTION_USERS = 'users';
const STORAGE_KEY = 'huzur_mini_league_preferences';
const CALLABLE_NAME = 'updateMiniLeaguePreferences';

export const DEFAULT_MINI_LEAGUE_PREFERENCES = {
  optedIn: false,
  visibilityMode: 'private'
};

const sanitizeVisibilityMode = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (['private', 'group', 'league'].includes(normalized)) {
    return normalized;
  }
  return DEFAULT_MINI_LEAGUE_PREFERENCES.visibilityMode;
};

const sanitizePreferences = (value = {}) => ({
  optedIn: value?.optedIn === true,
  visibilityMode: sanitizeVisibilityMode(value?.visibilityMode)
});

const persistLocalPreferences = (preferences) => {
  storageService.setItem(STORAGE_KEY, preferences);
};

const readLocalPreferences = () => {
  try {
    return sanitizePreferences(storageService.getItem(STORAGE_KEY, DEFAULT_MINI_LEAGUE_PREFERENCES));
  } catch (error) {
    logger.error('[MiniLeagueService] getStoredPreferences failed', error);
    return { ...DEFAULT_MINI_LEAGUE_PREFERENCES };
  }
};

export const getMiniLeaguePreferences = async () => {
  const userId = await getCurrentUserIdEnsured();
  if (!userId) {
    return readLocalPreferences();
  }

  try {
    const userDoc = await getDoc(doc(db, COLLECTION_USERS, userId));
    const remote = sanitizePreferences(userDoc.data()?.socialPreferences?.miniLeague);
    persistLocalPreferences(remote);
    return remote;
  } catch (error) {
    logger.warn('[MiniLeague] Falling back to local preferences:', error);
    return readLocalPreferences();
  }
};

export const updateMiniLeaguePreferences = async (updates = {}) => {
  const userId = await getCurrentUserIdEnsured();
  const current = await getMiniLeaguePreferences();
  const next = sanitizePreferences({
    ...current,
    ...updates
  });

  persistLocalPreferences(next);

  if (!userId) {
    return next;
  }

  try {
    const functions = await getFunctionsInstance();
    const callable = httpsCallable(functions, CALLABLE_NAME);
    await callable({
      preferences: next
    });
  } catch (error) {
    logger.error('[MiniLeague] Failed to persist preferences:', error);
    throw error;
  }

  return next;
};

export const buildMiniLeagueSnapshot = (weeklySummary, preferences = DEFAULT_MINI_LEAGUE_PREFERENCES) => {
  const safePreferences = sanitizePreferences(preferences);
  const score = Number(weeklySummary?.consistencyScore) || 0;

  if (!safePreferences.optedIn) {
    return {
      enabled: false,
      visibilityMode: safePreferences.visibilityMode,
      titleKey: 'socialRetention.closedTitle',
      descriptionKey: 'socialRetention.closedDesc',
      ctaKey: 'socialRetention.closedCta'
    };
  }

  let percentile = 82;
  let bandKey = 'socialRetention.band_warmup';
  let encouragementKey = 'socialRetention.encouragement_warmup';
  let standingKey = 'socialRetention.standing_rising';

  if (score >= 85) {
    percentile = 18;
    bandKey = 'socialRetention.band_top';
    encouragementKey = 'socialRetention.encouragement_top';
    standingKey = 'socialRetention.standing_top_quarter';
  } else if (score >= 65) {
    percentile = 34;
    bandKey = 'socialRetention.band_balanced';
    encouragementKey = 'socialRetention.encouragement_balanced';
    standingKey = 'socialRetention.standing_upper_half';
  } else if (score >= 40) {
    percentile = 58;
    bandKey = 'socialRetention.band_rising';
    encouragementKey = 'socialRetention.encouragement_rising';
  }

  const leagueSize = 18;

  return {
    enabled: true,
    visibilityMode: safePreferences.visibilityMode,
    weekKey: weeklySummary?.weekKey || null,
    percentile,
    bandKey,
    encouragementKey,
    leagueSize,
    standingKey,
    ctaKey: 'socialRetention.manageCta'
  };
};

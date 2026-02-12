import { storageService } from '../services/storageService';
import { STORAGE_KEYS } from '../constants';

export const INTENT_SEGMENTS = {
  PRAYER: 'prayer_focus',
  QURAN: 'quran_focus',
  HABIT: 'habit_focus'
};

const DEFAULT_ORDER = ['prayer_banner', 'daily_content', 'stories', 'feature_grid'];

const SEGMENTED_HOME_ORDER = {
  [INTENT_SEGMENTS.PRAYER]: ['prayer_banner', 'daily_content', 'feature_grid', 'stories'],
  [INTENT_SEGMENTS.QURAN]: ['daily_content', 'prayer_banner', 'stories', 'feature_grid'],
  [INTENT_SEGMENTS.HABIT]: ['stories', 'prayer_banner', 'daily_content', 'feature_grid']
};

export const getUserIntentSegment = () => {
  return storageService.getString(STORAGE_KEYS.USER_INTENT_SEGMENT, INTENT_SEGMENTS.PRAYER);
};

export const setUserIntentSegment = (segment) => {
  const valid = Object.values(INTENT_SEGMENTS).includes(segment) ? segment : INTENT_SEGMENTS.PRAYER;
  storageService.setString(STORAGE_KEYS.USER_INTENT_SEGMENT, valid);
  return valid;
};

export const getHomeFeedOrderByIntent = (segment = null) => {
  const currentSegment = segment || getUserIntentSegment();
  return SEGMENTED_HOME_ORDER[currentSegment] || DEFAULT_ORDER;
};

export default {
  INTENT_SEGMENTS,
  getUserIntentSegment,
  setUserIntentSegment,
  getHomeFeedOrderByIntent
};

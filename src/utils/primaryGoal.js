import { STORAGE_KEYS } from '../constants';
import { storageService } from '../services/storageService';

export const PRIMARY_GOALS = {
  prayer_rhythm: {
    id: 'prayer_rhythm',
    label: 'Namaz ve 2 dakikalik ritim',
    icon: 'Prayer',
    homeAction: {
      feature: 'dailyTasks',
      title: 'Bugunun ibadet ritmini kur',
      description: 'Bir vakit hatirlatmasi ve kisa bir gunluk adimla bugunu bos gecirme.',
      cta: '2 dakikalik adimi ac'
    }
  },
  quran_learning: {
    id: 'quran_learning',
    label: 'Kuran ve dua ritmi',
    icon: 'BookOpen',
    homeAction: {
      feature: 'dailyQuiz',
      title: 'Bugun Kuran ile kisa bir bag kur',
      description: 'Uzun bir ders degil; sadece 2 dakikalik okuma, dua veya bilgi adimi.',
      cta: 'Kisa adimi ac'
    }
  },
  family_consistency: {
    id: 'family_consistency',
    label: 'Ailece gunluk ritim',
    icon: 'Users',
    homeAction: {
      feature: 'family',
      title: 'Ailece bugunun kucuk adimini sec',
      description: 'Aile hedefini buyutmeden, bugun gorunur bir ibadet ritmi baslat.',
      cta: 'Aile ritmini ac'
    }
  }
};

export const DEFAULT_PRIMARY_GOAL = 'prayer_rhythm';

const LEGACY_GOAL_MAP = {
  prayer: 'prayer_rhythm',
  quran: 'quran_learning',
  zikir: 'prayer_rhythm',
  dua: 'quran_learning',
  family: 'family_consistency'
};

export const normalizePrimaryGoal = (value) => {
  const normalized = String(value || '').trim();
  if (PRIMARY_GOALS[normalized]) {
    return normalized;
  }

  return LEGACY_GOAL_MAP[normalized] || DEFAULT_PRIMARY_GOAL;
};

export const getStoredPrimaryGoal = () => {
  const storedGoal = storageService.getString(STORAGE_KEYS.USER_PRIMARY_GOAL, DEFAULT_PRIMARY_GOAL);
  return normalizePrimaryGoal(storedGoal);
};

export const setStoredPrimaryGoal = (goalId) => {
  const normalized = normalizePrimaryGoal(goalId);
  storageService.setString(STORAGE_KEYS.USER_PRIMARY_GOAL, normalized);
  return normalized;
};

export const getPrimaryGoalConfig = (goalId) => {
  return PRIMARY_GOALS[normalizePrimaryGoal(goalId)] || PRIMARY_GOALS[DEFAULT_PRIMARY_GOAL];
};

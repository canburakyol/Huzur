import { STORAGE_KEYS } from '../constants';
import { storageService } from '../services/storageService';

export const PRIMARY_GOALS = {
  prayer_rhythm: {
    id: 'prayer_rhythm',
    label: 'Namaz ve gunluk ritim',
    icon: 'Prayer',
    homeAction: {
      feature: 'dailyTasks',
      title: 'Bugunun ritmini kur',
      description: 'Gunluk gorevlerini tamamlayip ibadet duzenini bugunden sabitle.',
      cta: 'Gunluk gorevlere git'
    }
  },
  quran_learning: {
    id: 'quran_learning',
    label: 'Kuran ve ogrenme',
    icon: 'BookOpen',
    homeAction: {
      feature: 'dailyQuiz',
      title: 'Bugun bir bilgi adimi at',
      description: 'Gunluk quiz ile hizli basla, sonra Kuran ve egitim ozelliklerine gec.',
      cta: 'Gunluk testi ac'
    }
  },
  family_consistency: {
    id: 'family_consistency',
    label: 'Ailece istikrar kurmak',
    icon: 'Users',
    homeAction: {
      feature: 'family',
      title: 'Aile ritmini canli tut',
      description: 'Haftalik aile hedefine bugun kucuk bir katki yap ve ilerlemeyi gorunur kil.',
      cta: 'Aile ekranina git'
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

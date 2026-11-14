import { STORAGE_KEYS } from '../constants';
import { storageService } from '../services/storageService';

type HomeAction = {
  feature: string;
  title: string;
  description: string;
  cta: string;
};

type PrimaryGoal = {
  id: string;
  label: string;
  icon: string;
  homeAction: HomeAction;
};

export const PRIMARY_GOALS: Record<string, PrimaryGoal> = {
  prayer_rhythm: {
    id: 'prayer_rhythm',
    label: 'Namaz ve günlük ibadet',
    icon: 'Prayer',
    homeAction: {
      feature: 'dailyTasks',
      title: 'Bugünün ibadetine başla',
      description: 'Namaz, zikir ve kısa bir dua ile güne düzen kat.',
      cta: 'Başla'
    }
  },
  quran_learning: {
    id: 'quran_learning',
    label: "Kur'an ve dua",
    icon: 'BookOpen',
    homeAction: {
      feature: 'quran',
      title: "Bugün Kur'an ve dua ile başla",
      description: 'Kısa bir okuma ve bir dua yeter.',
      cta: "Kur'an'ı aç"
    }
  },
  family_consistency: {
    id: 'family_consistency',
    label: 'Ailece ibadet',
    icon: 'Users',
    homeAction: {
      feature: 'dailyTasks',
      title: 'Bugün ailece bir adım atın',
      description: 'Birlikte bir namaz, dua ya da zikir hedefi belirleyin.',
      cta: 'Başla'
    }
  }
};

export const DEFAULT_PRIMARY_GOAL = 'prayer_rhythm';

const LEGACY_GOAL_MAP: Record<string, string> = {
  prayer: 'prayer_rhythm',
  quran: 'quran_learning',
  zikir: 'prayer_rhythm',
  dua: 'quran_learning',
  family: 'family_consistency'
};

export const normalizePrimaryGoal = (value: string | undefined | null): string => {
  const normalized = String(value || '').trim();
  if (PRIMARY_GOALS[normalized]) {
    return normalized;
  }

  return LEGACY_GOAL_MAP[normalized] || DEFAULT_PRIMARY_GOAL;
};

export const getStoredPrimaryGoal = (): string => {
  const storedGoal = storageService.getString(STORAGE_KEYS.USER_PRIMARY_GOAL, DEFAULT_PRIMARY_GOAL);
  return normalizePrimaryGoal(storedGoal);
};

export const setStoredPrimaryGoal = (goalId: string): string => {
  const normalized = normalizePrimaryGoal(goalId);
  storageService.setString(STORAGE_KEYS.USER_PRIMARY_GOAL, normalized);
  return normalized;
};

export const getPrimaryGoalConfig = (goalId: string | undefined | null): PrimaryGoal => {
  return PRIMARY_GOALS[normalizePrimaryGoal(goalId)] || PRIMARY_GOALS[DEFAULT_PRIMARY_GOAL];
};

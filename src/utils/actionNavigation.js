import { useAppStore } from '../stores/useAppStore';

const ACTION_ROUTE_MAP = {
  '/': { tab: 'home' },
  '/ayet': { feature: 'quran' },
  '/kuran': { feature: 'quran' },
  '/hadis': { feature: 'hadiths' },
  '/esma': { feature: 'esmaUlHusna' },
  '/dualar': { feature: 'duaTracker' },
  '/dua-share': { tab: 'community' },
  '/hikmetname': { feature: 'hikmetname' },
  '/kible': { feature: 'qibla' },
  '/zikirmatik': { feature: 'zikirmatik' },
  '/daily-quiz': { feature: 'dailyQuiz' },
  '/routine-builder': { feature: 'routineBuilder' },
  '/spiritual-journey': { feature: 'spiritualJourney' }
};

const ACTION_PROGRESS_MAP = {
  '/': { type: 'utility', subType: 'prayer_times', amount: 1 },
  '/kible': { type: 'utility', subType: 'qibla', amount: 1 }
};

export const emitProgressForAction = (action) => {
  const detail = ACTION_PROGRESS_MAP[action];
  if (detail) {
    const store = useAppStore.getState();
    store.updateQuestProgress(detail.type, detail.subType, detail.amount);
  }
};

export const navigateFromAction = (action, onNavigate) => {
  if (!action) return false;

  emitProgressForAction(action);

  const config = ACTION_ROUTE_MAP[action];

  if (!config) {
    if (typeof onNavigate === 'function') {
      onNavigate(action);
      return true;
    }
    return false;
  }

  if (config.feature) {
    if (typeof onNavigate === 'function') {
      onNavigate(config.feature);
    } else {
      useAppStore.getState().setActiveFeature(config.feature);
    }
    return true;
  }

  if (config.tab) {
    useAppStore.getState().setActiveTab(config.tab);
    return true;
  }

  return false;
};

export const resolveActionTarget = (action) => ACTION_ROUTE_MAP[action] || null;

export { ACTION_ROUTE_MAP };

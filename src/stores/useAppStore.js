import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storageService } from '../services/storageService';
import { STORAGE_KEYS } from '../constants';

// ─── Custom storage adapter for Zustand persist (uses storageService) ───
const zustandStorage = {
  getItem: (name) => {
    try {
      const value = storageService.getItem(name, null);
      return value ? JSON.stringify(value) : null;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      storageService.setItem(name, JSON.parse(value));
    } catch {
      // ignore
    }
  },
  removeItem: (name) => {
    try {
      storageService.removeItem(name);
    } catch {
      // ignore
    }
  },
};

// ─── Settings Slice ───
const createSettingsSlice = (set) => ({
  settings: {
    language: storageService.getString(STORAGE_KEYS.APP_LANGUAGE) || 'tr',
    theme: storageService.getString(STORAGE_KEYS.THEME) || 'light',
    accentColor: storageService.getString('app_accent_color') || 'amber',
    notifications: true,
    stickyNotification: storageService.getBoolean(STORAGE_KEYS.STICKY_NOTIFICATION) || false,
  },

  setLanguage: (lang) =>
    set((state) => {
      storageService.setString(STORAGE_KEYS.APP_LANGUAGE, lang);
      return { settings: { ...state.settings, language: lang } };
    }),

  setTheme: (theme) =>
    set((state) => {
      storageService.setString(STORAGE_KEYS.THEME, theme);
      return { settings: { ...state.settings, theme } };
    }),

  setAccentColor: (accentId) =>
    set((state) => {
      storageService.setString('app_accent_color', accentId);
      return { settings: { ...state.settings, accentColor: accentId } };
    }),

  setNotifications: (enabled) =>
    set((state) => ({
      settings: { ...state.settings, notifications: enabled },
    })),

  setStickyNotification: (enabled) =>
    set((state) => {
      storageService.setBoolean(STORAGE_KEYS.STICKY_NOTIFICATION, enabled);
      return { settings: { ...state.settings, stickyNotification: enabled } };
    }),
});

// ─── Focus Slice ───
const createFocusSlice = (set) => ({
  isFocusMode: false,
  toggleFocusMode: () => set((state) => ({ isFocusMode: !state.isFocusMode })),
  enableFocusMode: () => set({ isFocusMode: true }),
  disableFocusMode: () => set({ isFocusMode: false }),
});

// ─── Time Slice ───
const computeTimeState = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { period: 'morning', greeting: 'greeting.morning' };
  if (hour >= 12 && hour < 15) return { period: 'noon', greeting: 'greeting.noon' };
  if (hour >= 15 && hour < 18) return { period: 'afternoon', greeting: 'greeting.afternoon' };
  if (hour >= 18 && hour < 22) return { period: 'evening', greeting: 'greeting.evening' };
  return { period: 'night', greeting: 'greeting.night' };
};

const createTimeSlice = (set) => ({
  timeOfDay: computeTimeState().period,
  greetingKey: computeTimeState().greeting,
  refreshTimeState: () => {
    const ts = computeTimeState();
    set({ timeOfDay: ts.period, greetingKey: ts.greeting });
  },
});

// ─── Toast Slice ───
const createToastSlice = (set) => ({
  toasts: [],
  showToast: (message, type = 'info', duration = 4000) =>
    set((state) => {
      const id = Date.now() + Math.random();
      const next = [...state.toasts, { id, message, type, duration }];
      return { toasts: next.length > 3 ? next.slice(-3) : next };
    }),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
});

// ─── Gamification Slice ───
const createGamificationSlice = (set) => ({
  points: 0,
  level: null,
  earnedBadges: [],
  badgeDetails: [],
  showLevelUp: false,
  dailyQuests: { date: '', quests: [] },
  dailyQuestsLoaded: false,

  setPoints: (points) => set({ points }),
  setBadges: (badges) => set({ earnedBadges: badges }),
  setShowLevelUp: (show) => set({ showLevelUp: show }),
  setDailyQuests: (quests) => set({ dailyQuests: quests, dailyQuestsLoaded: true }),

  updatePoints: (appliedAmount) =>
    set((state) => ({
      points: state.points + appliedAmount,
    })),

  addBadge: (badgeId) =>
    set((state) => {
      if (!state.earnedBadges.includes(badgeId)) {
        return { earnedBadges: [...state.earnedBadges, badgeId] };
      }
      return state;
    }),

  updateQuestProgress: (type, subType, amount = 1) =>
    set((state) => {
      let updated = false;
      const newQuests = state.dailyQuests.quests.map((q) => {
        if (q.completed) return q;
        const typeMatch = q.type === type;
        const subTypeMatch = !subType || !q.subType || q.subType === subType;
        if (typeMatch && subTypeMatch) {
          const newProgress = Math.min(q.progress + amount, q.target);
          if (newProgress !== q.progress) {
            updated = true;
            const isCompleted = newProgress >= q.target;
            return { ...q, progress: newProgress, completed: isCompleted };
          }
        }
        return q;
      });
      if (!updated) return state;
      return { dailyQuests: { ...state.dailyQuests, quests: newQuests } };
    }),

  claimQuestReward: (questId, addPointsFn) =>
    set((state) => {
      const quest = state.dailyQuests.quests.find((q) => q.id === questId);
      if (quest && quest.completed && !quest.isClaimed) {
        addPointsFn(quest.xp, { source: 'daily_quest_reward' });
        const newQuests = state.dailyQuests.quests.map((q) =>
          q.id === questId ? { ...q, isClaimed: true } : q
        );
        return { dailyQuests: { ...state.dailyQuests, quests: newQuests } };
      }
      return state;
    }),

  refreshQuests: (getRandomQuests) =>
    set(() => ({
      dailyQuests: { date: new Date().toDateString(), quests: getRandomQuests() },
    })),
});

// ─── Navigation Slice ───
const createNavigationSlice = (set) => ({
  activeFeature: null,
  activeTab: 'home',
  showHamburgerMenu: false,
  showMoodSelector: false,
  showSplash: !sessionStorage.getItem('splashShown'),
  showInviteModal: false,
  inviteModalContext: { source: 'invite_modal' },

  setActiveFeature: (feature) => set({ activeFeature: feature }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setShowHamburgerMenu: (show) => set({ showHamburgerMenu: show }),
  setShowMoodSelector: (show) => set({ showMoodSelector: show }),
  hideSplash: () => {
    sessionStorage.setItem('splashShown', 'true');
    set({ showSplash: false });
  },
  openInviteModal: (context = { source: 'invite_modal' }) => {
    const safeContext =
      typeof context === 'string'
        ? { source: context }
        : context && typeof context === 'object'
          ? context
          : { source: 'invite_modal' };
    set({ showInviteModal: true, inviteModalContext: safeContext });
  },
  closeInviteModal: () => set({ showInviteModal: false }),
});

// ─── Pro Status Slice ───
const createProSlice = (set) => ({
  isProUser: false,
  setIsProUser: (active) => set({ isProUser: active }),
});

// ─── Family Slice (placeholder — migrated later) ───
const createFamilySlice = (set) => ({
  family: null,
  publicFamilies: [],
  weeklyGoal: null,
  weeklyGoalLoading: false,
  familyLoading: false,
  familyError: null,

  setFamily: (family) => set({ family }),
  setPublicFamilies: (families) => set({ publicFamilies: families }),
  setWeeklyGoal: (goal) => set({ weeklyGoal: goal }),
  setFamilyLoading: (loading) => set({ familyLoading: loading }),
  setFamilyError: (error) => set({ familyError: error }),
  setWeeklyGoalLoading: (loading) => set({ weeklyGoalLoading: loading }),
});

// ─── Prayer Slice (placeholder — migrated later) ───
const createPrayerSlice = (set) => ({
  prayerTimes: null,
  nextPrayer: null,
  setPrayerTimes: (times) => set({ prayerTimes: times }),
  setNextPrayer: (prayer) => set({ nextPrayer: prayer }),
});

// ─── Combined Store ───
export const useAppStore = create(
  persist(
    (...a) => ({
      ...createSettingsSlice(...a),
      ...createFocusSlice(...a),
      ...createTimeSlice(...a),
      ...createToastSlice(...a),
      ...createGamificationSlice(...a),
      ...createNavigationSlice(...a),
      ...createProSlice(...a),
      ...createFamilySlice(...a),
      ...createPrayerSlice(...a),
    }),
    {
      name: 'huzur-app-store',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        settings: state.settings,
        isFocusMode: state.isFocusMode,
        dailyQuests: state.dailyQuests,
        dailyQuestsLoaded: state.dailyQuestsLoaded,
      }),
    }
  )
);

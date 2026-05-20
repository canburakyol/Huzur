import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { storageService } from "../services/storageService";

import {
  Toast,
  Quest,
  DailyQuests,
  InviteModalContext,
  Settings,
  Family,
  WeeklyGoal,
  PrayerTimes,
  NextPrayer,
  AppStoreState,
} from "./slices/types";

export type {
  Toast,
  Quest,
  DailyQuests,
  InviteModalContext,
  Settings,
  Family,
  WeeklyGoal,
  PrayerTimes,
  NextPrayer,
  AppStoreState,
};

import { createSettingsSlice } from "./slices/settingsSlice";
import { createFocusSlice } from "./slices/focusSlice";
import { createTimeSlice } from "./slices/timeSlice";
import { createToastSlice } from "./slices/toastSlice";
import { createGamificationSlice } from "./slices/gamificationSlice";
import { createNavigationSlice } from "./slices/navigationSlice";
import { createProSlice } from "./slices/proSlice";
import { createFamilySlice } from "./slices/familySlice";
import { createPrayerSlice } from "./slices/prayerSlice";

const zustandStorage = {
  getItem: (name: string): string | null => {
    try {
      const value = storageService.getItem(name, null);
      return value ? JSON.stringify(value) : null;
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      storageService.setItem(name, JSON.parse(value));
    } catch {
      // ignore
    }
  },
  removeItem: (name: string): void => {
    try {
      storageService.removeItem(name);
    } catch {
      // ignore
    }
  },
};

export const useAppStore = create<AppStoreState>()(
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
      name: "huzur-app-store",
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state: AppStoreState) => ({
        settings: state.settings,
        isFocusMode: state.isFocusMode,
        dailyQuests: state.dailyQuests,
        dailyQuestsLoaded: state.dailyQuestsLoaded,
      }),
    }
  )
);
export default useAppStore;

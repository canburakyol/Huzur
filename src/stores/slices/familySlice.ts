import { StateCreator } from "zustand";
import { AppStoreState, FamilySlice, Family, WeeklyGoal } from "./types";

export const createFamilySlice: StateCreator<
  AppStoreState,
  [],
  [],
  FamilySlice
> = (set) => ({
  family: null,
  publicFamilies: [] as Family[],
  weeklyGoal: null,
  weeklyGoalLoading: false,
  familyLoading: false,
  familyError: null,

  setFamily: (family: Family | null) => set({ family }),
  setPublicFamilies: (families: Family[]) => set({ publicFamilies: families }),
  setWeeklyGoal: (goal: WeeklyGoal | null) => set({ weeklyGoal: goal }),
  setFamilyLoading: (loading: boolean) => set({ familyLoading: loading }),
  setFamilyError: (error: string | null) => set({ familyError: error }),
  setWeeklyGoalLoading: (loading: boolean) => set({ weeklyGoalLoading: loading }),
});

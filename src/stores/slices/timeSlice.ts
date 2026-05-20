import { StateCreator } from "zustand";
import { AppStoreState, TimeSlice } from "./types";

const computeTimeState = (): { period: string; greeting: string } => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { period: "morning", greeting: "greeting.morning" };
  if (hour >= 12 && hour < 15) return { period: "noon", greeting: "greeting.noon" };
  if (hour >= 15 && hour < 18) return { period: "afternoon", greeting: "greeting.afternoon" };
  if (hour >= 18 && hour < 22) return { period: "evening", greeting: "greeting.evening" };
  return { period: "night", greeting: "greeting.night" };
};

export const createTimeSlice: StateCreator<
  AppStoreState,
  [],
  [],
  TimeSlice
> = (set) => ({
  timeOfDay: computeTimeState().period,
  greetingKey: computeTimeState().greeting,
  refreshTimeState: () => {
    const ts = computeTimeState();
    set({ timeOfDay: ts.period, greetingKey: ts.greeting });
  },
});

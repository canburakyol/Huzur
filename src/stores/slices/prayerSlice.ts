import { StateCreator } from "zustand";
import { AppStoreState, PrayerSlice, PrayerTimes, NextPrayer } from "./types";

export const createPrayerSlice: StateCreator<
  AppStoreState,
  [],
  [],
  PrayerSlice
> = (set) => ({
  prayerTimes: null,
  nextPrayer: null,
  setPrayerTimes: (times: PrayerTimes | null) => set({ prayerTimes: times }),
  setNextPrayer: (prayer: NextPrayer | null) => set({ nextPrayer: prayer }),
});
